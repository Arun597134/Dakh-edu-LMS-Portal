import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Enroll in a course
router.post('/:courseId', protect, async (req, res) => {
  try {
    const exists = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
    if (exists) return res.status(400).json({ message: 'Already enrolled' });

    const enroll = await Enrollment.create({ student: req.user._id, course: req.params.courseId });
    await Course.findByIdAndUpdate(req.params.courseId, { $inc: { enrollmentCount: 1 } });
    res.status(201).json(enroll);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get My Enrollments
router.get('/my', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id }).populate('course');
    res.json(enrollments);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Check Enrollment
router.get('/check/:courseId', protect, async (req, res) => {
  try {
    const exists = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
    res.json({ enrolled: !!exists });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

export default router;
