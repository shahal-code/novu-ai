import { Injectable } from '@nestjs/common';
import { MemoryEntity, MemoryFact } from '@domain/entities/memory.entity';
import { IMemoryRepository } from '@domain/repositories/memory.repository.interface';
import { MongooseMemoryRepository } from './mongoose-memory.repository';
import { RedisService } from '../redis/redis.service';

const MEMORY_TTL = 3600; // 1 hour in seconds

@Injectable()
export class CachedMemoryRepository implements IMemoryRepository {
  constructor(
    private readonly mongooseRepo: MongooseMemoryRepository,
    private readonly redisService: RedisService,
  ) {}

  async findByUserId(userId: string): Promise<MemoryEntity | null> {
    const cacheKey = `memory:${userId}`;
    const cached = await this.redisService.get<MemoryEntity>(cacheKey);
    if (cached) {
      return new MemoryEntity(cached);
    }

    const memory = await this.mongooseRepo.findByUserId(userId);
    if (memory) {
      await this.redisService.set(cacheKey, memory, MEMORY_TTL);
    }
    return memory;
  }

  async addFacts(userId: string, newFacts: MemoryFact[]): Promise<void> {
    await this.mongooseRepo.addFacts(userId, newFacts);
    await this.redisService.del(`memory:${userId}`);
  }

  async deleteFact(userId: string, factId: string): Promise<void> {
    await this.mongooseRepo.deleteFact(userId, factId);
    await this.redisService.del(`memory:${userId}`);
  }

  async clearAll(userId: string): Promise<void> {
    await this.mongooseRepo.clearAll(userId);
    await this.redisService.del(`memory:${userId}`);
  }
}
