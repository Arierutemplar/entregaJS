import express from 'express';
import servicesRouter from './routes/services.router.js';
import bookingsRouter from './routes/bookings.router.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas principales
app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);

// Middleware 404 para rutas inexistentes
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Middleware centralizado de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
    error: err.message
  });
});

export default app;