import mongoose from 'mongoose';
import { config } from './config.js';

export const connectDB = async () => {
  if (!config.mongoUrl) {
    return false;
  }

  try {
    await mongoose.connect(config.mongoUrl, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('Conexión a la base de datos establecida');
    return true;
  } catch {
    return false;
  }
};
