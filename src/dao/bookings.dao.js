import fs from 'fs';

export default class BookingsDao {
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
      console.error("Error al leer el archivo de reservas:", error);
      return [];
    }
  }

  async #writeFile(bookings) {
    await fs.promises.writeFile(this.path, JSON.stringify(bookings, null, 2));
  }

  async getById(id) {
    const bookings = await this.#readFile();
    return bookings.find(b => String(b.id) === String(id)) || null;
  }

  async create(bookingData) {
    const bookings = await this.#readFile();
    bookings.push(bookingData);
    await this.#writeFile(bookings);
    return bookingData;
  }

  async update(id, updateData) {
    const bookings = await this.#readFile();
    const index = bookings.findIndex(b => String(b.id) === String(id));
    if (index === -1) return null;

    bookings[index] = { ...bookings[index], ...updateData };
    await this.#writeFile(bookings);
    return bookings[index];
  }

  async getAll() {
    return await this.#readFile();
  }
}