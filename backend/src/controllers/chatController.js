import { MESSAGES } from '../constants/messages.js';
import { StringDecoder } from 'string_decoder';
import User from '../models/User.js';
import { buildChatPayload, createChatStream } from '../services/chatService.js';
import { webSearch, needsWebSearch, formatResultsAsContext } from '../services/webSearch.js';
import { loadMemoryContext, extractAndSaveFacts } from '../services/memory.js';

export async function streamChat(req, res) {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: MESSAGES.CHAT.MESSAGES_REQUIRED });
    }

    const user = await User.findById(req.userId).select('name email');
    const userName = user?.name?.trim() || user?.email?.split('@')[0] || 'there';

    // ── Memory context ──
    const memoryContext = await loadMemoryContext(req.userId);

    // ── Web search context ──
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    let searchContext = '';
    let searchResults = [];
    if (needsWebSearch(lastUserMsg)) {
      searchResults = await webSearch(lastUserMsg);
      searchContext = formatResultsAsContext(searchResults);
    }

    const groqRes = await createChatStream(messages, userName, memoryContext + searchContext);

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return res.status(groqRes.status).json({ error: errText });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    // Send search metadata first so the frontend can show source cards
    if (searchResults.length) {
      res.write(`data: ${JSON.stringify({ searchResults })}\n\n`);
      res.flush?.();
    }

    const decoder = new StringDecoder('utf8');
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

    await new Promise((resolve, reject) => {
      groqRes.body.on('data', (chunk) => {
        buffer += decoder.write(chunk);
        let newlineIndex = buffer.indexOf('\n');
        while (newlineIndex !== -1) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          flushLine(line);
          newlineIndex = buffer.indexOf('\n');
        }
      });

      groqRes.body.on('end', () => {
        buffer += decoder.end();
        if (buffer.trim()) flushLine(buffer);
        resolve();
      });

      groqRes.body.on('error', (error) => reject(error));
    });

    // ── Save new memory facts asynchronously (don't block response) ──
    extractAndSaveFacts(req.userId, messages).catch(() => {});

  } catch (err) {
    console.error('Chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  } finally {
    res.write('data: [DONE]\n\n');
    res.flush?.();
    res.end();
  }
}
