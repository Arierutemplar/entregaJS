import { Router } from 'express';
import BookingManager from '../managers/BookingManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const bookingsFilePath = path.join(__dirname, '../data/bookings.json');
const servicesFilePath = path.join(__dirname, '../data/services.json');

const bookingManager = new BookingManager(bookingsFilePath, servicesFilePath);

// POST /api/bookings -> Crea una reserva
router.post('/', async (req, res) => {
  try {
    const result = await bookingManager.createBooking(req.body);
    if (result.error) {
      return res.status(400).json({ status: 'error', message: result.error });
    }
    res.status(201).json({ status: 'success', payload: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/bookings/:bid -> Devuelve una reserva por id
router.get('/:bid', async (req, res) => {
  try {
    const { bid } = req.params;
    const booking = await bookingManager.getBookingById(bid);

    if (booking.error) {
      return res.status(404).json({ status: 'error', message: booking.error });
    }

    res.json({ status: 'success', payload: booking });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/bookings/:bid/services/:sid -> Agrega un servicio a una reserva existente
router.post('/:bid/services/:sid', async (req, res) => {
  try {
    const { bid, sid } = req.params;
    const result = await bookingManager.addServiceToBooking(bid, sid);

    if (result.error) {
      return res.status(404).json({ status: 'error', message: result.error });
    }

    res.json({ status: 'success', message: 'Servicio agregado a la reserva exitosamente', payload: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;