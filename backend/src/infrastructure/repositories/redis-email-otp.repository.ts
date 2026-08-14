import { Injectable } from '@nestjs/common';
import { EmailOtpEntity } from '@domain/entities/email-otp.entity';
import { IEmailOtpRepository } from '@domain/repositories/email-otp.repository.interface';
import { MongooseEmailOtpRepository } from './mongoose-email-otp.repository';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RedisEmailOtpRepository implements IEmailOtpRepository {
  constructor(
    private readonly mongooseRepo: MongooseEmailOtpRepository,
    private readonly redisService: RedisService,
  ) {}

  private getOtpKey(email: string): string {
    return `otp:${email.trim().toLowerCase()}`;
  }

  async findByEmail(email: string): Promise<EmailOtpEntity | null> {
    const key = this.getOtpKey(email);
    const cached = await this.redisService.get<EmailOtpEntity>(key);
    if (cached) {
      return new EmailOtpEntity({
        ...cached,
        expiresAt: new Date(cached.expiresAt),
      });
    }

    // Fallback to Mongoose if Redis is offline or miss
    return this.mongooseRepo.findByEmail(email);
  }

  async upsertOtp(email: string, codeHash: string, expiresAt: Date): Promise<EmailOtpEntity> {
    const normalized = email.trim().toLowerCase();
    const key = this.getOtpKey(normalized);
    const ttlSeconds = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

    const otpEntity = new EmailOtpEntity({
      id: `redis_${normalized}`,
      email: normalized,
      codeHash,
      attempts: 0,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (this.redisService.isConnected) {
      await this.redisService.set(key, otpEntity, ttlSeconds);
    } else {
      // Fallback to MongoDB if Redis is offline
      await this.mongooseRepo.upsertOtp(email, codeHash, expiresAt);
    }

    return otpEntity;
  }

  async incrementAttempts(id: string): Promise<void> {
    if (id.startsWith('redis_')) {
      const email = id.replace('redis_', '');
      const key = this.getOtpKey(email);
      const existing = await this.redisService.get<EmailOtpEntity>(key);
      if (existing) {
        existing.attempts += 1;
        const ttlSeconds = Math.max(1, Math.floor((new Date(existing.expiresAt).getTime() - Date.now()) / 1000));
        await this.redisService.set(key, existing, ttlSeconds);
      }
      return;
    }

    await this.mongooseRepo.incrementAttempts(id);
  }

  async deleteByEmail(email: string): Promise<void> {
    const key = this.getOtpKey(email);
    if (this.redisService.isConnected) {
      await this.redisService.del(key);
    }
    await this.mongooseRepo.deleteByEmail(email);
  }
}
