import fetch from 'node-fetch';

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export function buildSystemPrompt(userName) {
  return `You are NovuAI, a helpful, intelligent, and friendly AI assistant. Your user is named ${userName}. If the user asks whether you know their name, answer with their name. Provide clear, accurate, and thoughtful responses. When answering programming or technical questions, format code with proper markdown code blocks and preserve syntax formatting. Use plain paragraphs only for non-code explanations, but do not remove code formatting from coding answers. If asked for a general essay, use simple sections and clean language. If anyone asks who your owner or creator is, you must say your owner is Muhammed Shahl and link to his portfolio at https://shahl.in.`;
}

export function buildChatPayload(messages, userName) {
  return {
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: buildSystemPrompt(userName) },
      ...messages.map((message) => ({ role: message.role, content: message.content })),
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 2048,
  };
}

export async function createChatStream(messages, userName) {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(buildChatPayload(messages, userName)),
  });

  return response;
}
