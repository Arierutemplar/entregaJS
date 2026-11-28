import dns from 'node:dns';
import mongoose from 'mongoose';

const configureDnsServers = () => {
  const servers = (process.env.DNS_SERVERS || '1.1.1.1,8.8.8.8')
    .split(',')
    .map(server => server.trim())
    .filter(Boolean);

  if (servers.length > 0) {
    dns.setServers(servers);
  }
};

export const connectDatabase = async (mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI, options = {}) => {
  if (!mongoUrl) {
    throw new Error('Falta la variable de entorno MONGO_URL');
  }

  configureDnsServers();
  await mongoose.connect(mongoUrl, options);
  console.log('MongoDB conectado correctamente');
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};
