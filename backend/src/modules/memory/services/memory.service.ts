import { Injectable, Inject, Logger } from '@nestjs/common';
import { MEMORY_REPOSITORY, IMemoryRepository } from '@domain/repositories/memory.repository.interface';
import { MemoryFact } from '@domain/entities/memory.entity';

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(
    @Inject(MEMORY_REPOSITORY) private readonly memoryRepository: IMemoryRepository,
  ) {}

  async getUserMemory(userId: string) {
    try {
      const mem = await this.memoryRepository.findByUserId(userId);
      return {
        facts: mem?.facts ?? [],
        preferences: mem?.preferences ?? {},
      };
    } catch (err: any) {
      this.logger.error(`Failed to get user memory: ${err.message}`);
      return { facts: [], preferences: {} };
    }
  }

  async deleteFact(userId: string, factId: string) {
    await this.memoryRepository.deleteFact(userId, factId);
    return { ok: true };
  }

  async clearAllMemory(userId: string) {
    await this.memoryRepository.clearAll(userId);
    return { ok: true };
  }

  async loadMemoryContext(userId: string): Promise<string> {
    try {
      const mem = await this.memoryRepository.findByUserId(userId);
      if (!mem || !mem.facts.length) return '';

      const factLines = mem.facts
        .slice(-12)
        .map((f) => `- ${f.text}`)
        .join('\n');

      return `\n\n--- USER MEMORY ---\nThings you remember about this user:\n${factLines}\n--- END MEMORY ---`;
    } catch {
      return '';
    }
  }

  async extractAndSaveFacts(userId: string, messages: Array<{ role: string; content: string }>) {
    try {
      const factTriggers = [
        /my name is ([a-zA-Z\s]+)/i,
        /i am ([a-zA-Z\s]+) years old/i,
        /i work as ([a-zA-Z\s]+)/i,
        /i am from ([a-zA-Z\s]+)/i,
        /i live in ([a-zA-Z\s]+)/i,
        /i like ([a-zA-Z\s,]+)/i,
        /i love ([a-zA-Z\s,]+)/i,
        /i prefer ([a-zA-Z\s,]+)/i,
        /i am a ([a-zA-Z\s]+)/i,
        /call me ([a-zA-Z\s]+)/i,
      ];

      const userMessages = messages
        .filter((m) => m.role === 'user')
        .map((m) => m.content)
        .slice(-5);

      const newFacts: MemoryFact[] = [];

      for (const msg of userMessages) {
        for (const trigger of factTriggers) {
          const match = msg.match(trigger);
          if (match) {
            const factText = `${match[0].charAt(0).toUpperCase()}${match[0].slice(1)}`;
            newFacts.push({ text: factText });
          }
        }
      }

      if (!newFacts.length) return;

      await this.memoryRepository.addFacts(userId, newFacts);
    } catch (err: any) {
      this.logger.error(`Memory save error: ${err.message}`);
    }
  }
}
