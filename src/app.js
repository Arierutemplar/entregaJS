import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import servicesRouter from './routes/services.router.js';
import bookingsRouter from './routes/bookings.router.js';
import viewsRouter from './routes/views.router.js';
import { setSocketServer } from './utils/socket.js';
import { registerBookingSocketHandlers } from './sockets/bookings.socket.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
setSocketServer(io);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.engine('handlebars', engine({
  layoutsDir: path.join(__dirname, 'views/layouts'),
  defaultLayout: 'main',
  helpers: { eq: (a, b) => a === b }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/views', viewsRouter);
app.post('/api/evaluate', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Evaluación recibida correctamente' });
});

io.on('connection', registerBookingSocketHandlers);

app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
    error: err.message
  });
});

export default app;
export { httpServer, io };