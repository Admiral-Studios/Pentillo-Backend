import Redis from 'ioredis';

import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export type RedisClient = Redis;

const redisFactory = async (
  configService: ConfigService,
): Promise<RedisClient> => {
  const host = configService.get<string>('REDIS_HOST');
  const port = configService.get<number>('REDIS_PORT');

  return new Redis({ port, host });
};

export const redisProvider: Provider = {
  useFactory: redisFactory,
  inject: [ConfigService],
  provide: REDIS_CLIENT,
};
