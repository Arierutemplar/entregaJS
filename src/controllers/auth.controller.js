import env from '../config/env.config.js';
import { usersService } from '../container.js';
import { tokenMaxAgeSeconds } from '../utils/jwt.js';

const setTokenCookie = (res, token) => {
  res.setHeader(
    'Set-Cookie',
    `token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${tokenMaxAgeSeconds(env.jwtExpiresIn)}`
  );
};

export const register = async (req, res, next) => {
  try {
    const user = await usersService.register(req.body);
    res.status(201).json({ status: 'success', payload: user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await usersService.login(req.body);
    setTokenCookie(res, result.token);
    res.json({ status: 'success', payload: result });
  } catch (error) {
    next(error);
  }
};

export const current = async (req, res, next) => {
  try {
    res.json({ status: 'success', payload: req.user });
  } catch (error) {
    next(error);
  }
};
