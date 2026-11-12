import { servicesService } from '../container.js';
import { buildPageLinks } from '../utils/pagination.js';
import { emitToAll } from '../utils/socket.js';

export const getServices = async (req, res, next) => {
  try {
    const query = req.validated ?? {};
    const result = await servicesService.getServices(query);
    const pageLinks = buildPageLinks({
      baseUrl: req.baseUrl,
      query: { ...query, limit: result.limit },
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage
    });

    res.json({
      status: 'success',
      ...result,
      ...pageLinks,
      links: {
        prev: pageLinks.prevLink,
        next: pageLinks.nextLink
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const service = await servicesService.getServiceById(req.params.sid);
    res.json({ status: 'success', payload: service });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const result = await servicesService.createService(req.body);
    emitToAll('service:created', result);
    res.status(201).json({ status: 'success', payload: result });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const result = await servicesService.updateService(req.params.sid, req.body);
    res.json({ status: 'success', payload: result });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const result = await servicesService.deleteService(req.params.sid);
    res.json({ status: 'success', message: 'Servicio eliminado correctamente', payload: result });
  } catch (error) {
    next(error);
  }
};
