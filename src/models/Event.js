import { Schema, model } from 'mongoose';

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'finished'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export const Event = model('Event', eventSchema);
