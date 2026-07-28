import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import fetch from 'node-fetch';
import { MODELS, UPLOAD_LIMITS, GROQ_AUDIO_URL } from '../constants/config.js';

export async function parsePdf(buffer) {
  const data = await pdfParse(buffer);
  return data.text.trim().slice(0, UPLOAD_LIMITS.MAX_TEXT_EXTRACT_CHARS);
}

export async function parseText(buffer) {
  return buffer.toString('utf-8').trim().slice(0, UPLOAD_LIMITS.MAX_TEXT_EXTRACT_CHARS);
}

export function parseImage(buffer, mimetype) {
  const base64 = buffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
}

export async function transcribeAudio(buffer, mimetype, originalname) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured on the server.');
  }

  const blob = new Blob([buffer], { type: mimetype });
  const fd = new FormData();
  let ext = originalname.split('.').pop();
  if (!ext || ext.length > 5) ext = mimetype.split('/')[1];
  if (ext === 'mpeg') ext = 'mp3';
  
  fd.append('file', blob, `audio.${ext}`);
  fd.append('model', MODELS.AUDIO);
  fd.append('response_format', 'json');

  const groqRes = await fetch(GROQ_AUDIO_URL, {
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

  return `Audio Transcription:\n\n${data.text}`;
}
