import * as uploadService from '../services/uploadService.js';
import { handleError } from '../utils/errorHandler.js';
import { MESSAGES } from '../constants/messages.js';

export async function handleUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: MESSAGES.GLOBAL.NO_FILE });
    }

    const { mimetype, buffer, originalname, size } = req.file;

    // PDF extraction
    if (mimetype === 'application/pdf') {
      const text = await uploadService.parsePdf(buffer);
      return res.json({
        type: 'document',
        name: originalname,
        size,
        content: text,
      });
    }

    // Plain text
    if (mimetype === 'text/plain') {
      const text = await uploadService.parseText(buffer);
      return res.json({
        type: 'document',
        name: originalname,
        size,
        content: text,
      });
    }

    // Images
    if (mimetype.startsWith('image/')) {
      const dataUrl = uploadService.parseImage(buffer, mimetype);
      return res.json({
        type: 'image',
        name: originalname,
        size,
        mimeType: mimetype,
        dataUrl,
      });
    }

    // Audio/Video Transcription
    if (mimetype.startsWith('audio/') || mimetype.startsWith('video/')) {
      const content = await uploadService.transcribeAudio(buffer, mimetype, originalname);
      return res.json({
        type: 'document',
        name: originalname,
        size,
        content,
      });
    }

    res.status(400).json({ error: MESSAGES.GLOBAL.UNSUPPORTED_FILE });
  } catch (err) {
    handleError(res, err, 'Upload processing failed');
  }
}
