import ServiceManager from '../managers/ServiceManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceManager = new ServiceManager(path.join(__dirname, '../data/services.json'));

export const getServices = async (req, res, next) => {
  try {
    const { category, available } = req.query;
    let services = await serviceManager.getServices();

    if (category) {
      services = services.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    if (available !== undefined) {
      const isAvailable = available === 'true';
      services = services.filter(s => s.available === isAvailable);
    }

    res.json({ status: 'success', payload: services });
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const { sid } = req.params;
    const service = await serviceManager.getServiceById(sid);

    if (service.error) {
      return res.status(404).json({ status: 'error', message: service.error });
    }

    res.json({ status: 'success', payload: service });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const result = await serviceManager.addService(req.body);
    if (result.error) {
      return res.status(400).json({ status: 'error', message: result.error });
    }
    res.status(201).json({ status: 'success', payload: result });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { sid } = req.params;
    const result = await serviceManager.updateService(sid, req.body);

    if (result.error) {
      return res.status(404).json({ status: 'error', message: result.error });
    }

    res.json({ status: 'success', payload: result });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const { sid } = req.params;
    const result = await serviceManager.deleteService(sid);

    if (result.error) {
      return res.status(404).json({ status: 'error', message: result.error });
    }

    res.json({ status: 'success', message: 'Servicio eliminado correctamente', payload: result });
  } catch (error) {
    next(error);
  }
};