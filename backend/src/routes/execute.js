import express from 'express';
import auth from '../middleware/auth.js';
import fetch from 'node-fetch';

const router = express.Router();

const PISTON_URL = 'https://emkc.org/api/v2/piston';

// GET /api/execute/runtimes — list supported languages
router.get('/runtimes', auth, async (req, res) => {
  try {
    const resp = await fetch(`${PISTON_URL}/runtimes`);
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/execute
 * Body: { language: string, version?: string, code: string, stdin?: string }
 */
router.post('/', auth, async (req, res) => {
  try {
    const { language, code, stdin = '', version = '*' } = req.body;
    if (!language || !code) {
      return res.status(400).json({ error: 'language and code are required' });
    }

    const payload = {
      language,
      version,
      files: [{ content: code }],
      stdin,
      args: [],
      run_timeout: 5000,   // 5s max execution time
      compile_timeout: 10000,
    };

    const resp = await fetch(`${PISTON_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await resp.json();

    res.json({
      language: result.language,
      version: result.version,
      stdout: result.run?.stdout ?? '',
      stderr: result.run?.stderr ?? '',
      code: result.run?.code ?? 0,
      signal: result.run?.signal ?? null,
    });
  } catch (err) {
    console.error('Execute error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
