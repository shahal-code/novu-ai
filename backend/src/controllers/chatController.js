import User from '../models/User.js';
import { buildChatPayload, createChatStream } from '../services/chatService.js';

export async function streamChat(req, res) {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const user = await User.findById(req.userId).select('name email');
    const userName = user?.name?.trim() || user?.email?.split('@')[0] || 'there';
    const groqRes = await createChatStream(messages, userName);

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return res.status(groqRes.status).json({ error: errText });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    const reader = groqRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const flushLine = (line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) return;
      const jsonStr = trimmed.slice(6);
      if (jsonStr === '[DONE]') return;
      try {
        const parsed = JSON.parse(jsonStr);
        const text = parsed?.choices?.[0]?.delta?.content ?? '';
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
          res.flush?.();
        }
      } catch {
        // skip malformed chunks
      }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let newlineIndex = buffer.indexOf('\n');
        while (newlineIndex !== -1) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          flushLine(line);
          newlineIndex = buffer.indexOf('\n');
        }
      }

      if (buffer.trim()) {
        flushLine(buffer);
      }
    } finally {
      res.write('data: [DONE]\n\n');
      res.flush?.();
      res.end();
    }
  } catch (err) {
    console.error('Chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
}
