import { loginUser, registerUser } from '../services/sessions.service.js';

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/'
});

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ status: 'success', payload: user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const token = await loginUser(req.body);
    res.cookie('currentUser', token, { ...cookieOptions(), maxAge: 3600000 });
    res.status(200).json({ status: 'success', message: 'Login correcto' });
  } catch (error) {
    next(error);
  }
};

export const current = (req, res) => {
  const { id, email, role } = req.user;
  res.status(200).json({
    status: 'success',
    payload: { id, email, role }
  });
};

export const logout = (req, res) => {
  res.clearCookie('currentUser', cookieOptions());
  res.status(200).json({ status: 'success', message: 'Sesión cerrada' });
};

export const admin = (req, res) => {
  res.status(200).json({ status: 'success', message: 'Acceso administrativo autorizado' });
};
