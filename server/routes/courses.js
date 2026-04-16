import express from 'express';
import Course from '../models/Course.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all courses (with filtering)
router.get('/', async (req, res) => {
  try {
    const { domain, search, instructor } = req.query;
    let query = {};
    if (domain && domain !== 'All') query.domain = domain;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (instructor) query.instructor = instructor;

    const courses = await Course.find(query).populate('instructor', 'name');
    res.json({ courses, total: courses.length, totalPages: 1 });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Create course
router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = new Course({ ...req.body, instructor: req.user._id });
    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Update course
router.put('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    Object.assign(course, req.body);
    await course.save();
    res.json(course);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Delete course
router.delete('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await course.deleteOne();
    res.json({ message: 'Course removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Add session
router.post('/:courseId/sessions', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    course.sessions.push(req.body);
    await course.save();
    res.status(201).json(course.sessions[course.sessions.length - 1]);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Update session
router.put('/:courseId/sessions/:sessionId', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const session = course.sessions.id(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    Object.assign(session, req.body);
    await course.save();
    res.json(session);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Delete session
router.delete('/:courseId/sessions/:sessionId', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    course.sessions.pull({ _id: req.params.sessionId });
    await course.save();
    res.json({ message: 'Session removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

export default router;
