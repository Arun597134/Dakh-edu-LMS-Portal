import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ type: Number }], // index of selected option for each question
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  feedback: { type: String }
}, { timestamps: true });

export default mongoose.model('AssessmentAttempt', attemptSchema);
