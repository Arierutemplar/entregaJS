export function sessionErrorHandler(err, req, res, next) {
  const status = err.status || 400;
  res.status(status).json({
    status: 'error',
    error: err.message || 'Error en sesiones',
  });
}
