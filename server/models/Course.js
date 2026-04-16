import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true },
  notesUrl: { type: String },
  duration: { type: Number, required: true }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  domain: { type: String, required: true },
  thumbnail: { type: String },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessions: [sessionSchema],
  durationWeeks: { type: Number, default: 4 },
  enrollmentCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
