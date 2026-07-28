import express from 'express';
import auth from '../middleware/auth.js';
import * as executeController from '../controllers/executeController.js';

const router = express.Router();

// GET /api/execute/runtimes — list supported languages
router.get('/runtimes', auth, executeController.getRuntimes);

// POST /api/execute — run code
router.post('/', auth, executeController.executeCode);

export default router;
