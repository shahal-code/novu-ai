import { Module } from '@nestjs/common';
import { MemoryController } from './memory.controller';
import { MemoryService } from './services/memory.service';

@Module({
  controllers: [MemoryController],
  providers: [MemoryService],
  exports: [MemoryService],
})
export class MemoryModule {}
