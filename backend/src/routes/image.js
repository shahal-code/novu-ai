import express from 'express';
import auth from '../middleware/auth.js';
import fetch from 'node-fetch';

const router = express.Router();

/**
 * POST /api/image/generate
 * Body: { prompt: string }
 * Uses Pollinations.ai — completely free, no API key required.
 */
router.post('/generate', auth, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const seed = Math.floor(Math.random() * 1000000);
    const encoded = encodeURIComponent(prompt.trim());
    // Pollinations.ai free image generation endpoint
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=512&seed=${seed}&model=flux&nologo=true`;

    // Verify the image is reachable (HEAD request)
    const check = await fetch(imageUrl, { method: 'HEAD' });
    if (!check.ok) {
      return res.status(502).json({ error: 'Image generation service unavailable' });
    }

    res.json({
      url: imageUrl,
      prompt: prompt.trim(),
      seed,
    });
  } catch (err) {
    console.error('Image generation error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
