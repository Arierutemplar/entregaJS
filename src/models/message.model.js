import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  user: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Message', messageSchema);
