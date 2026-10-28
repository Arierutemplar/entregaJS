import dns from 'node:dns';
import mongoose from 'mongoose';

const configureDnsServers = () => {
  const servers = (process.env.DNS_SERVERS || '1.1.1.1,8.8.8.8')
    .split(',')
    .map(server => server.trim())
    .filter(Boolean);

  if (servers.length === 0) {
    throw new Error('DNS_SERVERS debe contener al menos un servidor DNS válido');
  }

  dns.setServers(servers);
};

export const connectDatabase = async (mongoUri = process.env.MONGO_URI) => {
  if (!mongoUri) {
    throw new Error('Falta la variable de entorno MONGO_URI');
  }

  configureDnsServers();
  await mongoose.connect(mongoUri);
  console.log('MongoDB conectado correctamente');
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};
