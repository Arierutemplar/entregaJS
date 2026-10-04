import fs from 'fs';

export default class ServiceManager {
  constructor(filePath) {
    this.path = filePath;
  }

  async #readFile() {
    try {
      if (!fs.existsSync(this.path)) {
        await fs.promises.writeFile(this.path, JSON.stringify([], null, 2));
        return [];
      }
      const data = await fs.promises.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error("Error al leer el archivo de servicios:", error);
      return [];
    }
  }

  async #writeFile(services) {
    await fs.promises.writeFile(this.path, JSON.stringify(services, null, 2));
  }

  async getServices() {
    return await this.#readFile();
  }

  async getServiceById(id) {
    const services = await this.#readFile();
    const service = services.find(s => String(s.id) === String(id));
    if (!service) {
      return { error: `Servicio con id ${id} no encontrado` };
    }
    return service;
  }

  async addService(serviceData) {
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

    const services = await this.#readFile();
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

    services.push(newService);
    await this.#writeFile(services);

    return newService;
  }

  async updateService(id, updateData) {
    const services = await this.#readFile();
    const index = services.findIndex(s => String(s.id) === String(id));

    if (index === -1) {
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

    services[index] = { ...services[index], ...updateData };
    await this.#writeFile(services);

    return services[index];
  }

  async deleteService(id) {
    const services = await this.#readFile();
    const index = services.findIndex(s => String(s.id) === String(id));

    if (index === -1) {
      return { error: `Servicio con id ${id} no encontrado` };
    }

    const deletedService = services.splice(index, 1)[0];
    await this.#writeFile(services);

    return deletedService;
  }
}