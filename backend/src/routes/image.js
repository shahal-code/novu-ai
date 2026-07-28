import express from 'express';
import auth from '../middleware/auth.js';
import * as imageController from '../controllers/imageController.js';

const router = express.Router();

/**
 * POST /api/image/generate
 * Body: { prompt: string }
 */
router.post('/generate', auth, imageController.generateImage);

export default router;
