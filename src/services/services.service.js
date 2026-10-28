import mongoose from 'mongoose';

export default class ServicesService {
  constructor(servicesRepository) {
    this.servicesRepository = servicesRepository;
  }

  async getServices() {
    return await this.servicesRepository.getAll();
  }

  async getServiceById(id) {
    if (!mongoose.isValidObjectId(id)) {
      return { error: `Servicio con id ${id} no encontrado` };
    }

    const service = await this.servicesRepository.getById(id);
    if (!service) {
      return { error: `Servicio con id ${id} no encontrado` };
    }
    return service;
  }

  async createService(serviceData) {
    const { name, description, duration, price, category, available } = serviceData;

    if (!name || !description || duration === undefined || price === undefined || !category || available === undefined) {
      return { error: "Faltan campos obligatorios o son inválidos" };
    }

    if (typeof duration !== 'number' || duration <= 0) {
      return { error: "El campo 'duration' debe ser un número mayor a 0" };
    }

    if (typeof price !== 'number' || price < 0) {
      return { error: "El campo 'price' debe ser un número válido mayor o igual a 0" };
    }

    if (typeof available !== 'boolean') {
      return { error: "El campo 'available' debe ser de tipo booleano (true/false)" };
    }

    const newService = {
      name,
      description,
      duration,
      price,
      category,
      available
    };

    return await this.servicesRepository.create(newService);
  }

  async updateService(id, updateData) {
    if (!mongoose.isValidObjectId(id)) {
      return { error: `Servicio con id ${id} no encontrado` };
    }

    const existing = await this.servicesRepository.getById(id);
    if (!existing) {
      return { error: `Servicio con id ${id} no encontrado` };
    }

    const safeUpdateData = { ...updateData };
    delete safeUpdateData.id;

    if (safeUpdateData.duration !== undefined && (typeof safeUpdateData.duration !== 'number' || safeUpdateData.duration <= 0)) {
      return { error: "El campo 'duration' debe ser un número mayor a 0" };
    }
    if (safeUpdateData.price !== undefined && (typeof safeUpdateData.price !== 'number' || safeUpdateData.price < 0)) {
      return { error: "El campo 'price' debe ser un número válido" };
    }
    if (safeUpdateData.available !== undefined && typeof safeUpdateData.available !== 'boolean') {
      return { error: "El campo 'available' debe ser de tipo booleano" };
    }

    return await this.servicesRepository.update(id, safeUpdateData);
  }

  async deleteService(id) {
    if (!mongoose.isValidObjectId(id)) {
      return { error: `Servicio con id ${id} no encontrado` };
    }

    const deleted = await this.servicesRepository.delete(id);
    if (!deleted) {
      return { error: `Servicio con id ${id} no encontrado` };
    }
    return deleted;
  }
}