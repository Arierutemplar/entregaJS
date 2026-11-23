import isEmail from 'validator/lib/isEmail.js';
import * as usersRepository from '../repositories/users.repository.js';
import { hashPassword } from '../utils/hash.js';
import { HttpError } from '../utils/httpError.js';

export const registerUser = async body => {
  const { first_name, last_name, email, password } = body || {};
  if ([first_name, last_name, email, password].some(value =>
    typeof value !== 'string' || !value.trim()
  )) {
    throw new HttpError(400, 'Faltan campos obligatorios');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!isEmail(normalizedEmail)) {
    throw new HttpError(400, 'El formato del email es inválido');
  }
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new HttpError(400, 'La contraseña debe tener al menos 8 caracteres y no superar 72 bytes');
  }

  if (await usersRepository.findByEmail(normalizedEmail)) {
    throw new HttpError(409, 'El email ya está registrado');
  }

  let user;
  try {
    user = await usersRepository.createUser({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: await hashPassword(password)
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      throw new HttpError(409, 'El email ya está registrado');
    }
    throw error;
  }

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role
  };
};
