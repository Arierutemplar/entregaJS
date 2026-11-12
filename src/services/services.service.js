import { buildPagination } from '../utils/pagination.js';
import { assertFound } from '../utils/httpError.js';

const SORTABLE_FIELDS = new Set([
  'name',
  'description',
  'duration',
  'price',
  'category',
  'available',
  'createdAt',
  'updatedAt'
]);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const pickServiceFields = (serviceData) => {
  const safeData = {};
  const fields = ['name', 'description', 'duration', 'price', 'category', 'available'];

  for (const field of fields) {
    if (serviceData[field] !== undefined) {
      safeData[field] = serviceData[field];
    }
  }

  return safeData;
};

export default class ServicesService {
  constructor(servicesRepository) {
    this.servicesRepository = servicesRepository;
  }

  async getServices(query = {}) {
    const filter = {};

    if (query.category) {
      filter.category = {
        $regex: `^${escapeRegex(query.category)}$`,
        $options: 'i'
      };
    }

    if (typeof query.available === 'boolean') {
      filter.available = query.available;
    }

    const sort = {};
    if (query.sortBy && SORTABLE_FIELDS.has(query.sortBy)) {
      sort[query.sortBy] = query.order === 'desc' ? -1 : 1;
    }

    if (query.paginate === false) {
      const payload = await this.servicesRepository.getAll({ filter, sort });
      const total = payload.length;

      return {
        payload,
        total,
        totalDocs: total,
        page: 1,
        limit: total,
        totalPages: total > 0 ? 1 : 0,
        hasPrevPage: false,
        hasNextPage: false
      };
    }

    const page = Number.isInteger(query.page) && query.page > 0 ? query.page : 1;
    const limit = Number.isInteger(query.limit) && query.limit > 0 ? query.limit : 10;

    const [total, payload] = await Promise.all([
      this.servicesRepository.count(filter),
      this.servicesRepository.getAll({
        filter,
        sort,
        skip: (page - 1) * limit,
        limit
      })
    ]);

    return {
      payload,
      ...buildPagination(total, page, limit)
    };
  }

  async getServiceById(id) {
    const service = await this.servicesRepository.getById(id);
    return assertFound(service, `Servicio con id ${id} no encontrado`);
  }

  async createService(serviceData) {
    return await this.servicesRepository.create(pickServiceFields(serviceData));
  }

  async updateService(id, updateData) {
    const updated = await this.servicesRepository.update(id, pickServiceFields(updateData));
    return assertFound(updated, `Servicio con id ${id} no encontrado`);
  }

  async deleteService(id) {
    const deleted = await this.servicesRepository.delete(id);
    return assertFound(deleted, `Servicio con id ${id} no encontrado`);
  }
}
