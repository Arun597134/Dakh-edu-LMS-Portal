import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  text: { type: String, required: true },
  timestamp: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Note', noteSchema);
