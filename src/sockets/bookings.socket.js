import { bookingsService } from '../container.js';
import { HttpError } from '../utils/httpError.js';
import { emitToAll } from '../utils/socket.js';

export const registerBookingSocketHandlers = socket => {
  socket.on('client:confirm-booking', async (data, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {};
    try {
      const result = await bookingsService.confirmBooking(data?.bookingId);
      emitToAll('booking:updated', result);
      reply({ status: 'success' });
    } catch (error) {
      const message = error instanceof HttpError || error.name === 'CastError'
        ? (error.name === 'CastError' ? 'El ID proporcionado no tiene un formato válido' : error.message)
        : 'No se pudo confirmar la reserva';
      socket.emit('booking:error', { message });
      reply({ status: 'error', message });
    }
  });
};
