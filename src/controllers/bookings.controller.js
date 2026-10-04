import BookingManager from '../managers/BookingManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bookingsFilePath = path.join(__dirname, '../data/bookings.json');
const servicesFilePath = path.join(__dirname, '../data/services.json');

const bookingManager = new BookingManager(bookingsFilePath, servicesFilePath);

export const createBooking = async (req, res, next) => {
  try {
    const result = await bookingManager.createBooking(req.body);
    if (result.error) {
      return res.status(400).json({ status: 'error', message: result.error });
    }
    res.status(201).json({ status: 'success', payload: result });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { bid } = req.params;
    const booking = await bookingManager.getBookingById(bid);

    if (booking.error) {
      return res.status(404).json({ status: 'error', message: booking.error });
    }

    res.json({ status: 'success', payload: booking });
  } catch (error) {
    next(error);
  }
};

export const addServiceToBooking = async (req, res, next) => {
  try {
    const { bid, sid } = req.params;
    const result = await bookingManager.addServiceToBooking(bid, sid);

    if (result.error) {
      return res.status(404).json({ status: 'error', message: result.error });
    }

    res.json({ status: 'success', message: 'Servicio agregado a la reserva exitosamente', payload: result });
  } catch (error) {
    next(error);
  }
};