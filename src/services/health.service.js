import mongoose from 'mongoose';

const DATABASE_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

export const getHealthReport = () => {
  const readyState = mongoose.connection.readyState;

  return {
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: DATABASE_STATES[readyState] || 'unknown',
    memory: process.memoryUsage().rss
  };
};
