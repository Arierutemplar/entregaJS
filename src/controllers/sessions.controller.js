import { registerUser } from '../services/sessions.service.js';

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ status: 'success', payload: user });
  } catch (error) {
    next(error);
  }
};

export const login = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Estructura de login lista. Lógica de autenticación pendiente.',
    payload: null
  });
};

export const current = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Estructura de sesión actual lista. Lógica de autenticación pendiente.',
    payload: null
  });
};
