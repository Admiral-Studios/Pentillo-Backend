import { TeamService } from 'src/team/team.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly teamService: TeamService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );
    const status = this.reflector.get<string>('status', context.getHandler());
    const request = context.switchToHttp().getRequest();

    const userId = request.user.id;

    const role = await this.teamService.getMemberRole(userId);

    if (role[permission] !== status) {
      throw new ForbiddenException('You do not have permission to do this');
    }
    return true;
  }
}
