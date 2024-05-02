import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Invitation } from '@prisma/client';
import { EntityManager } from 'src/dal/entity-manager';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { CreateInvitationDto } from './dto/request-dto/create-invitation.dto';
import { TeamService } from 'src/team/team.service';
import { CreateFullInvitationDto } from './dto/request-dto/create-full-invitation.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class InvitationService {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly sendgridService: SendgridService,
    private readonly teamService: TeamService,
    private readonly userService: UserService,
  ) {}

  public async getInvitationById(id: string) {
    return this.entityManager.invitationRepository.findInvitation({ id });
  }

  public async createInvitation(
    data: CreateFullInvitationDto,
  ): Promise<Invitation> {
    return this.entityManager.invitationRepository.createInvitation(data);
  }

  public async updateInvitation(id: string, data: Partial<Invitation>) {
    return this.entityManager.invitationRepository.updateInvitation(id, data);
  }

  public async sendInvitation(userId: string, data: CreateInvitationDto) {
    try {
      const team = await this.teamService.findTeamByUserId(userId);

      const user = await this.userService.findUserByEmail(
        data.invitedUserEmail,
      );

      if (user) {
        const finderTeam = await this.teamService.findTeamByUserId(user.id);
        if (finderTeam && finderTeam.id === team.id) {
          throw new BadRequestException('User is already in the team');
        }
      }

      if (team.members.length >= 20) {
        throw new BadRequestException('Team is full');
      }

      const invitation = await this.createInvitation({
        inviterId: userId,
        teamId: team.id,
        ...data,
      });

      const payload = {
        invitationId: invitation.id,
      };
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: `${this.configService.get<string>('JWT_EXPIRATION_TIME')}s`,
      });
      console.log(token);
      const url = user
        ? `${this.configService.get<string>(
            'CLIENT_URL',
          )}/invite-success/${token}`
        : `${this.configService.get<string>('CLIENT_URL')}/sign-up/${token}`; // TODO: change link

      await this.updateInvitation(invitation.id, {
        invitationLink: url,
      });
      await this.sendgridService.sendInvitationEmail(
        invitation.invitedUserEmail,
        user ? `${user.firstName} ${user.lastName}` : 'Guest',
        url,
      );
      return invitation.invitedUserEmail;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async acceptInvitation(token: string, userId: string) {
    try {
      const { invitationId } = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const invitation = await this.getInvitationById(invitationId);

      const user = await this.userService.findUserByEmail(
        invitation.invitedUserEmail,
      );

      if (!user || user.id !== userId || invitation.isConfirmed) {
        throw new BadRequestException('Invalid token');
      }

      await this.updateInvitation(invitationId, {
        isConfirmed: true,
      });

      const role = await this.entityManager.roleRepository.getInvitedRole(
        invitation.teamId,
      );

      const member = await this.teamService.getMember(user.id);
      if (member) {
        try {
          await this.teamService.leaveTeam(user.id);
        } catch (error) {
          await this.teamService.deleteTeam(user.id);
        }
      }

      await this.teamService.addMember({
        teamId: invitation.teamId,
        roleId: role.id,
        userId: user.id,
      });

      return invitation;
    } catch (error) {
      console.log('here');
      throw new BadRequestException(error.message);
    }
  }
}
