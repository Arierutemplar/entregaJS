export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source] ?? {});

  if (!result.success) {
    const errors = result.error.issues.map(({ path, message }) => ({
      path: path.join('.'),
      message
    }));

    return res.status(400).json({
      status: 'error',
      message: errors[0]?.message ?? 'Datos inválidos',
      errors
    });
  }

  if (source === 'query') {
    req.validated = result.data;
  } else {
    req[source] = result.data;
  }

  next();
};
