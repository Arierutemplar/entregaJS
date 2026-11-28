import { verifyToken } from '../utils/jwt.js';
import { HttpError } from '../utils/httpError.js';

export const authenticate = (req, res, next) => {
  try {
    const token = req.cookies?.currentUser;
    if (typeof token !== 'string' || !token) {
      throw new HttpError(401, 'No autenticado');
    }
    req.user = verifyToken(token);
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new HttpError(401, 'No autenticado'));
  }
  if (!allowedRoles.includes(req.user.role)) {
    return next(new HttpError(403, 'Acceso prohibido'));
  }
  next();
};
