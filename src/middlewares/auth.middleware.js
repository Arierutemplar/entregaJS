import { usersRepository } from '../container.js';
import { HttpError } from '../utils/httpError.js';
import { verifyToken } from '../utils/jwt.js';

const readCookie = (header, name) => {
  if (!header) return null;

  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }

  return null;
};

const readToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return readCookie(req.headers.cookie, 'token');
};

export const authenticate = async (req, res, next) => {
  try {
    const token = readToken(req);
    if (!token) {
      throw new HttpError(401, 'No autorizado. Inicia sesión para continuar.');
    }

    const payload = verifyToken(token);
    const user = await usersRepository.getById(payload.sub);
    if (!user) {
      throw new HttpError(401, 'No autorizado. Inicia sesión para continuar.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'CastError') {
      return next(new HttpError(401, 'Token inválido o expirado'));
    }
    next(error);
  }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new HttpError(403, 'No tienes permisos para esta operación'));
  }
  next();
};
