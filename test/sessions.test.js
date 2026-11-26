import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, test } from 'node:test';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import User from '../src/models/User.js';
import { hashPassword, verifyPassword } from '../src/utils/hash.js';
import { signToken } from '../src/utils/jwt.js';

let server;
let baseUrl;
const previousEnv = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  NODE_ENV: process.env.NODE_ENV
};

before(async () => {
  process.env.JWT_SECRET = `${randomUUID()}${randomUUID()}`;
  delete process.env.JWT_EXPIRES_IN;
  process.env.NODE_ENV = 'test';
  server = await new Promise(resolve => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  try {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  } finally {
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
});

const register = async body => {
  const response = await fetch(`${baseUrl}/api/sessions/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  return { status: response.status, body: await response.json() };
};

const validUser = {
  first_name: 'Ana',
  last_name: 'Pérez',
  email: 'Ana@Mail.com ',
  password: 'Secreta123'
};

test('registra con email normalizado, rol seguro y contraseña hasheada sin exponerla', async t => {
  t.mock.method(User, 'findOne', async ({ email }) => {
    assert.equal(email, 'ana@mail.com');
    return null;
  });
  let stored;
  t.mock.method(User, 'create', async data => {
    stored = new User(data);
    await stored.validate();
    return stored;
  });

  const response = await register({ ...validUser, role: 'admin' });
  assert.equal(response.status, 201);
  assert.deepEqual(response.body, {
    status: 'success',
    payload: {
      id: stored.id,
      first_name: 'Ana',
      last_name: 'Pérez',
      email: 'ana@mail.com',
      role: 'user'
    }
  });
  assert.notEqual(stored.password, validUser.password);
  assert.equal(await verifyPassword(validUser.password, stored.password), true);
  assert.equal(JSON.stringify(response.body).includes(stored.password), false);
});

test('rechaza campos faltantes, valores inválidos, email inválido y contraseñas inseguras', async () => {
  const cases = [
    { ...validUser, first_name: '' },
    { ...validUser, last_name: '   ' },
    { ...validUser, email: null },
    { ...validUser, password: 12345678 },
    { ...validUser, email: 'ana@correo' },
    { ...validUser, email: 'ana@.com' },
    { ...validUser, email: 'ana..perez@mail.com' },
    { ...validUser, password: 'corta' },
    { ...validUser, password: 'á'.repeat(37) }
  ];
  for (const body of cases) {
    const response = await register(body);
    assert.equal(response.status, 400);
    assert.equal(response.body.status, 'error');
  }
});

test('rechaza emails duplicados, incluso si ocurre una inserción concurrente', async t => {
  const find = t.mock.method(User, 'findOne', async () => ({ email: 'ana@mail.com' }));
  let response = await register(validUser);
  assert.equal(response.status, 409);
  assert.equal(response.body.message, 'El email ya está registrado');

  find.mock.mockImplementation(async () => null);
  t.mock.method(User, 'create', async () => {
    const error = new Error('duplicate key');
    error.code = 11000;
    error.keyPattern = { email: 1 };
    throw error;
  });
  response = await register(validUser);
  assert.equal(response.status, 409);
  assert.equal(response.body.message, 'El email ya está registrado');
});

const sessionRequest = async (path, { body, cookie, method = 'GET' } = {}) => {
  const response = await fetch(`${baseUrl}/api/sessions/${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(cookie === undefined ? {} : { cookie })
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  return {
    status: response.status,
    body: await response.json(),
    cookie: response.headers.get('set-cookie')
  };
};

const assertCookieFlags = (cookie, secure) => {
  assert.match(cookie, /;\s*HttpOnly/i);
  assert.match(cookie, /;\s*SameSite=Lax/i);
  assert.match(cookie, /;\s*Path=\//i);
  assert.equal(/;\s*Secure(?:;|$)/i.test(cookie), secure);
};

test('registro → login → current → logout → current conserva la sesión y no expone contraseña', async t => {
  let stored;
  t.mock.method(User, 'findOne', ({ email }) => {
    assert.equal(email, 'ana@mail.com');
    if (!stored) return Promise.resolve(null);
    return {
      select(selection) {
        assert.equal(selection, '+password');
        return Promise.resolve(stored);
      }
    };
  });
  t.mock.method(User, 'create', async data => {
    stored = new User(data);
    await stored.validate();
    return stored;
  });
  const registered = await register({ ...validUser, role: 'admin' });
  assert.equal(registered.status, 201);
  assert.equal(registered.body.payload.role, 'user');
  assert.equal('password' in registered.body.payload, false);

  const loggedIn = await sessionRequest('login', { method: 'POST', body: validUser });
  assert.equal(loggedIn.status, 200);
  assert.deepEqual(loggedIn.body, { status: 'success', message: 'Login correcto' });
  assertCookieFlags(loggedIn.cookie, false);
  assert.match(loggedIn.cookie, /;\s*Max-Age=3600(?:;|$)/);
  const cookie = loggedIn.cookie.split(';')[0];
  const token = decodeURIComponent(cookie.slice('currentUser='.length));
  const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  assert.deepEqual(Object.keys(payload).sort(), ['email', 'exp', 'iat', 'id', 'role']);
  assert.equal(payload.exp - payload.iat, 3600);

  const current = await sessionRequest('current', { cookie });
  assert.equal(current.status, 200);
  assert.deepEqual(current.body, {
    status: 'success',
    payload: { id: stored.id, email: stored.email, role: 'user' }
  });

  const loggedOut = await sessionRequest('logout', { method: 'POST', cookie });
  assert.equal(loggedOut.status, 200);
  assert.deepEqual(loggedOut.body, { status: 'success', message: 'Sesión cerrada' });
  assertCookieFlags(loggedOut.cookie, false);
  assert.match(loggedOut.cookie, /^currentUser=;/);
  const expires = loggedOut.cookie.match(/Expires=([^;]+)/)[1];
  assert.ok(Date.parse(expires) < Date.now());
  const afterLogout = await sessionRequest('current', { cookie: loggedOut.cookie.split(';')[0] });
  assert.equal(afterLogout.status, 401);
  assert.deepEqual(afterLogout.body, { status: 'error', message: 'No autenticado' });
});

test('login no distingue entre email inexistente y contraseña incorrecta', async t => {
  const password = await hashPassword(validUser.password);
  t.mock.method(User, 'findOne', ({ email }) => ({
    select: async () => email === 'ana@mail.com'
      ? new User({ ...validUser, email, password })
      : null
  }));
  for (const body of [
    { email: 'inexistente@mail.com', password: validUser.password },
    { email: validUser.email, password: 'Incorrecta123' }
  ]) {
    const response = await sessionRequest('login', { method: 'POST', body });
    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { status: 'error', message: 'Credenciales inválidas' });
    assert.equal(response.cookie, null);
  }
});

test('login rechaza campos ausentes o inválidos antes de consultar MongoDB', async t => {
  const find = t.mock.method(User, 'findOne', () => assert.fail('No debe consultar MongoDB'));
  for (const body of [
    {}, { email: validUser.email }, { password: validUser.password },
    { email: null, password: validUser.password },
    { email: 'no-es-email', password: validUser.password },
    { email: validUser.email, password: 123 },
    { email: validUser.email, password: '   ' },
    { email: validUser.email, password: 'x'.repeat(73) }
  ]) {
    const response = await sessionRequest('login', { method: 'POST', body });
    assert.equal(response.status, 400);
    assert.equal(response.body.status, 'error');
    assert.equal(response.cookie, null);
  }
  assert.equal(find.mock.callCount(), 0);
});

test('current rechaza cookies ausentes, tokens manipulados, expirados o payloads inválidos', async () => {
  const user = { id: '665f2a000000000000000000', email: 'ana@mail.com', role: 'user' };
  const token = signToken(user);
  const parts = token.split('.');
  parts[1] = Buffer.from(JSON.stringify({ ...user, role: 'admin' })).toString('base64url');
  const expired = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: -1 });
  const invalidPayload = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const wrongAlgorithm = jwt.sign(user, process.env.JWT_SECRET, { algorithm: 'HS384', expiresIn: '1h' });
  for (const cookie of [
    undefined, `currentUser=${parts.join('.')}`, `currentUser=${expired}`,
    `currentUser=${invalidPayload}`, `currentUser=${wrongAlgorithm}`, 'currentUser=malformado'
  ]) {
    const response = await sessionRequest('current', { cookie });
    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { status: 'error', message: 'No autenticado' });
  }
});

test('login y logout usan Secure en producción y respetan JWT_EXPIRES_IN', async t => {
  process.env.NODE_ENV = 'production';
  process.env.JWT_EXPIRES_IN = '2h';
  t.after(() => {
    process.env.NODE_ENV = 'test';
    delete process.env.JWT_EXPIRES_IN;
  });
  const user = new User({ ...validUser, password: await hashPassword(validUser.password) });
  t.mock.method(User, 'findOne', () => ({ select: async () => user }));
  const response = await sessionRequest('login', { method: 'POST', body: validUser });
  assert.equal(response.status, 200);
  assertCookieFlags(response.cookie, true);
  assert.match(response.cookie, /;\s*Max-Age=3600(?:;|$)/);
  const token = decodeURIComponent(response.cookie.split(';')[0].slice('currentUser='.length));
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  assert.equal(payload.exp - payload.iat, 7200);
  const loggedOut = await sessionRequest('logout', { method: 'POST' });
  assert.equal(loggedOut.status, 200);
  assertCookieFlags(loggedOut.cookie, true);
});

test('persiste el registro en MongoDB y rechaza duplicados', {
  skip: !process.env.TEST_MONGO_URL && 'Definir TEST_MONGO_URL para probar con MongoDB real'
}, async () => {
  const email = `registro-${randomUUID()}@example.com`;
  let created = false;
  try {
    await connectDatabase(process.env.TEST_MONGO_URL);
    await User.init();
    const response = await register({ ...validUser, email: ` ${email.toUpperCase()} `, role: 'admin' });
    created = response.status === 201;
    assert.equal(response.status, 201);
    assert.equal(response.body.payload.email, email);
    assert.equal(response.body.payload.role, 'user');
    assert.equal('password' in response.body.payload, false);

    const stored = await User.collection.findOne({ email });
    assert.ok(stored);
    assert.notEqual(stored.password, validUser.password);
    assert.equal(await verifyPassword(validUser.password, stored.password), true);
    assert.equal((await register({ ...validUser, email })).status, 409);
  } finally {
    if (created) {
      await User.collection.deleteOne({ email });
    }
    await disconnectDatabase();
  }
});
