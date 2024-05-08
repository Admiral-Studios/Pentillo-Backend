import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { GoogleProvider } from './google.provider';
import { TeamModule } from 'src/team/team.module';
import { InvitationModule } from 'src/invitation/invitation.module';
import { RedisModule } from '../infra/redis/redis.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({}),
    SendgridModule,
    TeamModule,
    InvitationModule,
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    GoogleProvider,
  ],
  exports: [AuthService],
})
export class AuthModule {}
