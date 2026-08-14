import { Injectable } from '@nestjs/common';
import { UserEntity } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { MongooseUserRepository } from './mongoose-user.repository';
import { RedisService } from '../redis/redis.service';

const USER_TTL = 900; // 15 minutes in seconds

@Injectable()
export class CachedUserRepository implements IUserRepository {
  constructor(
    private readonly mongooseRepo: MongooseUserRepository,
    private readonly redisService: RedisService,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const cacheKey = `user:${id}`;
    const cached = await this.redisService.get<UserEntity>(cacheKey);
    if (cached) {
      return new UserEntity(cached);
    }

    const user = await this.mongooseRepo.findById(id);
    if (user) {
      await this.redisService.set(cacheKey, user, USER_TTL);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalized = email.trim().toLowerCase();
    const cacheKey = `user:email:${normalized}`;
    const cached = await this.redisService.get<UserEntity>(cacheKey);
    if (cached) {
      return new UserEntity(cached);
    }

    const user = await this.mongooseRepo.findByEmail(normalized);
    if (user) {
      await this.redisService.set(cacheKey, user, USER_TTL);
    }
    return user;
  }

  async findByGoogleIdOrEmail(googleId: string, email: string): Promise<UserEntity | null> {
    // Direct DB lookup for Google OAuth check to guarantee current state
    const user = await this.mongooseRepo.findByGoogleIdOrEmail(googleId, email);
    if (user) {
      await this.redisService.set(`user:${user.id}`, user, USER_TTL);
      if (user.email) {
        await this.redisService.set(`user:email:${user.email}`, user, USER_TTL);
      }
    }
    return user;
  }

  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.mongooseRepo.create(userData);
    if (user.id) {
      await this.redisService.set(`user:${user.id}`, user, USER_TTL);
    }
    if (user.email) {
      await this.redisService.set(`user:email:${user.email}`, user, USER_TTL);
    }
    return user;
  }

  async update(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
    const updated = await this.mongooseRepo.update(id, updates);
    if (updated) {
      await this.redisService.set(`user:${id}`, updated, USER_TTL);
      if (updated.email) {
        await this.redisService.set(`user:email:${updated.email}`, updated, USER_TTL);
      }
    }
    return updated;
  }
}
