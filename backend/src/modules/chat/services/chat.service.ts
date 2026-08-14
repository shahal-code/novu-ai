import { Injectable, Inject, Logger } from '@nestjs/common';
import { Response } from 'express';
import { StringDecoder } from 'string_decoder';

import { USER_REPOSITORY, IUserRepository } from '@domain/repositories/user.repository.interface';
import { MemoryService } from '@modules/memory/services/memory.service';
import { DuckDuckGoSearchAdapter } from '@infrastructure/search/duckduckgo-search.adapter';
import { GroqLlmAdapter } from '@infrastructure/llm/groq-llm.adapter';
import { StreamChatDto } from '../dto/chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly memoryService: MemoryService,
    private readonly searchAdapter: DuckDuckGoSearchAdapter,
    private readonly llmAdapter: GroqLlmAdapter,
  ) {}

  async handleChatStream(userId: string, dto: StreamChatDto, res: Response): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);
      const userName = user?.name?.trim() || user?.email?.split('@')[0] || 'there';

      // 1. Memory context
      const memoryContext = await this.memoryService.loadMemoryContext(userId);

      // 2. Web search context
      const lastUserMsg = [...dto.messages].reverse().find((m) => m.role === 'user')?.content ?? '';
      let searchContext = '';
      let searchResults: any[] = [];

      if (this.searchAdapter.needsWebSearch(lastUserMsg)) {
        searchResults = await this.searchAdapter.search(lastUserMsg);
        searchContext = this.searchAdapter.formatResultsAsContext(searchResults);
      }

      // 3. Initiate Groq Stream
      const groqRes = await this.llmAdapter.createChatStream(
        dto.messages,
        userName,
        memoryContext + searchContext,
      );

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        res.status(groqRes.status).json({ error: errText });
        return;
      }

      // 4. Set SSE Headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.flushHeaders();

      // Pushing search metadata first
      if (searchResults.length) {
        res.write(`data: ${JSON.stringify({ searchResults })}\n\n`);
        (res as any).flush?.();
      }

      const decoder = new StringDecoder('utf8');
      let buffer = '';

      const flushLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) return;
        const jsonStr = trimmed.slice(6);
        if (jsonStr === '[DONE]') return;
        try {
          const parsed = JSON.parse(jsonStr);
          const text = parsed?.choices?.[0]?.delta?.content ?? '';
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
            (res as any).flush?.();
          }
        } catch {
          // ignore malformed chunks
        }
      };

      await new Promise<void>((resolve, reject) => {
        groqRes.body.on('data', (chunk: Buffer) => {
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

        groqRes.body.on('error', (error: any) => reject(error));
      });

      // 5. Extract and save memory facts asynchronously
      this.memoryService.extractAndSaveFacts(userId, dto.messages).catch(() => {});

    } catch (err: any) {
      this.logger.error(`Chat error: ${err.message}`, err.stack);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || 'Chat processing error' });
      }
    } finally {
      res.write('data: [DONE]\n\n');
      (res as any).flush?.();
      res.end();
    }
  }
}
