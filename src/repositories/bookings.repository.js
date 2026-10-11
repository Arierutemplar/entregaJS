export default class BookingsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getById(id) {
    return await this.dao.getById(id);
  }

  async create(bookingData) {
    return await this.dao.create(bookingData);
  }

  async update(id, updateData) {
    return await this.dao.update(id, updateData);
  }

  async getAll() {
    return await this.dao.getAll();
  }
}