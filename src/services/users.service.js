import bcrypt from 'bcryptjs';
import { HttpError } from '../utils/httpError.js';
import { signToken } from '../utils/jwt.js';

const withoutPassword = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

export default class UsersService {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }

  async getUsers() {
    return await this.usersRepository.getAll();
  }

  async getById(id) {
    return await this.usersRepository.getById(id);
  }

  async register({ name, email, password }) {
    const existing = await this.usersRepository.getByEmail(email);
    if (existing) {
      throw new HttpError(400, 'El correo ya está registrado');
    }

    const hash = await bcrypt.hash(password, 10);
    return await this.usersRepository.create({
      name,
      email,
      password: hash,
      role: 'user'
    });
  }

  async login({ email, password }) {
    const user = await this.usersRepository.getByEmail(email);
    const valid = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !valid) {
      throw new HttpError(401, 'Credenciales inválidas');
    }

    const safeUser = withoutPassword(user);
    const token = signToken({ sub: String(user._id), role: user.role });
    return { token, user: safeUser };
  }
}
