import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { DalModule } from 'src/dal/dal.module';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [DalModule, RoleModule],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
