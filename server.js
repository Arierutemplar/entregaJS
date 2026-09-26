import app from './src/app.js';
import envConfig from './src/config/env.config.js';

app.listen(envConfig.port, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${envConfig.port} en entorno (${envConfig.nodeEnv})`);
});