import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;
const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!PORT || !NODE_ENV || !MONGO_URL || !JWT_SECRET) {
  console.error('Faltan variables de entorno requeridas (PORT, NODE_ENV, MONGO_URL, JWT_SECRET). Revisa tu archivo .env');
  process.exit(1);
}

export default {
  port: Number(PORT),
  nodeEnv: NODE_ENV,
  mongoUrl: MONGO_URL,
  jwtSecret: JWT_SECRET,
  jwtExpiresIn: JWT_EXPIRES_IN
};
