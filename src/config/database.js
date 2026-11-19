import mongoose from 'mongoose';
import { config } from './config.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUrl, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('Conexión a la base de datos establecida');
    return true;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
    console.warn('El servidor continuará sin MongoDB (healthcheck y rutas stub disponibles).');
    return false;
  }
};
