import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;

// Validar que las variables requeridas existan; si falta alguna, la app falla con un mensaje claro.
if (!PORT || !NODE_ENV) {
  console.error("❌ Error crítico: Faltan variables de entorno requeridas (PORT o NODE_ENV). Revisa tu archivo .env");
  process.exit(1);
}

export default {
  port: PORT,
  nodeEnv: NODE_ENV
};