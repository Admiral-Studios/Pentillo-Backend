import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { DalModule } from 'src/dal/dal.module';
import { JwtService } from '@nestjs/jwt';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { TeamModule } from 'src/team/team.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [DalModule, SendgridModule, TeamModule, UserModule],
  controllers: [InvitationController],
  providers: [InvitationService, JwtService],
  exports: [InvitationService],
})
export class InvitationModule {}
