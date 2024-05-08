import { Module } from '@nestjs/common';
import { EarlyAccessUserService } from './early-access-user.service';
import { EarlyAccessUserController } from './early-access-user.controller';
import { DalModule } from 'src/dal/dal.module';

@Module({
  imports: [DalModule],
  controllers: [EarlyAccessUserController],
  providers: [EarlyAccessUserService],
})
export class EarlyAccessUserModule {}
