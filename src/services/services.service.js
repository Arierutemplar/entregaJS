export default class ServicesService {
  constructor(servicesRepository) {
    this.servicesRepository = servicesRepository;
  }

  async getServices() {
    return await this.servicesRepository.getAll();
  }

  async getServiceById(id) {
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

    const services = await this.servicesRepository.getAll();
    const newId = services.length > 0 ? Math.max(...services.map(s => Number(s.id))) + 1 : 1;

    const newService = {
      id: newId,
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
    const existing = await this.servicesRepository.getById(id);
    if (!existing) {
      return { error: `Servicio con id ${id} no encontrado` };
    }

    delete updateData.id;

    if (updateData.duration !== undefined && (typeof updateData.duration !== 'number' || updateData.duration <= 0)) {
      return { error: "El campo 'duration' debe ser un número mayor a 0" };
    }
    if (updateData.price !== undefined && (typeof updateData.price !== 'number' || updateData.price < 0)) {
      return { error: "El campo 'price' debe ser un número válido" };
    }
    if (updateData.available !== undefined && typeof updateData.available !== 'boolean') {
      return { error: "El campo 'available' debe ser de tipo booleano" };
    }

    return await this.servicesRepository.update(id, updateData);
  }

  async deleteService(id) {
    const deleted = await this.servicesRepository.delete(id);
    if (!deleted) {
      return { error: `Servicio con id ${id} no encontrado` };
    }
    return deleted;
  }
}