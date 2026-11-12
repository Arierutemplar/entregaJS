import { usersService } from '../container.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await usersService.getUsers();
    res.json({ status: 'success', payload: users });
  } catch (error) {
    next(error);
  }
};
