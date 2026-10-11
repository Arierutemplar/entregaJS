import BookingsDao from '../dao/bookings.dao.js';
import BookingsRepository from '../repositories/bookings.repository.js';
import BookingsService from '../services/bookings.service.js';
import ServicesDao from '../dao/services.dao.js';
import ServicesRepository from '../repositories/services.repository.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bookingsDao = new BookingsDao(path.join(__dirname, '../data/bookings.json'));
const bookingsRepository = new BookingsRepository(bookingsDao);

const servicesDao = new ServicesDao(path.join(__dirname, '../data/services.json'));
const servicesRepository = new ServicesRepository(servicesDao);

const bookingsService = new BookingsService(bookingsRepository, servicesRepository);

export const createBooking = async (req, res, next) => {
  try {
    const result = await bookingsService.createBooking(req.body);
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
    const booking = await bookingsService.getBookingById(bid);

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
    const result = await bookingsService.addServiceToBooking(bid, sid);

    if (result.error) {
      return res.status(404).json({ status: 'error', message: result.error });
    }

    res.json({ status: 'success', message: 'Servicio agregado a la reserva exitosamente', payload: result });
  } catch (error) {
    next(error);
  }
};