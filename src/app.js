import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import servicesRouter from './routes/services.router.js';
import bookingsRouter from './routes/bookings.router.js';
import viewsRouter from './routes/views.router.js';
import authRouter from './routes/auth.router.js';
import usersRouter from './routes/users.router.js';
import healthRouter from './routes/health.router.js';
import { setSocketServer } from './utils/socket.js';
import { registerBookingSocketHandlers } from './sockets/bookings.socket.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { apiRateLimiter } from './middlewares/rateLimit.middleware.js';
import { setupSwagger } from './config/swagger.js';

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

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'ws:', 'wss:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: null
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRateLimiter);
setupSwagger(app);
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/views', viewsRouter);
app.post('/api/evaluate', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Evaluación recibida correctamente' });
});

io.on('connection', registerBookingSocketHandlers);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
export { httpServer, io };