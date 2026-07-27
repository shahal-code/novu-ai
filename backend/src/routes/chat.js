import express from 'express';
import auth from '../middleware/auth.js';
import { streamChat } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', auth, streamChat);

export default router;
