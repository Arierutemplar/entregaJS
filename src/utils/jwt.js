import jwt from 'jsonwebtoken';
import { HttpError } from './httpError.js';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new HttpError(500, 'JWT_SECRET no está configurado');
  }
  return secret;
};

export const signToken = ({ id, email, role }) => jwt.sign(
  { id, email, role },
  getSecret(),
  { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
);

export const verifyToken = token => {
  const secret = getSecret();
  let payload;
  try {
    payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError ||
        error instanceof jwt.NotBeforeError) {
      throw new HttpError(401, 'No autenticado');
    }
    throw error;
  }
  if (typeof payload !== 'object' || payload === null ||
      typeof payload.id !== 'string' || !payload.id ||
      typeof payload.email !== 'string' || !payload.email ||
      !['user', 'organizer', 'admin'].includes(payload.role)) {
    throw new HttpError(401, 'No autenticado');
  }
  return { id: payload.id, email: payload.email, role: payload.role };
};
