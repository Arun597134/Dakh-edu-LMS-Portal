import express from 'express';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Update Session Progress
router.put('/:sessionId', protect, async (req, res) => {
  try {
    const { watchPercentage, completed, courseId } = req.body;
    let progress = await Progress.findOne({ student: req.user._id, sessionId: req.params.sessionId });
    
    if (progress) {
      progress.watchPercentage = Math.max(progress.watchPercentage, watchPercentage);
      if (completed) progress.completed = true;
      await progress.save();
    } else {
      progress = await Progress.create({
        student: req.user._id,
        sessionId: req.params.sessionId,
        courseId,
        watchPercentage,
        completed
      });
    }
    res.json(progress);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get Session Progress
router.get('/session/:sessionId', protect, async (req, res) => {
  try {
    const progress = await Progress.findOne({ student: req.user._id, sessionId: req.params.sessionId });
    res.json(progress || { watchPercentage: 0, completed: false });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get Course Progress (aggregate overall)
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    // Get total session count from the course itself
    const course = await Course.findById(req.params.courseId);
    const totalSessions = course?.sessions?.length || 1;

    const progressArray = await Progress.find({ student: req.user._id, courseId: req.params.courseId });
    const completedCount = progressArray.filter(p => p.completed).length;
    
    res.json({ 
      completionPercentage: Math.round((completedCount / totalSessions) * 100),
      completedSessions: completedCount,
      totalSessions
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

export default router;

