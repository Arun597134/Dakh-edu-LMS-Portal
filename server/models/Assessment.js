import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  level: { type: Number, default: 1 } // 1: Easy, 2: Medium, 3: Hard
});

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [questionSchema],
  published: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Assessment', assessmentSchema);
