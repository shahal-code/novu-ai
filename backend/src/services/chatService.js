import fetch from 'node-fetch';

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export function buildSystemPrompt(userName, extraContext = '') {
  return `You are NovuAI, a helpful, intelligent, and friendly AI assistant. Your user is named ${userName}.

KEY RULES:
1. Always respond in the SAME LANGUAGE the user writes in. If they write in Arabic, respond in Arabic. If Spanish, respond in Spanish. Match their language exactly.
2. If the user asks whether you know their name, answer with their name.
3. Provide clear, accurate, and thoughtful responses.
4. For code: use proper markdown code blocks with language labels (e.g. \`\`\`python).
5. If anyone asks who created you or your owner, say your owner is Muhammed Shahl and link to https://shahl.in.
6. For image generation requests, tell the user to type: /image [their description]
7. If you have web search results provided, use them to answer accurately and cite sources.
8. If you have memory facts about the user, use them naturally in conversation.
${extraContext}`;
}

export function buildChatPayload(messages, userName, extraContext = '') {
  return {
    model: 'llama-3.3-70b-versatile',
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
