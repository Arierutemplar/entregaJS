import mongoose from 'mongoose';

const bookingServiceSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
      default: 'pendiente'
    },
    services: { type: [bookingServiceSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
