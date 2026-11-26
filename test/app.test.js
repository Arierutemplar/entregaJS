import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import app from '../src/app.js';
import User from '../src/models/User.js';
import { errorHandler } from '../src/middlewares/error.middleware.js';
import { HttpError } from '../src/utils/httpError.js';

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

test('GET /api/health confirma que el servidor está activo', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', message: 'Servidor activo' });
});

test('GET /api/events devuelve la lista inicial de eventos', async () => {
  const response = await fetch(`${baseUrl}/api/events`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'success', payload: [] });
});

test('app responde con un JSON controlado para rutas inexistentes', async () => {
  const response = await fetch(`${baseUrl}/api/no-existe`);
  assert.equal(response.status, 404);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await response.json(), {
    status: 'error',
    message: 'Ruta no encontrada: GET /api/no-existe'
  });
});

test('app controla JSON inválido y conserva el estado 413 del parser', async () => {
  for (const [body, status] of [['{', 400], [JSON.stringify({ data: 'x'.repeat(110000) }), 413]]) {
    const response = await fetch(`${baseUrl}/api/sessions/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body
    });
    assert.equal(response.status, status);
    const result = await response.json();
    assert.equal(result.status, 'error');
    assert.equal(typeof result.message, 'string');
    assert.equal('stack' in result, false);
  }
});

test('app centraliza errores inesperados y oculta errores internos conocidos en producción', async t => {
  const previousEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  t.after(() => {
    if (previousEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousEnv;
    }
  });
  const log = t.mock.method(console, 'error', () => {});
  const find = t.mock.method(User, 'findOne');

  const cases = [
    [new Error('Detalles internos sensibles'), 500, 'Error interno del servidor'],
    [new HttpError(503, 'Detalles internos sensibles'), 503, 'Error interno del servidor'],
    [Object.assign(new Error('Datos internos sensibles'), { name: 'ValidationError' }), 400, 'Los datos proporcionados no son válidos']
  ];
  for (const [error, status, message] of cases) {
    find.mock.mockImplementation(async () => { throw error; });
    const response = await fetch(`${baseUrl}/api/sessions/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        first_name: 'Ana',
        last_name: 'Perez',
        email: 'ana@example.com',
        password: 'Secreta123'
      })
    });
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), {
      status: 'error',
      message
    });
  }
  assert.equal(log.mock.callCount(), 2);
});

test('errorHandler respeta status/statusCode válidos y descarta estados inválidos', t => {
  t.mock.method(console, 'error', () => {});
  const cases = [
    [new HttpError(409, 'Conflicto'), 409, 'Conflicto'],
    [Object.assign(new Error('No autorizado'), { status: 401, expose: true }), 401, 'No autorizado'],
    [Object.assign(new Error('Detalle privado'), { statusCode: 502 }), 502, 'Error interno del servidor'],
    [Object.assign(new Error('Estado inválido'), { statusCode: 200 }), 500, 'Error interno del servidor'],
    [Object.assign(new Error('Estado inválido'), { status: 700 }), 500, 'Error interno del servidor']
  ];
  for (const [error, expectedStatus, message] of cases) {
    const res = {
      status(code) {
        assert.equal(code, expectedStatus);
        return this;
      },
      json(body) {
        assert.deepEqual(body, { status: 'error', message });
      }
    };
    errorHandler(error, {}, res, () => assert.fail('No debe delegar la respuesta'));
  }
});

test('errorHandler delega si la respuesta ya comenzó', () => {
  const error = new Error('Respuesta iniciada');
  errorHandler(error, {}, { headersSent: true }, received => assert.equal(received, error));
});
