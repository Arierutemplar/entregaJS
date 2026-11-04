import { z } from 'zod';

const requiredText = (field) => z.string({
  required_error: `El campo '${field}' es obligatorio`,
  invalid_type_error: `El campo '${field}' es obligatorio`
}).trim().min(1, `El campo '${field}' es obligatorio`);

const durationSchema = z.number({
  required_error: "El campo 'duration' debe ser un número mayor a 0",
  invalid_type_error: "El campo 'duration' debe ser un número mayor a 0"
}).gt(0, "El campo 'duration' debe ser un número mayor a 0");

const priceSchema = z.number({
  required_error: "El campo 'price' debe ser un número válido mayor o igual a 0",
  invalid_type_error: "El campo 'price' debe ser un número válido mayor o igual a 0"
}).min(0, "El campo 'price' debe ser un número válido mayor o igual a 0");

const availableSchema = z.boolean({
  required_error: "El campo 'available' debe ser de tipo booleano (true/false)",
  invalid_type_error: "El campo 'available' debe ser de tipo booleano (true/false)"
});

const serviceFields = {
  name: requiredText('name'),
  description: requiredText('description'),
  duration: durationSchema,
  price: priceSchema,
  category: requiredText('category'),
  available: availableSchema
};

export const createServiceSchema = z.object(serviceFields);

export const updateServiceSchema = z.object(serviceFields).partial();

const positiveIntQuery = (name) => z.preprocess((value) => {
  if (value === undefined || value === '') return undefined;
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  return value;
}, z.number({
  invalid_type_error: `El parámetro '${name}' debe ser un entero positivo`
}).int(`El parámetro '${name}' debe ser un entero positivo`).positive(`El parámetro '${name}' debe ser un entero positivo`).optional());

const queryBoolean = z.preprocess((value) => {
  if (value === undefined || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return value;
}, z.boolean({
  invalid_type_error: "El parámetro 'available' debe ser true o false"
}).optional());

const sortableFields = ['name', 'description', 'duration', 'price', 'category', 'available', 'createdAt', 'updatedAt'];

export const servicesQuerySchema = z.object({
  category: z.string({
    invalid_type_error: "El parámetro 'category' debe ser texto"
  }).trim().min(1, "El parámetro 'category' no puede estar vacío").optional(),
  available: queryBoolean,
  page: positiveIntQuery('page'),
  limit: positiveIntQuery('limit'),
  sortBy: z.enum(sortableFields, {
    errorMap: () => ({ message: "El parámetro 'sortBy' no es un campo válido" })
  }).optional(),
  order: z.preprocess((value) => (
    typeof value === 'string' ? value.toLowerCase() : value
  ), z.enum(['asc', 'desc'], {
    errorMap: () => ({ message: "El parámetro 'order' debe ser asc o desc" })
  }).optional())
});
