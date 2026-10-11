import fs from 'fs';

export default class ServicesDao {
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

  async getAll() {
    return await this.#readFile();
  }

  async getById(id) {
    const services = await this.#readFile();
    return services.find(s => String(s.id) === String(id)) || null;
  }

  async create(serviceData) {
    const services = await this.#readFile();
    services.push(serviceData);
    await this.#writeFile(services);
    return serviceData;
  }

  async update(id, updateData) {
    const services = await this.#readFile();
    const index = services.findIndex(s => String(s.id) === String(id));
    if (index === -1) return null;

    services[index] = { ...services[index], ...updateData };
    await this.#writeFile(services);
    return services[index];
  }

  async delete(id) {
    const services = await this.#readFile();
    const index = services.findIndex(s => String(s.id) === String(id));
    if (index === -1) return null;

    const deleted = services.splice(index, 1)[0];
    await this.#writeFile(services);
    return deleted;
  }
}