import app from './app.js';
import envConfig from './config/env.config.js';
import { connectDatabase } from './config/database.js';
import User from './models/User.js';

const startServer = async () => {
  await connectDatabase(envConfig.mongoUrl);
  await User.init();

  app.listen(envConfig.port, () => {
    console.log(`Servidor escuchando en el puerto ${envConfig.port} (${envConfig.nodeEnv})`);
  });
};

startServer().catch(error => {
  console.error(`No se pudo iniciar el servidor: ${error.message}`);
  process.exit(1);
});
