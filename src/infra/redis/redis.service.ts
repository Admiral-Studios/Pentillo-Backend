import { Redis } from 'ioredis';

import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.provider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    private readonly configService: ConfigService,
  ) {}

  public async setex(
    userId: string,
    payload: { code: string; newEmail?: string },
  ): Promise<void> {
    await this.redisClient.setex(
      `${userId}`,
      this.configService.get('CODE_TIME_EXPIRE'),
      JSON.stringify(payload),
    );
  }

  public async get(
    userId: string,
  ): Promise<{ code: string; newEmail?: string }> {
    const payload = await this.redisClient.get(`${userId}`);

    return JSON.parse(payload);
  }
}
