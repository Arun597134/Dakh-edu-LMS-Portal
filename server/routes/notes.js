import express from 'express';
import Note from '../models/Note.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:sessionId', protect, async (req, res) => {
  try {
    const notes = await Note.find({ student: req.user._id, sessionId: req.params.sessionId }).sort({ timestamp: -1 });
    res.json(notes);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/:sessionId', protect, async (req, res) => {
  try {
    const note = await Note.create({
      student: req.user._id,
      sessionId: req.params.sessionId,
      text: req.body.text,
      timestamp: req.body.timestamp
    });
    res.status(201).json(note);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/:noteId', protect, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.noteId, student: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

export default router;
