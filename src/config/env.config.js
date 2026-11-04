import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;
const MONGO_URI = process.env.MONGO_URI;

if (!PORT || !NODE_ENV || !MONGO_URI) {
  console.error("❌ Error crítico: Faltan variables de entorno requeridas (PORT, NODE_ENV o MONGO_URI). Revisa tu archivo .env");
  process.exit(1);
}

export default {
  port: PORT,
  nodeEnv: NODE_ENV,
  mongoUri: MONGO_URI
};