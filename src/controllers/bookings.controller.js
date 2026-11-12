import { bookingsService } from '../container.js';
import { emitToAll } from '../utils/socket.js';

export const createBooking = async (req, res, next) => {
  try {
    const result = await bookingsService.createBooking(req.body);
    emitToAll('booking:updated', result);
    res.status(201).json({ status: 'success', payload: result });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingsService.getBookingById(req.params.bid);
    res.json({ status: 'success', payload: booking });
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req, res, next) => {
  try {
    const result = await bookingsService.updateBooking(req.params.bid, req.body);
    emitToAll('booking:updated', result);
    res.json({ status: 'success', payload: result });
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    const result = await bookingsService.deleteBooking(req.params.bid);
    emitToAll('booking:deleted', { _id: result._id });
    res.json({ status: 'success', message: 'Reserva eliminada correctamente', payload: result });
  } catch (error) {
    next(error);
  }
};

export const addServiceToBooking = async (req, res, next) => {
  try {
    const { bid, sid } = req.params;
    const result = await bookingsService.addServiceToBooking(bid, sid, req.body.quantity);
    emitToAll('booking:updated', result);
    res.json({
      status: 'success',
      message: 'Servicio agregado a la reserva exitosamente',
      payload: result
    });
  } catch (error) {
    next(error);
  }
};
