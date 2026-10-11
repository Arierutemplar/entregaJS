import ServicesDao from '../dao/services.dao.js';
import ServicesRepository from '../repositories/services.repository.js';
import ServicesService from '../services/services.service.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dao = new ServicesDao(path.join(__dirname, '../data/services.json'));
const repository = new ServicesRepository(dao);
const servicesService = new ServicesService(repository);

export const getServices = async (req, res, next) => {
  try {
    const { category, available } = req.query;
    let services = await servicesService.getServices();

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
    const service = await servicesService.getServiceById(sid);

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
    const result = await servicesService.createService(req.body);
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
    const result = await servicesService.updateService(sid, req.body);

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
    const result = await servicesService.deleteService(sid);

    if (result.error) {
      return res.status(404).json({ status: 'error', message: result.error });
    }

    res.json({ status: 'success', message: 'Servicio eliminado correctamente', payload: result });
  } catch (error) {
    next(error);
  }
};