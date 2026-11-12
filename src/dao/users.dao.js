import User from '../models/user.model.js';

const withoutPassword = (user) => {
  if (!user) return user;
  const { password, ...safeUser } = user;
  return safeUser;
};

export default class UsersDao {
  async getAll() {
    return User.find().lean();
  }

  async getById(id) {
    return User.findById(id).lean();
  }

  async getByEmail(email) {
    return User.findOne({ email }).select('+password').lean();
  }

  async create(userData) {
    const user = await User.create(userData);
    return withoutPassword(user.toObject());
  }
}
