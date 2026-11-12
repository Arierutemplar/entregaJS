import { bookingsService, servicesService } from '../container.js';

export const renderServices = async (req, res, next) => {
  try {
    const { payload: services } = await servicesService.getServices({ paginate: false });
    res.render('services', {
      title: 'Servicios disponibles',
      services,
      active: 'services'
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
      bookings,
      active: 'bookings'
    });
  } catch (error) {
    next(error);
  }
};
