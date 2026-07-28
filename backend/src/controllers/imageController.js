import * as imageService from '../services/imageService.js';
import { handleError } from '../utils/errorHandler.js';

export async function generateImage(req, res) {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = await imageService.generateImageUrl(prompt, seed);

    res.json({
      url: imageUrl,
      prompt: prompt.trim(),
      seed,
    });
  } catch (err) {
    handleError(res, err, 'Image generation failed');
  }
}
