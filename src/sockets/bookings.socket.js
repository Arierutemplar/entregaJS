import BookingsDao from '../dao/bookings.dao.js';
import BookingsRepository from '../repositories/bookings.repository.js';
import BookingsService from '../services/bookings.service.js';
import ServicesDao from '../dao/services.dao.js';
import ServicesRepository from '../repositories/services.repository.js';
import { emitToAll } from '../utils/socket.js';

const bookingsService = new BookingsService(
  new BookingsRepository(new BookingsDao()),
  new ServicesRepository(new ServicesDao())
);

export const registerBookingSocketHandlers = socket => {
  socket.on('client:confirm-booking', async (data, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {};
    try {
      const result = await bookingsService.confirmBooking(data?.bookingId);
      if (result.error) {
        socket.emit('booking:error', { message: result.error });
        return reply({ status: 'error', message: result.error });
      }
      emitToAll('booking:updated', result);
      reply({ status: 'success' });
    } catch (error) {
      socket.emit('booking:error', { message: 'No se pudo confirmar la reserva' });
      reply({ status: 'error', message: error.message });
    }
  });
};
