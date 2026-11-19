import SessionDao from '../dao/session.dao.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

class SessionRepository {
  constructor(dao = SessionDao) {
    this.dao = dao;
  }

  async register(userData) {
    const password = await hashPassword(userData.password);
    const user = await this.dao.create({ ...userData, password });
    return this.#sanitize(user);
  }

  async login(userData) {
    const user = await this.dao.findByEmail(userData.email);

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isValid = await verifyPassword(userData.password, user.password);

    if (!isValid) {
      throw new Error('Credenciales inválidas');
    }

    return this.#sanitize(user);
  }

  #sanitize(user) {
    const doc = user.toObject ? user.toObject() : { ...user };
    delete doc.password;
    return doc;
  }
}

export default new SessionRepository();
