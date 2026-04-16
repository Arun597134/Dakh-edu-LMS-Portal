import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  sessionTitle: String,
  courseTitle: String,
  duration: Number
}, { timestamps: true });

export default mongoose.model('Bookmark', bookmarkSchema);
