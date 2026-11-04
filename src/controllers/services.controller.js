import ServicesDao from '../dao/services.dao.js';
import ServicesRepository from '../repositories/services.repository.js';
import ServicesService from '../services/services.service.js';
import { buildPageLinks } from '../utils/pagination.js';
import { emitToAll } from '../utils/socket.js';

const dao = new ServicesDao();
const repository = new ServicesRepository(dao);
const servicesService = new ServicesService(repository);

export const getServices = async (req, res, next) => {
  try {
    const query = req.validated ?? {};
    const result = await servicesService.getServices(query);
    const links = buildPageLinks({
      baseUrl: req.baseUrl,
      query: { ...query, limit: result.limit },
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage
    });

    res.json({ status: 'success', ...result, ...links });
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
    emitToAll('service:created', result);
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