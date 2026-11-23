import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, test } from 'node:test';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import { verifyPassword } from '../src/utils/hash.js';

let server;
let baseUrl;

before(async () => {
  server = await new Promise(resolve => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
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

test('persiste el registro en MongoDB y rechaza duplicados', {
  skip: !process.env.TEST_MONGO_URL && 'Definir TEST_MONGO_URL para probar con MongoDB real'
}, async () => {
  const email = `registro-${randomUUID()}@example.com`;
  let created = false;
  try {
    await mongoose.connect(process.env.TEST_MONGO_URL);
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
    await mongoose.disconnect();
  }
});
