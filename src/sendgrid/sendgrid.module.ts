import { Module } from '@nestjs/common';
import { SendgridService } from './sendgrid.service';
import { BullModule } from '@nestjs/bull';
import { SendgridProcessor } from './sendgrid.processor';
import { DalModule } from 'src/dal/dal.module';
import { RedisModule } from '../infra/redis/redis.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
    DalModule,
    RedisModule,
  ],
  providers: [SendgridService, SendgridProcessor],
  exports: [SendgridService],
})
export class SendgridModule {}
