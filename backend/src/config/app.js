export const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const GROQ_AUDIO_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

export const MODELS = {
  CHAT: 'llama-3.3-70b-versatile',
  AUDIO: 'whisper-large-v3-turbo',
};

export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_TEXT_EXTRACT_CHARS: 8000,    // Cap text/PDF extraction to 8k chars for context window
};
