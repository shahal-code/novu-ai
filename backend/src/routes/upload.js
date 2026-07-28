import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import * as uploadController from '../controllers/uploadController.js';
import { UPLOAD_LIMITS } from '../config/app.js';

const router = express.Router();

// Store files in memory (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_LIMITS.MAX_FILE_SIZE },
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
router.post('/', auth, upload.single('file'), uploadController.handleUpload);

export default router;
