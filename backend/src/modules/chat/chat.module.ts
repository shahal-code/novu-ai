import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './services/chat.service';
import { MemoryModule } from '@modules/memory/memory.module';
import { DuckDuckGoSearchAdapter } from '@infrastructure/search/duckduckgo-search.adapter';
import { GroqLlmAdapter } from '@infrastructure/llm/groq-llm.adapter';

@Module({
  imports: [MemoryModule],
  controllers: [ChatController],
  providers: [ChatService, DuckDuckGoSearchAdapter, GroqLlmAdapter],
  exports: [ChatService],
})
export class ChatModule {}
