import mongoose from 'mongoose';

const ALLOWED_STATUS = ['pendiente', 'confirmada', 'cancelada', 'completada'];

const normalizeServiceRef = (service) => service?._id || service;

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

    if (status && !ALLOWED_STATUS.includes(status)) {
      return { error: "El campo 'status' no es válido" };
    }

    const validatedServices = [];
    if (Array.isArray(services)) {
      for (const item of services) {
        const serviceId = item?.service;
        const quantity = item?.quantity ?? 1;

        if (!Number.isInteger(quantity) || quantity <= 0) {
          return { error: "El campo 'quantity' debe ser un entero positivo" };
        }

        if (!mongoose.isValidObjectId(serviceId)) {
          return { error: `No se puede crear la reserva. El servicio con id ${serviceId} no existe.` };
        }

        const serviceExists = await this.servicesRepository.getById(serviceId);
        if (!serviceExists) {
          return { error: `No se puede crear la reserva. El servicio con id ${serviceId} no existe.` };
        }

        validatedServices.push({
          service: serviceId,
          quantity
        });
      }
    }

    return await this.bookingsRepository.create({
      clientName,
      clientEmail,
      date,
      time,
      status: status || 'pendiente',
      services: validatedServices
    });
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

  async confirmBooking(id) {
    const booking = await this.getBookingById(id);
    if (booking.error) return booking;
    return this.bookingsRepository.update(id, { status: 'confirmada' });
  }

  async addServiceToBooking(bid, sid, quantity = 1) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { error: "El campo 'quantity' debe ser un entero positivo", status: 400 };
    }

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

    const serviceIndex = booking.services.findIndex((item) => (
      String(normalizeServiceRef(item.service)) === String(sid)
    ));

    if (serviceIndex !== -1) {
      booking.services[serviceIndex].quantity += quantity;
    } else {
      booking.services.push({
        service: sid,
        quantity
      });
    }

    const services = booking.services.map((item) => ({
      service: normalizeServiceRef(item.service),
      quantity: item.quantity
    }));

    return await this.bookingsRepository.update(bid, { services });
  }
}
