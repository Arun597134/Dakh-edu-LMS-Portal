import express from 'express';
import { registerUser, loginUser, logoutUser, getUserProfile, forgotPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgotpassword', forgotPassword);
router.get('/profile', protect, getUserProfile);

export default router;
