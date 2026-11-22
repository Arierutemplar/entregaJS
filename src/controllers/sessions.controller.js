export const register = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Estructura de registro lista. Lógica de autenticación pendiente.',
    payload: null
  });
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
