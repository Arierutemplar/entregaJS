import ServicesDao from './dao/services.dao.js';
import BookingsDao from './dao/bookings.dao.js';
import UsersDao from './dao/users.dao.js';
import ServicesRepository from './repositories/services.repository.js';
import BookingsRepository from './repositories/bookings.repository.js';
import UsersRepository from './repositories/users.repository.js';
import ServicesService from './services/services.service.js';
import BookingsService from './services/bookings.service.js';
import UsersService from './services/users.service.js';
import MailService from './services/mail.service.js';

const servicesRepository = new ServicesRepository(new ServicesDao());
const bookingsRepository = new BookingsRepository(new BookingsDao());
export const usersRepository = new UsersRepository(new UsersDao());

export const mailService = new MailService();
export const servicesService = new ServicesService(servicesRepository);
export const bookingsService = new BookingsService(bookingsRepository, servicesRepository, mailService);
export const usersService = new UsersService(usersRepository);
