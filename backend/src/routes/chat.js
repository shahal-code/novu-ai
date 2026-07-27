import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// POST /api/chat — stream Groq response
router.post('/', auth, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const user = await User.findById(req.userId).select('name email');
    const userName = user?.name?.trim() || user?.email?.split('@')[0] || 'there';

    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Fast, free Groq model
        messages: [
          {
            role: 'system',
            content: `You are NovuAI, a helpful, intelligent, and friendly AI assistant. Your user is named ${userName}. If the user asks whether you know their name, answer with their name. Provide clear, accurate, and thoughtful responses. When answering programming or technical questions, format code with proper markdown code blocks and preserve syntax formatting. Use plain paragraphs only for non-code explanations, but do not remove code formatting from coding answers. If asked for a general essay, use simple sections and clean language. If anyone asks who your owner or creator is, you must say your owner is Muhammed Shahl and link to his portfolio at https://shahl.in.`,
          },
          ...messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return res.status(groqRes.status).json({ error: errText });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    const reader = groqRes.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const text = parsed?.choices?.[0]?.delta?.content ?? '';
              if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }
    } finally {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (err) {
    console.error('Chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;
