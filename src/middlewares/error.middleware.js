import { HttpError } from '../utils/httpError.js';

const errorResponse = (res, statusCode, message, extra) => {
  res.status(statusCode).json({
    status: 'error',
    message,
    ...extra
  });
};

export const notFoundHandler = (req, res) => {
  errorResponse(res, 404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`);
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const respond = (statusCode, message) => {
    if (statusCode >= 500) {
      console.error(err.stack);
    }
    return errorResponse(res, statusCode, message);
  };

  if (err instanceof SyntaxError && err.status === 400) {
    return respond(400, 'El cuerpo de la solicitud no es JSON válido');
  }

  if (err.name === 'CastError') {
    return respond(400, 'El ID proporcionado no tiene un formato válido');
  }

  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return respond(400, err.message);
  }

  if (err.code === 11000) {
    return respond(400, 'Ya existe un registro con esos datos');
  }

  if (err instanceof HttpError) {
    return respond(err.statusCode, err.message);
  }

  return respond(500, 'Error interno del servidor');
};
