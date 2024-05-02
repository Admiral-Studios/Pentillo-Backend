import { Module } from '@nestjs/common';

import { redisProvider } from './redis.provider';
import { RedisService } from './redis.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [BullModule.registerQueueAsync(redisProvider)],
  providers: [redisProvider, RedisService],
  exports: [redisProvider, RedisService],
})
export class RedisModule {}
