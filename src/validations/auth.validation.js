import { z } from 'zod';

const emailSchema = z.string({
  required_error: "El campo 'email' es obligatorio",
  invalid_type_error: "El campo 'email' es obligatorio"
}).trim().email("El campo 'email' no es válido").transform((value) => value.toLowerCase());

export const registerSchema = z.object({
  name: z.string({
    required_error: "El campo 'name' es obligatorio",
    invalid_type_error: "El campo 'name' es obligatorio"
  }).trim().min(1, "El campo 'name' es obligatorio"),
  email: emailSchema,
  password: z.string({
    required_error: "El campo 'password' es obligatorio",
    invalid_type_error: "El campo 'password' es obligatorio"
  }).min(8, "El campo 'password' debe tener al menos 8 caracteres")
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({
    required_error: "El campo 'password' es obligatorio",
    invalid_type_error: "El campo 'password' es obligatorio"
  }).min(1, "El campo 'password' es obligatorio")
});
