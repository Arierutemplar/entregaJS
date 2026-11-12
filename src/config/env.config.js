import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;
const MONGO_URI = process.env.MONGO_URI;

if (!PORT || !NODE_ENV || !MONGO_URI) {
  console.error('Faltan variables de entorno requeridas (PORT, NODE_ENV o MONGO_URI). Revisa tu archivo .env');
  process.exit(1);
}

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && NODE_ENV === 'production') {
  console.error('Falta JWT_SECRET. Es obligatorio en producción.');
  process.exit(1);
}

if (!jwtSecret) {
  console.warn("JWT_SECRET no está definido. Se usa una clave solo para desarrollo.");
}

export default {
  port: PORT,
  nodeEnv: NODE_ENV,
  mongoUri: MONGO_URI,
  jwtSecret: jwtSecret || 'dev-only-jwt-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'Turnos y Reservas <no-reply@turnos.local>'
  }
};
