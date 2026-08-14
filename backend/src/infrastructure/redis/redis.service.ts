import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private isAvailable: boolean = false;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST', '127.0.0.1');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD', '');

    try {
      if (redisUrl) {
        this.client = new Redis(redisUrl, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
        });
      } else {
        this.client = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword || undefined,
          lazyConnect: true,
          maxRetriesPerRequest: 1,
        });
      }

      this.client.connect().then(() => {
        this.isAvailable = true;
        this.logger.log('⚡ Connected to Redis successfully');
      }).catch((err) => {
        this.isAvailable = false;
        this.logger.warn(`⚠️ Redis connection failed (${err.message}). Falling back to primary DB.`);
      });

      this.client.on('error', (err) => {
        if (this.isAvailable) {
          this.logger.warn(`Redis client error: ${err.message}`);
        }
        this.isAvailable = false;
      });

      this.client.on('connect', () => {
        this.isAvailable = true;
      });
    } catch (err: any) {
      this.isAvailable = false;
      this.logger.warn(`Could not initialize Redis client: ${err.message}`);
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  get isConnected(): boolean {
    return this.isAvailable && this.client !== null;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    try {
      const data = await this.client!.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err: any) {
      this.logger.warn(`Redis GET failed for key "${key}": ${err.message}`);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      const stringValue = JSON.stringify(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client!.set(key, stringValue, 'EX', ttlSeconds);
      } else {
        await this.client!.set(key, stringValue);
      }
    } catch (err: any) {
      this.logger.warn(`Redis SET failed for key "${key}": ${err.message}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client!.del(key);
    } catch (err: any) {
      this.logger.warn(`Redis DEL failed for key "${key}": ${err.message}`);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length > 0) {
        await this.client!.del(...keys);
      }
    } catch (err: any) {
      this.logger.warn(`Redis DEL pattern "${pattern}" failed: ${err.message}`);
    }
  }
}
