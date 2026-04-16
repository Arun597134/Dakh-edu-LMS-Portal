import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  watchPercentage: { type: Number, default: 0 },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Progress', progressSchema);
