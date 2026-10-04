import fs from 'fs';
import ServiceManager from './ServiceManager.js';

export default class BookingManager {
  constructor(filePath, servicesFilePath) {
    this.path = filePath;
    this.serviceManager = new ServiceManager(servicesFilePath);
  }

  async #readFile() {
    try {
      if (!fs.existsSync(this.path)) {
        await fs.promises.writeFile(this.path, JSON.stringify([], null, 2));
        return [];
      }
      const data = await fs.promises.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error("Error al leer el archivo de reservas:", error);
      return [];
    }
  }

  async #writeFile(bookings) {
    await fs.promises.writeFile(this.path, JSON.stringify(bookings, null, 2));
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
        const serviceExists = await this.serviceManager.getServiceById(serviceId);
        if (serviceExists.error) {
          return { error: `No se puede crear la reserva. El servicio con id ${serviceId} no existe.` };
        }
        validatedServices.push({
          service: Number(serviceId),
          quantity: item.quantity && item.quantity > 0 ? item.quantity : 1
        });
      }
    }

    const bookings = await this.#readFile();
    const newId = bookings.length > 0 ? Math.max(...bookings.map(b => Number(b.id))) + 1 : 1;

    const newBooking = {
      id: newId,
      clientName,
      clientEmail,
      date,
      time,
      status: status || 'pendiente',
      services: validatedServices
    };

    bookings.push(newBooking);
    await this.#writeFile(bookings);

    return newBooking;
  }

  async getBookingById(id) {
    const bookings = await this.#readFile();
    const booking = bookings.find(b => String(b.id) === String(id));
    if (!booking) {
      return { error: `Reserva con id ${id} no encontrada` };
    }
    return booking;
  }

  async addServiceToBooking(bid, sid) {
    const bookings = await this.#readFile();
    const bookingIndex = bookings.findIndex(b => String(b.id) === String(bid));

    if (bookingIndex === -1) {
      return { error: `Reserva con id ${bid} no encontrada` };
    }

    const service = await this.serviceManager.getServiceById(sid);
    if (service.error) {
      return { error: `No se puede agregar. El servicio con id ${sid} no existe` };
    }

    const booking = bookings[bookingIndex];
    const serviceIndex = booking.services.findIndex(item => String(item.service) === String(sid));

    if (serviceIndex !== -1) {
      booking.services[serviceIndex].quantity += 1;
    } else {
      booking.services.push({
        service: Number(sid),
        quantity: 1
      });
    }

    bookings[bookingIndex] = booking;
    await this.#writeFile(bookings);

    return booking;
  }
}