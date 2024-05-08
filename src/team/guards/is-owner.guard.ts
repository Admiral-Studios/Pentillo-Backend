import { TeamService } from 'src/team/team.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class IsOwnerGuard implements CanActivate {
  constructor(private readonly teamService: TeamService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userId = request.user.id;
    const team = await this.teamService.findTeamByUserId(userId);

    if (team.ownerId !== userId) {
      throw new ForbiddenException(
        `Only team owner have access to this action`,
      );
    }
    return true;
  }
}
