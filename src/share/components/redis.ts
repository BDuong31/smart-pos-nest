import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ICacheService } from '../interface';

@Injectable()
export class RedisClient implements ICacheService, OnModuleDestroy {
  private readonly logger = new Logger(RedisClient.name);
  private readonly client: RedisClientType;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined in environment variables');
    }

    this.client = createClient({ url: redisUrl });

    // Xử lý sự kiện khi kết nối Redis
    this.client.on('connect', () => {
      this.logger.log('Redis connecting...');
    });

    // Xử lý sự kiện kết nối thành công
    this.client.on('ready', () => {
      this.logger.log('Redis connected');
    });

    // Xử lý lỗi kết nối Redis
    this.client.on('error', (err) => {
      this.logger.error(`Redis error: ${err.message}`);
    });

    // Kết nối Redis
    this.client.connect().catch((err) => {
      this.logger.error(`Redis connect failed: ${err.message}`);
    });
  }

  // Lấy giá trị từ cache theo key
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  // Đặt giá trị cache với thời gian sống tùy chọn
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl && ttl > 0) {
      await this.client.set(key, value, { EX: ttl });
    } else {
      await this.client.set(key, value);
    }
  }

  // Cập nhật giá trị cache không làm thay đổi thời gian sống
  async update(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl && ttl > 0) {
      await this.client.set(key, value, { EX: ttl });
    } else {
      await this.client.set(key, value, { KEEPTTL: true });
    }
  }

  // Xoá cache theo key
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  // Xoá cache theo pattern
  async delByPattern(pattern: string): Promise<void> {
    let cursor = '0';

    do {
      const result = await this.client.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });

      cursor = result.cursor;
      const keys = result.keys;

      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } while (cursor !== '0');
  }

  // huỷ kết nối Redis khi module bị huỷ
  async onModuleDestroy() {
    try {
      await this.client.quit();
      this.logger.log('Redis disconnected');
    } catch (err: any) {
      this.logger.error(`Redis disconnect error: ${err.message}`);
    }
  }
}
