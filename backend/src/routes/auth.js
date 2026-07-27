import express from 'express';
import auth from '../middleware/auth.js';
import { register, login, requestEmailOtp, verifyEmailOtp, googleRedirect, googleCallback, getProfile } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/email-otp/request', requestEmailOtp);
router.post('/email-otp/verify', verifyEmailOtp);
router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);
router.get('/me', auth, getProfile);

export default router;
