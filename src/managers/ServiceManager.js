import fs from 'fs';
import path from 'path';

export default class ServiceManager {
  constructor(filePath) {
    this.path = filePath;
  }

  // Método privado para leer el archivo JSON
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

  // Método privado para escribir en el archivo JSON
  async #writeFile(services) {
    await fs.promises.writeFile(this.path, JSON.stringify(services, null, 2));
  }

  // getServices() → devuelve todos los servicios
  async getServices() {
    const services = await this.#readFile();
    return services;
  }

  // getServiceById(id) → devuelve el servicio o null/mensaje de error
  async getServiceById(id) {
    const services = await this.#readFile();
    // Convertimos ambos a string o número según cómo manejes los IDs, aquí usamos coincidencia flexible
    const service = services.find(s => String(s.id) === String(id));
    if (!service) {
      return { error: `Servicio con id ${id} no encontrado` };
    }
    return service;
  }

  // addService(serviceData) → agrega un servicio; el id se genera automáticamente
  async addService(serviceData) {
    const { name, description, duration, price, category, available } = serviceData;

    // Valida que estén presentes: name, description, duration, price, category, available
    if (!name || !description || duration === undefined || price === undefined || !category || available === undefined) {
      return { error: "Todos los campos son obligatorios: name, description, duration, price, category, available" };
    }

    const services = await this.#readFile();

    // Generar ID único automáticamente (ej. autoincremental basado en longitud o timestamp)
    const newId = services.length > 0 ? Number(services[services.length - 1].id) + 1 : 1;

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

  // updateService(id, updatedData) → actualiza el servicio; no permite modificar el id
  async updateService(id, updatedData) {
    const services = await this.#readFile();
    const index = services.findIndex(s => String(s.id) === String(id));

    if (index === -1) {
      return { error: `No se puede actualizar. Servicio con id ${id} no existe` };
    }

    // Evitar que se modifique el id desde afuera
    delete updatedData.id;

    services[index] = {
      ...services[index],
      ...updatedData
    };

    await this.#writeFile(services);
    return services[index];
  }

  // deleteService(id) → elimina el servicio; devuelve null/error si no existe
  async deleteService(id) {
    const services = await this.#readFile();
    const index = services.findIndex(s => String(s.id) === String(id));

    if (index === -1) {
      return { error: `No se puede eliminar. Servicio con id ${id} no existe` };
    }

    const deletedService = services.splice(index, 1)[0];
    await this.#writeFile(services);

    return deletedService;
  }
}