import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InvitationService } from '../invitation.service';

@Injectable()
export class isInvitationExist implements CanActivate {
  constructor(
    private readonly invitationService: InvitationService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.params?.InvitationId;

    const { invitationId } = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_VERIFICATION_TOKEN_SECRET'),
    });

    const invitation =
      await this.invitationService.getInvitationById(invitationId);

    if (!invitation) throw new NotFoundException(`Invitation doesn't exist`);

    if (invitation.isConfirmed)
      throw new NotFoundException(`Invitation is already confirmed`);

    return true;
  }
}
