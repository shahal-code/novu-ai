import express from 'express';
import auth from '../middleware/auth.js';
import * as memoryController from '../controllers/memoryController.js';

const router = express.Router();

// GET /api/memory — get all stored facts for the authenticated user
router.get('/', auth, memoryController.getMemory);

// DELETE /api/memory/:factId — delete a single fact
router.delete('/:factId', auth, memoryController.deleteFact);

// DELETE /api/memory — clear all memory
router.delete('/', auth, memoryController.clearMemory);

export default router;
