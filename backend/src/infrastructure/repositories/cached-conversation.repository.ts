import { Injectable } from '@nestjs/common';
import { ConversationEntity } from '@domain/entities/conversation.entity';
import { IConversationRepository } from '@domain/repositories/conversation.repository.interface';
import { MongooseConversationRepository } from './mongoose-conversation.repository';
import { RedisService } from '../redis/redis.service';

const CONVERSATION_LIST_TTL = 1800; // 30 minutes in seconds

@Injectable()
export class CachedConversationRepository implements IConversationRepository {
  constructor(
    private readonly mongooseRepo: MongooseConversationRepository,
    private readonly redisService: RedisService,
  ) {}

  async findByUserId(userId: string): Promise<ConversationEntity[]> {
    const cacheKey = `conversations:${userId}`;
    const cached = await this.redisService.get<ConversationEntity[]>(cacheKey);
    if (cached) {
      return cached.map((c) => new ConversationEntity(c));
    }

    const conversations = await this.mongooseRepo.findByUserId(userId);
    await this.redisService.set(cacheKey, conversations, CONVERSATION_LIST_TTL);
    return conversations;
  }

  async findByIdAndUser(id: string, userId: string): Promise<ConversationEntity | null> {
    const cacheKey = `conversation:${id}:${userId}`;
    const cached = await this.redisService.get<ConversationEntity>(cacheKey);
    if (cached) {
      return new ConversationEntity(cached);
    }

    const conversation = await this.mongooseRepo.findByIdAndUser(id, userId);
    if (conversation) {
      await this.redisService.set(cacheKey, conversation, CONVERSATION_LIST_TTL);
    }
    return conversation;
  }

  async create(userId: string, title: string): Promise<ConversationEntity> {
    const conversation = await this.mongooseRepo.create(userId, title);
    await this.redisService.del(`conversations:${userId}`);
    return conversation;
  }

  async rename(id: string, userId: string, title: string): Promise<ConversationEntity | null> {
    const conversation = await this.mongooseRepo.rename(id, userId, title);
    await this.redisService.del(`conversations:${userId}`);
    await this.redisService.del(`conversation:${id}:${userId}`);
    return conversation;
  }

  async touch(id: string): Promise<void> {
    await this.mongooseRepo.touch(id);
    // Fetch conversation to get userId and invalidate list cache
    const doc = await this.mongooseRepo.findByIdAndUser(id, ''); // touch handles DB update
    if (doc) {
      await this.redisService.del(`conversations:${doc.userId}`);
    }
  }
}
