import SessionRepository from '../repositories/session.repository.js';

class SessionService {
  constructor(repository = SessionRepository) {
    this.repository = repository;
  }

  async register(userData) {
    return this.repository.register(userData);
  }

  async login(userData) {
    return this.repository.login(userData);
  }
}

export default new SessionService();
