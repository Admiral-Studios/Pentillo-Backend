import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CreateInvitationDto } from './dto/request-dto/create-invitation.dto';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/user/user.decorator';
import { UserDto } from 'src/user/dto/response-dto/user.dto';
import { IsOwnerGuard } from 'src/team/guards/is-owner.guard';

@UseGuards(JwtAuthGuard)
@ApiCookieAuth()
@ApiTags('invitation')
@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @UseGuards(IsOwnerGuard)
  @Post('send')
  public async sendInvitation(
    @User() user: UserDto,
    @Body() data: CreateInvitationDto,
  ) {
    return this.invitationService.sendInvitation(user.id, data);
  }

  @Post('accept/:token')
  public async acceptInvitation(
    @User() user: UserDto,
    @Param('token') token: string,
  ) {
    return this.invitationService.acceptInvitation(token, user.id);
  }
}
