import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

const router = express.Router();

// Store files in memory (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf', 'text/plain', 
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/m4a'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

/**
 * POST /api/upload
 * Returns extracted text for PDFs/text files, or a base64 data URL for images.
 */
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { mimetype, buffer, originalname, size } = req.file;

    // PDF extraction
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(buffer);
      const text = data.text.trim().slice(0, 8000); // cap at 8000 chars for Groq context
      return res.json({
        type: 'document',
        name: originalname,
        size,
        content: text,
        pageCount: data.numpages,
      });
    }

    // Plain text
    if (mimetype === 'text/plain') {
      const text = buffer.toString('utf-8').trim().slice(0, 8000);
      return res.json({
        type: 'document',
        name: originalname,
        size,
        content: text,
      });
    }

    // Images — send as base64 for vision
    if (mimetype.startsWith('image/')) {
      const base64 = buffer.toString('base64');
      return res.json({
        type: 'image',
        name: originalname,
        size,
        mimeType: mimetype,
        dataUrl: `data:${mimetype};base64,${base64}`,
      });
    }

    // Audio — Transcribe using Groq Whisper API
    if (mimetype.startsWith('audio/') || mimetype.startsWith('video/')) {
      if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured on the server.');

      const blob = new Blob([buffer], { type: mimetype });
      const fd = new FormData();
      // Groq requires a filename with an extension that matches the format
      let ext = originalname.split('.').pop();
      if (!ext || ext.length > 5) ext = mimetype.split('/')[1];
      if (ext === 'mpeg') ext = 'mp3';
      
      fd.append('file', blob, `audio.${ext}`);
      fd.append('model', 'whisper-large-v3-turbo');
      fd.append('response_format', 'json');

      const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: fd
      });

      const data = await groqRes.json();
      
      if (!groqRes.ok) {
        throw new Error(data.error?.message || 'Failed to transcribe audio via Groq');
      }

      return res.json({
        type: 'document', // Treat as a text document for the frontend
        name: originalname,
        size,
        content: `Audio Transcription:\n\n${data.text}`,
      });
    }

    res.status(400).json({ error: 'Unsupported file type' });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
