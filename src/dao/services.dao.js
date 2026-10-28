import Service from '../models/service.model.js';

export default class ServicesDao {
  async getAll() {
    return Service.find().lean();
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
