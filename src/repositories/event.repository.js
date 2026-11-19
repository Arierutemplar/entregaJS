import EventDao from '../dao/event.dao.js';

/**
 * Repositorio de eventos (base para próximas entregas).
 */
class EventRepository {
  constructor(dao = EventDao) {
    this.dao = dao;
  }

  async findAll() {
    return this.dao.findAll();
  }
}

export default new EventRepository();
