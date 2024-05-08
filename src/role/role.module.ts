import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { DalModule } from 'src/dal/dal.module';

@Module({
  imports: [DalModule],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
