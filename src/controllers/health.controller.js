import { getHealthReport } from '../services/health.service.js';

export const getHealth = (req, res, next) => {
  try {
    const report = getHealthReport();
    const connected = report.database === 'connected';

    res.status(connected ? 200 : 503).json({
      status: connected ? 'success' : 'error',
      message: connected ? 'Servicio operativo' : 'Base de datos desconectada',
      ...report
    });
  } catch (error) {
    next(error);
  }
};
