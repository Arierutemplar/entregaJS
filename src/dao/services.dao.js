import Service from '../models/service.model.js';

export default class ServicesDao {
  async getAll({ filter = {}, sort = {}, skip = 0, limit = 0 } = {}) {
    let query = Service.find(filter).sort(sort);
    if (skip) query = query.skip(skip);
    if (limit) query = query.limit(limit);
    return query.lean();
  }

  async count(filter = {}) {
    return Service.countDocuments(filter);
  }

  async getById(id) {
    return Service.findById(id).lean();
  }

  async create(serviceData) {
    const service = await Service.create(serviceData);
    return service.toObject();
  }

  async update(id, updateData) {
    return Service.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).lean();
  }

  async delete(id) {
    return Service.findByIdAndDelete(id).lean();
  }
}
