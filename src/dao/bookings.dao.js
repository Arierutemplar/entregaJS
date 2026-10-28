import Booking from '../models/booking.model.js';

const withServices = query => query.populate('services.service').lean();

export default class BookingsDao {
  async getById(id) {
    return withServices(Booking.findById(id));
  }

  async create(bookingData) {
    const booking = await Booking.create(bookingData);
    return withServices(Booking.findById(booking._id));
  }

  async update(id, updateData) {
    return withServices(
      Booking.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      })
    );
  }

  async getAll() {
    return withServices(Booking.find());
  }
}
