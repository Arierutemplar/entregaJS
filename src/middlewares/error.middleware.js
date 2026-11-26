import { HttpError } from '../utils/httpError.js';

const errorResponse = (res, statusCode, message) => {
  res.status(statusCode).json({
    status: 'error',
    message
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
    if (statusCode >= 500 && process.env.NODE_ENV === 'production') {
      message = 'Error interno del servidor';
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
    return respond(400, process.env.NODE_ENV === 'production'
      ? 'Los datos proporcionados no son válidos'
      : err.message);
  }

  if (err.code === 11000) {
    return respond(400, 'Ya existe un registro con esos datos');
  }

  const statusCode = [err.statusCode, err.status].find(status =>
    Number.isInteger(status) && status >= 400 && status <= 599
  ) ?? 500;
  const message = err instanceof HttpError || (statusCode < 500 && err.expose === true)
    ? err.message
    : 'Error interno del servidor';
  return respond(statusCode, message);
};
