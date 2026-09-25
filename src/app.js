import express from 'express';
import envConfig from './config/env.config.js';
import ServiceManager from './managers/ServiceManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const serviceManager = new ServiceManager(path.join(__dirname, './data/services.json'));

// Ruta GET para obtener todos los servicios
app.get('/api/services', async (req, res) => {
  try {
    const services = await serviceManager.getServices();
    res.json({ status: 'success', payload: services });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ruta POST para agregar un servicio
app.post('/api/services', async (req, res) => {
  try {
    const result = await serviceManager.addService(req.body);
    if (result.error) {
      return res.status(400).json({ status: 'error', message: result.error });
    }
    res.status(201).json({ status: 'success', payload: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(envConfig.port, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${envConfig.port} en entorno (${envConfig.nodeEnv})`);
});