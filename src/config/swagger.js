import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const definition = {
  openapi: '3.0.0',
  info: {
    title: 'Sistema Backend de Turnos y Reservas',
    version: '1.0.0',
    description: 'API de catálogo, reservas, autenticación JWT y monitoreo. Los endpoints de servicios y reservas permanecen públicos para compatibilidad con la evaluación.'
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'Services' },
    { name: 'Bookings' },
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Health' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      },
      Service: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          duration: { type: 'number' },
          price: { type: 'number' },
          category: { type: 'string' },
          available: { type: 'boolean' }
        }
      },
      ServiceInput: {
        type: 'object',
        required: ['name', 'description', 'duration', 'price', 'category', 'available'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          duration: { type: 'number', exclusiveMinimum: 0 },
          price: { type: 'number', minimum: 0 },
          category: { type: 'string' },
          available: { type: 'boolean' }
        }
      },
      BookingServiceItem: {
        type: 'object',
        required: ['service'],
        properties: {
          service: { type: 'string', description: 'ObjectId del servicio' },
          quantity: { type: 'integer', minimum: 1, default: 1 }
        }
      },
      Booking: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          clientName: { type: 'string' },
          clientEmail: { type: 'string', format: 'email' },
          date: { type: 'string' },
          time: { type: 'string' },
          status: { type: 'string', enum: ['pendiente', 'confirmada', 'cancelada', 'completada'] },
          services: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                service: { oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/Service' }] },
                quantity: { type: 'integer' }
              }
            }
          }
        }
      },
      BookingInput: {
        type: 'object',
        required: ['clientName', 'clientEmail', 'date', 'time'],
        properties: {
          clientName: { type: 'string' },
          clientEmail: { type: 'string', format: 'email' },
          date: { type: 'string', example: '2026-11-12' },
          time: { type: 'string', example: '15:30' },
          status: { type: 'string', enum: ['pendiente', 'confirmada', 'cancelada', 'completada'] },
          services: { type: 'array', items: { $ref: '#/components/schemas/BookingServiceItem' } }
        }
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['user', 'admin'] }
        }
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        }
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      AuthPayload: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Datos o identificador inválidos',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
      },
      Unauthorized: {
        description: 'Token ausente o inválido',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
      },
      Forbidden: {
        description: 'El rol no permite la operación',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
      },
      NotFound: {
        description: 'Recurso no encontrado',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
      }
    }
  },
  paths: {
    '/api/services': {
      get: {
        tags: ['Services'],
        summary: 'Listar servicios con filtro, orden y paginación',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'available', in: 'query', schema: { type: 'boolean' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'price', 'duration', 'category', 'available', 'createdAt', 'updatedAt'] } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } }
        ],
        responses: {
          200: { description: 'Listado paginado' },
          400: { $ref: '#/components/responses/BadRequest' }
        }
      },
      post: {
        tags: ['Services'],
        summary: 'Crear un servicio',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceInput' } } }
        },
        responses: {
          201: { description: 'Servicio creado' },
          400: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/api/services/{sid}': {
      get: {
        tags: ['Services'],
        summary: 'Obtener un servicio',
        parameters: [{ name: 'sid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Servicio encontrado' },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      put: {
        tags: ['Services'],
        summary: 'Actualizar un servicio',
        parameters: [{ name: 'sid', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceInput' } } }
        },
        responses: {
          200: { description: 'Servicio actualizado' },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      delete: {
        tags: ['Services'],
        summary: 'Eliminar un servicio',
        parameters: [{ name: 'sid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Servicio eliminado' },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/api/bookings': {
      post: {
        tags: ['Bookings'],
        summary: 'Crear una reserva y disparar el correo de forma asíncrona',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/BookingInput' } } }
        },
        responses: {
          201: { description: 'Reserva creada' },
          400: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/api/bookings/{bid}': {
      get: {
        tags: ['Bookings'],
        summary: 'Obtener una reserva con los servicios populados',
        parameters: [{ name: 'bid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Reserva encontrada' },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      put: {
        tags: ['Bookings'],
        summary: 'Actualizar una reserva. Si el estado pasa a confirmada, se envía un correo.',
        parameters: [{ name: 'bid', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/BookingInput' } } }
        },
        responses: {
          200: { description: 'Reserva actualizada' },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      delete: {
        tags: ['Bookings'],
        summary: 'Eliminar una reserva',
        parameters: [{ name: 'bid', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Reserva eliminada' },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/api/bookings/{bid}/services/{sid}': {
      post: {
        tags: ['Bookings'],
        summary: 'Agregar un servicio a una reserva',
        parameters: [
          { name: 'bid', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'sid', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { quantity: { type: 'integer', minimum: 1 } } }
            }
          }
        },
        responses: {
          200: { description: 'Servicio agregado' },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar un usuario con rol user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } }
        },
        responses: {
          201: { description: 'Usuario creado' },
          400: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión y obtener un JWT',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } }
        },
        responses: {
          200: { description: 'Token emitido en el cuerpo y en una cookie HttpOnly' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/api/auth/current': {
      get: {
        tags: ['Auth'],
        summary: 'Usuario autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Sesión vigente', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Listar usuarios. Requiere rol admin.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Listado sin contraseñas' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Estado del proceso y de MongoDB',
        responses: {
          200: { description: 'Base de datos conectada' },
          503: { description: 'Base de datos desconectada' }
        }
      }
    }
  }
};

export const swaggerSpec = swaggerJsdoc({ definition, apis: [] });

export const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Turnos y Reservas API'
  }));
};
