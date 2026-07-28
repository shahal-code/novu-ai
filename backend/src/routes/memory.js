import express from 'express';
import auth from '../middleware/auth.js';
import { getUserMemory, deleteMemoryFact, clearAllMemory } from '../services/memory.js';

const router = express.Router();

// GET /api/memory — get all stored facts for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const mem = await getUserMemory(req.userId);
    res.json({ facts: mem?.facts ?? [], preferences: mem?.preferences ?? {} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/memory/:factId — delete a single fact
router.delete('/:factId', auth, async (req, res) => {
  try {
    await deleteMemoryFact(req.userId, req.params.factId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/memory — clear all memory
router.delete('/', auth, async (req, res) => {
  try {
    await clearAllMemory(req.userId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
