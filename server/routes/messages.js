import express from 'express';
import Message from '../models/Message.js';
import Course from '../models/Course.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get conversation for a specific course
router.get('/:courseId/:otherUserId', protect, async (req, res) => {
  try {
    const { courseId, otherUserId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      courseId,
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    }).sort('createdAt');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all conversations for current user
router.get('/my/conversations', protect, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    // Find all messages involving the current user
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
    }).populate('senderId', 'name email').populate('receiverId', 'name email').populate('courseId', 'title');
    
    // Group by conversation (courseId + otherUserId)
    const convosMap = new Map();
    messages.forEach(msg => {
      if (!msg.courseId || !msg.senderId || !msg.receiverId) return;

      const isSender = msg.senderId._id.toString() === currentUserId.toString();
      const otherUser = isSender ? msg.receiverId : msg.senderId;
      const key = `${msg.courseId._id}_${otherUser._id}`;
      
      // Keep only the latest message per conversation
      if (!convosMap.has(key) || convosMap.get(key).updatedAt < msg.createdAt) {
        convosMap.set(key, {
          courseId: msg.courseId,
          otherUser,
          lastMessage: msg.content,
          updatedAt: msg.createdAt,
          isRead: isSender ? true : msg.isRead
        });
      }
    });

    const conversations = Array.from(convosMap.values()).sort((a, b) => b.updatedAt - a.updatedAt);
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send a message
router.post('/', protect, async (req, res) => {
  try {
    const { courseId, receiverId, content } = req.body;
    const message = await Message.create({
      senderId: req.user._id,
      receiverId,
      courseId,
      content
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark messages as read
router.put('/:courseId/:otherUserId/read', protect, async (req, res) => {
  try {
    const { courseId, otherUserId } = req.params;
    const currentUserId = req.user._id;

    await Message.updateMany(
      { courseId, senderId: otherUserId, receiverId: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
