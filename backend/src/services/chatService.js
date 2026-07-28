import { ENV } from '../config/env.js';
import fetch from 'node-fetch';
import { buildSystemPrompt } from '../constants/prompts.js';
import { GROQ_URL, MODELS } from '../constants/config.js';

const GROQ_API_KEY = ENV.GROQ_API_KEY ?? '';

export function buildChatPayload(messages, userName, extraContext = '') {
  return {
    model: MODELS.CHAT,
    messages: [
      { role: 'system', content: buildSystemPrompt(userName, extraContext) },
      ...messages.map((message) => ({ role: message.role, content: message.content })),
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 4096,
  };
}

export async function createChatStream(messages, userName, extraContext = '') {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Connection': 'keep-alive',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(buildChatPayload(messages, userName, extraContext)),
  });

  return response;
}
