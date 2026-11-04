import { z } from 'zod';

const objectIdSchema = z.string({
  required_error: "El campo 'service' es obligatorio",
  invalid_type_error: "El campo 'service' debe ser un ObjectId válido"
}).regex(/^[a-fA-F0-9]{24}$/, "El campo 'service' debe ser un ObjectId válido");

const quantitySchema = z.number({
  required_error: "El campo 'quantity' debe ser un entero positivo",
  invalid_type_error: "El campo 'quantity' debe ser un entero positivo"
}).int("El campo 'quantity' debe ser un entero positivo").positive("El campo 'quantity' debe ser un entero positivo");

const bookingServiceItemSchema = z.object({
  service: objectIdSchema,
  quantity: quantitySchema.optional().default(1)
});

export const createBookingSchema = z.object({
  clientName: z.string({
    required_error: "El campo 'clientName' es obligatorio",
    invalid_type_error: "El campo 'clientName' es obligatorio"
  }).trim().min(1, "El campo 'clientName' es obligatorio"),
  clientEmail: z.string({
    required_error: "El campo 'clientEmail' es obligatorio",
    invalid_type_error: "El campo 'clientEmail' es obligatorio"
  }).trim().min(1, "El campo 'clientEmail' es obligatorio").email("El campo 'clientEmail' no es válido"),
  date: z.string({
    required_error: "El campo 'date' es obligatorio",
    invalid_type_error: "El campo 'date' es obligatorio"
  }).trim().min(1, "El campo 'date' es obligatorio"),
  time: z.string({
    required_error: "El campo 'time' es obligatorio",
    invalid_type_error: "El campo 'time' es obligatorio"
  }).trim().min(1, "El campo 'time' es obligatorio"),
  status: z.enum(['pendiente', 'confirmada', 'cancelada', 'completada'], {
    errorMap: () => ({ message: "El campo 'status' no es válido" })
  }).optional(),
  services: z.array(bookingServiceItemSchema, {
    invalid_type_error: "El campo 'services' debe ser un arreglo"
  }).optional()
});

export const addServiceToBookingSchema = z.object({
  quantity: quantitySchema.optional().default(1)
});
