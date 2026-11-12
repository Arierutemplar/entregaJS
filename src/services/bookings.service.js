import { HttpError, assertFound } from '../utils/httpError.js';

const ALLOWED_STATUS = ['pendiente', 'confirmada', 'cancelada', 'completada'];

const normalizeServiceRef = (service) => service?._id || service;

export default class BookingsService {
  constructor(bookingsRepository, servicesRepository, mailService = null) {
    this.bookingsRepository = bookingsRepository;
    this.servicesRepository = servicesRepository;
    this.mailService = mailService;
  }

  #dispatchMail(booking, event) {
    if (!this.mailService || !booking?.clientEmail) return;
    void this.mailService.sendBookingNotice(booking, event).catch((error) => {
      console.error(`No se pudo enviar el correo de la reserva: ${error.message}`);
    });
  }

  async getBookings() {
    return await this.bookingsRepository.getAll();
  }

  async #resolveServiceRefs(services = [], action) {
    const validatedServices = [];

    for (const item of services) {
      const serviceId = item?.service;
      const quantity = item?.quantity ?? 1;

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new HttpError(400, "El campo 'quantity' debe ser un entero positivo");
      }

      const serviceExists = await this.servicesRepository.getById(serviceId);
      if (!serviceExists) {
        throw new HttpError(400, `No se puede ${action} la reserva. El servicio con id ${serviceId} no existe.`);
      }

      validatedServices.push({
        service: serviceId,
        quantity
      });
    }

    return validatedServices;
  }

  async createBooking(bookingData) {
    const { clientName, clientEmail, date, time, status, services } = bookingData;

    if (status && !ALLOWED_STATUS.includes(status)) {
      throw new HttpError(400, "El campo 'status' no es válido");
    }

    const validatedServices = Array.isArray(services)
      ? await this.#resolveServiceRefs(services, 'crear')
      : [];

    const created = await this.bookingsRepository.create({
      clientName,
      clientEmail,
      date,
      time,
      status: status || 'pendiente',
      services: validatedServices
    });
    this.#dispatchMail(created, created.status === 'confirmada' ? 'confirmed' : 'created');
    return created;
  }

  async getBookingById(id) {
    const booking = await this.bookingsRepository.getById(id);
    return assertFound(booking, `Reserva con id ${id} no encontrada`);
  }

  async updateBooking(id, updateData) {
    const current = await this.getBookingById(id);

    if (updateData.status && !ALLOWED_STATUS.includes(updateData.status)) {
      throw new HttpError(400, "El campo 'status' no es válido");
    }

    const payload = {};
    for (const field of ['clientName', 'clientEmail', 'date', 'time', 'status']) {
      if (updateData[field] !== undefined) {
        payload[field] = updateData[field];
      }
    }

    if (updateData.services !== undefined) {
      payload.services = await this.#resolveServiceRefs(updateData.services, 'actualizar');
    }

    const updated = assertFound(
      await this.bookingsRepository.update(id, payload),
      `Reserva con id ${id} no encontrada`
    );
    if (payload.status === 'confirmada' && current.status !== 'confirmada') {
      this.#dispatchMail(updated, 'confirmed');
    }
    return updated;
  }

  async deleteBooking(id) {
    const deleted = await this.bookingsRepository.delete(id);
    return assertFound(deleted, `Reserva con id ${id} no encontrada`);
  }

  async confirmBooking(id) {
    const current = await this.getBookingById(id);
    const updated = assertFound(
      await this.bookingsRepository.update(id, { status: 'confirmada' }),
      `Reserva con id ${id} no encontrada`
    );
    if (current.status !== 'confirmada') this.#dispatchMail(updated, 'confirmed');
    return updated;
  }

  async addServiceToBooking(bid, sid, quantity = 1) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new HttpError(400, "El campo 'quantity' debe ser un entero positivo");
    }

    const booking = assertFound(
      await this.bookingsRepository.getById(bid),
      `Reserva con id ${bid} no encontrada`
    );

    assertFound(
      await this.servicesRepository.getById(sid),
      `Servicio con id ${sid} no encontrado`
    );

    const currentServices = Array.isArray(booking.services) ? booking.services : [];
    const serviceIndex = currentServices.findIndex((item) => (
      String(normalizeServiceRef(item.service)) === String(sid)
    ));

    if (serviceIndex !== -1) {
      currentServices[serviceIndex].quantity += quantity;
    } else {
      currentServices.push({
        service: sid,
        quantity
      });
    }

    const services = currentServices.map((item) => ({
      service: normalizeServiceRef(item.service),
      quantity: item.quantity
    }));

    const updated = await this.bookingsRepository.update(bid, { services });
    return assertFound(updated, `Reserva con id ${bid} no encontrada`);
  }
}
