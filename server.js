import app from './src/app.js';
import envConfig from './src/config/env.config.js';
import { connectDatabase } from './src/config/database.js';

const startServer = async () => {
  await connectDatabase(envConfig.mongoUri);
  app.listen(envConfig.port, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${envConfig.port} en entorno (${envConfig.nodeEnv})`);
  });
};

startServer().catch(error => {
  console.error(`❌ No se pudo iniciar el servidor: ${error.message}`);
  process.exit(1);
});