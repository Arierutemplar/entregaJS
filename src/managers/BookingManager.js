import fs from 'fs';
import path from 'path';
import ServiceManager from './ServiceManager.js';

export default class BookingManager {
  constructor(filePath, servicesFilePath) {
    this.path = filePath;
    this.serviceManager = new ServiceManager(servicesFilePath);
  }

  // Método privado para leer reservas
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

  // Método privado para escribir reservas
  async #writeFile(bookings) {
    await fs.promises.writeFile(this.path, JSON.stringify(bookings, null, 2));
  }

  // createBooking(bookingData) -> Crea una reserva (puede iniciarse con services vacío)
  async createBooking(bookingData) {
    const { clientName, clientEmail, date, time, status, services } = bookingData;

    // Validar campos obligatorios básicos si es necesario, o asignar valores por defecto
    if (!clientName || !clientEmail || !date || !time) {
      return { error: "Faltan campos obligatorios para la reserva: clientName, clientEmail, date, time" };
    }

    const bookings = await this.#readFile();

    // Generar ID único automáticamente
    const newId = bookings.length > 0 ? Number(bookings[bookings.length - 1].id) + 1 : 1;

    const newBooking = {
      id: newId,
      clientName,
      clientEmail,
      date,
      time,
      status: status || 'pendiente',
      services: Array.isArray(services) ? services : []
    };

    bookings.push(newBooking);
    await this.#writeFile(bookings);

    return newBooking;
  }

  // getBookingById(id) -> Devuelve una reserva por id
  async getBookingById(id) {
    const bookings = await this.#readFile();
    const booking = bookings.find(b => String(b.id) === String(id));

    if (!booking) {
      return { error: `Reserva con id ${id} no encontrada` };
    }

    return booking;
  }

  // addServiceToBooking(bid, sid) -> Agrega un servicio a una reserva existente, validando que ambos existan.
  // Si el mismo servicio se agrega dos veces, se incrementa quantity.
  async addServiceToBooking(bid, sid) {
    const bookings = await this.#readFile();
    const bookingIndex = bookings.findIndex(b => String(b.id) === String(bid));

    if (bookingIndex === -1) {
      return { error: `Reserva con id ${bid} no encontrada` };
    }

    // Validar que el servicio exista usando el ServiceManager
    const service = await this.serviceManager.getServiceById(sid);
    if (service.error) {
      return { error: `No se puede agregar. El servicio con id ${sid} no existe` };
    }

    const booking = bookings[bookingIndex];

    // Verificar si el servicio ya está en la reserva
    const serviceIndex = booking.services.findIndex(item => String(item.service) === String(sid));

    if (serviceIndex !== -1) {
      // Si ya existe, incrementamos la quantity
      booking.services[serviceIndex].quantity += 1;
    } else {
      // Si no existe, lo agregamos con quantity: 1
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