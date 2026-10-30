import mongoose from 'mongoose';

export default class BookingsService {
  constructor(bookingsRepository, servicesRepository) {
    this.bookingsRepository = bookingsRepository;
    this.servicesRepository = servicesRepository;
  }

  async getBookings() {
    return await this.bookingsRepository.getAll();
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
        if (!mongoose.isValidObjectId(serviceId)) {
          return { error: `No se puede crear la reserva. El servicio con id ${serviceId} no existe.` };
        }

        const serviceExists = await this.servicesRepository.getById(serviceId);
        if (!serviceExists) {
          return { error: `No se puede crear la reserva. El servicio con id ${serviceId} no existe.` };
        }
        validatedServices.push({
          service: serviceId,
          quantity: Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1
        });
      }
    }

    const newBooking = {
      clientName,
      clientEmail,
      date,
      time,
      status: status || 'pendiente',
      services: validatedServices
    };

    if (status && !['pendiente', 'confirmada', 'cancelada', 'completada'].includes(status)) {
      return { error: "El campo 'status' no es válido" };
    }

    return await this.bookingsRepository.create(newBooking);
  }

  async getBookingById(id) {
    if (!mongoose.isValidObjectId(id)) {
      return { error: `Reserva con id ${id} no encontrada` };
    }

    const booking = await this.bookingsRepository.getById(id);
    if (!booking) {
      return { error: `Reserva con id ${id} no encontrada` };
    }
    return booking;
  }

  async addServiceToBooking(bid, sid) {
    if (!mongoose.isValidObjectId(bid)) {
      return { error: `Reserva con id ${bid} no encontrada` };
    }
    if (!mongoose.isValidObjectId(sid)) {
      return { error: `No se puede agregar. El servicio con id ${sid} no existe` };
    }

    const booking = await this.bookingsRepository.getById(bid);
    if (!booking) {
      return { error: `Reserva con id ${bid} no encontrada` };
    }

    const service = await this.servicesRepository.getById(sid);
    if (!service) {
      return { error: `No se puede agregar. El servicio con id ${sid} no existe` };
    }

    // Regla de negocio: si el servicio ya existe en la reserva, incrementa quantity
    const serviceIndex = booking.services.findIndex(item => {
      const serviceId = item.service?._id || item.service;
      return String(serviceId) === String(sid);
    });

    if (serviceIndex !== -1) {
      booking.services[serviceIndex].quantity += 1;
    } else {
      booking.services.push({
        service: sid,
        quantity: 1
      });
    }

    const services = booking.services.map(item => ({
      service: item.service?._id || item.service,
      quantity: item.quantity
    }));

    return await this.bookingsRepository.update(bid, { services });
  }
}