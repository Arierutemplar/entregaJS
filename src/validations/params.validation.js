import { z } from 'zod';

const objectId = (field) => z.string({
  required_error: `El ${field} es obligatorio`,
  invalid_type_error: 'El ID proporcionado no tiene un formato válido'
}).regex(/^[a-fA-F0-9]{24}$/, 'El ID proporcionado no tiene un formato válido');

export const serviceIdParamsSchema = z.object({
  sid: objectId('ID del servicio')
}).passthrough();

export const bookingIdParamsSchema = z.object({
  bid: objectId('ID de la reserva')
}).passthrough();

export const bookingServiceParamsSchema = z.object({
  bid: objectId('ID de la reserva'),
  sid: objectId('ID del servicio')
}).passthrough();
