import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch, { Response } from 'node-fetch';
import { buildSystemPrompt } from '@shared/constants/prompts';

export const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const CHAT_MODEL = 'llama-3.3-70b-versatile';

@Injectable()
export class GroqLlmAdapter {
  constructor(private readonly configService: ConfigService) {}

  buildChatPayload(messages: Array<{ role: string; content: string }>, userName: string, extraContext: string = '') {
    return {
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: buildSystemPrompt(userName, extraContext) },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    };
  }

  async createChatStream(
    messages: Array<{ role: string; content: string }>,
    userName: string,
    extraContext: string = '',
  ): Promise<Response> {
    const apiKey = this.configService.get<string>('GROQ_API_KEY') || '';
    const payload = this.buildChatPayload(messages, userName, extraContext);

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Connection': 'keep-alive',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    return response;
  }
}
