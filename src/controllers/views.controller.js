import ServicesDao from '../dao/services.dao.js';
import ServicesRepository from '../repositories/services.repository.js';
import ServicesService from '../services/services.service.js';
import BookingsDao from '../dao/bookings.dao.js';
import BookingsRepository from '../repositories/bookings.repository.js';
import BookingsService from '../services/bookings.service.js';

const servicesService = new ServicesService(
  new ServicesRepository(new ServicesDao())
);

const bookingsService = new BookingsService(
  new BookingsRepository(new BookingsDao()),
  new ServicesRepository(new ServicesDao())
);

export const renderServices = async (req, res, next) => {
  try {
    const { payload: services } = await servicesService.getServices({ paginate: false });
    res.render('services', {
      title: 'Servicios disponibles',
      services
    });
  } catch (error) {
    next(error);
  }
};

export const renderBookings = async (req, res, next) => {
  try {
    const bookings = await bookingsService.getBookings();
    res.render('bookings', {
      title: 'Reservas y turnos',
      bookings
    });
  } catch (error) {
    next(error);
  }
};
