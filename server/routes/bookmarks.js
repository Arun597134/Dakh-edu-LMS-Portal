import express from 'express';
import Bookmark from '../models/Bookmark.js';
import Course from '../models/Course.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ student: req.user._id }).sort({ createdAt: -1 });
    // Transform to match front-end formatting visually if needed, the API is generic enough.
    const populated = await Promise.all(bookmarks.map(async (b) => {
       const c = await Course.findById(b.courseId);
       const s = c?.sessions?.id(b.sessionId);
       return { _id: b._id, session: s ? { ...s.toObject(), courseId: c._id } : null, courseTitle: c?.title };
    }));
    res.json(populated.filter(x => x.session));
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/check/:sessionId', protect, async (req, res) => {
  try {
    const exists = await Bookmark.findOne({ student: req.user._id, sessionId: req.params.sessionId });
    res.json({ bookmarked: !!exists });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/:sessionId', protect, async (req, res) => {
  try {
    const exists = await Bookmark.findOne({ student: req.user._id, sessionId: req.params.sessionId });
    if (exists) {
      await exists.deleteOne();
      return res.json({ message: 'Bookmark removed', bookmarked: false });
    }
    
    // Find course of this session
    const course = await Course.findOne({ 'sessions._id': req.params.sessionId });
    if (!course) return res.status(404).json({ message: 'Session not found' });

    await Bookmark.create({
      student: req.user._id,
      sessionId: req.params.sessionId,
      courseId: course._id,
    });
    res.status(201).json({ message: 'Bookmark added', bookmarked: true });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

export default router;
