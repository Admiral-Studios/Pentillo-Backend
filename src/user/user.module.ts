import { Module } from '@nestjs/common';
import { DalModule } from '../dal/dal.module';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ContactModule } from 'src/contact/contact.module';
import { StorageModule } from '../storage/storage.module';
import { RedisModule } from '../infra/redis/redis.module';
import { TeamModule } from 'src/team/team.module';

@Module({
  imports: [
    DalModule,
    SendgridModule,
    ContactModule,
    StorageModule,
    RedisModule,
    TeamModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
