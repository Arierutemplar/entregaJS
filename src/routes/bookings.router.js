import { Router } from 'express';
import {
  createBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
  addServiceToBooking
} from '../controllers/bookings.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  bookingIdParamsSchema,
  bookingServiceParamsSchema
} from '../validations/params.validation.js';
import {
  addServiceToBookingSchema,
  createBookingSchema,
  updateBookingSchema
} from '../validations/bookings.validation.js';

const router = Router();

router.post('/', validate(createBookingSchema), createBooking);
router.get('/:bid', validate(bookingIdParamsSchema, 'params'), getBookingById);
router.put('/:bid', validate(bookingIdParamsSchema, 'params'), validate(updateBookingSchema), updateBooking);
router.delete('/:bid', validate(bookingIdParamsSchema, 'params'), deleteBooking);
router.post(
  '/:bid/services/:sid',
  validate(bookingServiceParamsSchema, 'params'),
  validate(addServiceToBookingSchema),
  addServiceToBooking
);

export default router;
