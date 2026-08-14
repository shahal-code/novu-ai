import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import fetch from 'node-fetch';

export const MAX_TEXT_EXTRACT_CHARS = 8000;
export const GROQ_AUDIO_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
export const AUDIO_MODEL = 'whisper-large-v3-turbo';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(private readonly configService: ConfigService) {}

  async parsePdf(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return data.text.trim().slice(0, MAX_TEXT_EXTRACT_CHARS);
  }

  async parseText(buffer: Buffer): Promise<string> {
    return buffer.toString('utf-8').trim().slice(0, MAX_TEXT_EXTRACT_CHARS);
  }

  parseImage(buffer: Buffer, mimetype: string): string {
    const base64 = buffer.toString('base64');
    return `data:${mimetype};base64,${base64}`;
  }

  async transcribeAudio(buffer: Buffer, mimetype: string, originalname: string): Promise<string> {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured on the server.');
    }

    const blob = new Blob([new Uint8Array(buffer)], { type: mimetype });
    const fd = new FormData();
    let ext = originalname.split('.').pop();
    if (!ext || ext.length > 5) ext = mimetype.split('/')[1];
    if (ext === 'mpeg') ext = 'mp3';

    fd.append('file', blob, `audio.${ext}`);
    fd.append('model', AUDIO_MODEL);
    fd.append('response_format', 'json');

    const groqRes = await fetch(GROQ_AUDIO_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: fd,
    });

    const data: any = await groqRes.json();

    if (!groqRes.ok) {
      throw new Error(data.error?.message || 'Failed to transcribe audio via Groq');
    }

    return `Audio Transcription:\n\n${data.text}`;
  }

  async processUpload(file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const { mimetype, buffer, originalname, size } = file;

    // PDF extraction
    if (mimetype === 'application/pdf') {
      const text = await this.parsePdf(buffer);
      return {
        type: 'document',
        name: originalname,
        size,
        content: text,
      };
    }

    // Plain text
    if (mimetype === 'text/plain') {
      const text = await this.parseText(buffer);
      return {
        type: 'document',
        name: originalname,
        size,
        content: text,
      };
    }

    // Images
    if (mimetype.startsWith('image/')) {
      const dataUrl = this.parseImage(buffer, mimetype);
      return {
        type: 'image',
        name: originalname,
        size,
        mimeType: mimetype,
        dataUrl,
      };
    }

    // Audio/Video Transcription
    if (mimetype.startsWith('audio/') || mimetype.startsWith('video/')) {
      const content = await this.transcribeAudio(buffer, mimetype, originalname);
      return {
        type: 'document',
        name: originalname,
        size,
        content,
      };
    }

    throw new Error('Unsupported file type');
  }
}
