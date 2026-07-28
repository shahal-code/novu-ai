import { getUserMemory, deleteMemoryFact, clearAllMemory } from '../services/memory.js';
import { handleError } from '../utils/errorHandler.js';

export async function getMemory(req, res) {
  try {
    const mem = await getUserMemory(req.userId);
    res.json({ facts: mem?.facts ?? [], preferences: mem?.preferences ?? {} });
  } catch (err) {
    handleError(res, err, 'Failed to get user memory');
  }
}

export async function deleteFact(req, res) {
  try {
    await deleteMemoryFact(req.userId, req.params.factId);
    res.json({ ok: true });
  } catch (err) {
    handleError(res, err, 'Failed to delete memory fact');
  }
}

export async function clearMemory(req, res) {
  try {
    await clearAllMemory(req.userId);
    res.json({ ok: true });
  } catch (err) {
    handleError(res, err, 'Failed to clear memory');
  }
}
