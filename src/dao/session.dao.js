import { User } from '../models/User.js';

class SessionDAO {
  async create(userData) {
    return User.create(userData);
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }
}

export default new SessionDAO();
