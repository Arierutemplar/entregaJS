import { Event } from '../models/Event.js';

/**
 * Acceso a datos de eventos (base para próximas entregas).
 */
class EventDAO {
  async findAll() {
    return Event.find();
  }
}

export default new EventDAO();
