export default class BookingsService {
  constructor(bookingsRepository, servicesRepository) {
    this.bookingsRepository = bookingsRepository;
    this.servicesRepository = servicesRepository;
  }

  async createBooking(bookingData) {
    const { clientName, clientEmail, date, time, status, services } = bookingData;

    if (!clientName || !clientEmail || !date || !time) {
      return { error: "Faltan campos obligatorios para la reserva: clientName, clientEmail, date, time" };
    }

    const validatedServices = [];
    if (Array.isArray(services) && services.length > 0) {
      for (const item of services) {
        const serviceId = item.service;
        const serviceExists = await this.servicesRepository.getById(serviceId);
        if (!serviceExists) {
          return { error: `No se puede crear la reserva. El servicio con id ${serviceId} no existe.` };
        }
        validatedServices.push({
          service: Number(serviceId),
          quantity: item.quantity && item.quantity > 0 ? item.quantity : 1
        });
      }
    }

    const allBookings = await this.bookingsRepository.getAll();
    const newId = allBookings.length > 0 ? Math.max(...allBookings.map(b => Number(b.id))) + 1 : 1;

    const newBooking = {
      id: newId,
      clientName,
      clientEmail,
      date,
      time,
      status: status || 'pendiente',
      services: validatedServices
    };

    return await this.bookingsRepository.create(newBooking);
  }

  async getBookingById(id) {
    const booking = await this.bookingsRepository.getById(id);
    if (!booking) {
      return { error: `Reserva con id ${id} no encontrada` };
    }
    return booking;
  }

  async addServiceToBooking(bid, sid) {
    const booking = await this.bookingsRepository.getById(bid);
    if (!booking) {
      return { error: `Reserva con id ${bid} no encontrada` };
    }

    const service = await this.servicesRepository.getById(sid);
    if (!service) {
      return { error: `No se puede agregar. El servicio con id ${sid} no existe` };
    }

    // Regla de negocio: si el servicio ya existe en la reserva, incrementa quantity
    const serviceIndex = booking.services.findIndex(item => String(item.service) === String(sid));

    if (serviceIndex !== -1) {
      booking.services[serviceIndex].quantity += 1;
    } else {
      booking.services.push({
        service: Number(sid),
        quantity: 1
      });
    }

    return await this.bookingsRepository.update(bid, { services: booking.services });
  }
}