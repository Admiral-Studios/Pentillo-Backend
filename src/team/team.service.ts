import { SearchMembersDto } from './dto/request-dto/search-members.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createObjectCsvStringifier } from 'csv-writer';
import { ObjectCsvStringifier } from 'csv-writer/src/lib/csv-stringifiers/object';
import { TeamDto } from './dto/response-dto/team.dto';
import { EntityManager } from 'src/dal/entity-manager';
import { plainToInstance } from 'class-transformer';
import { CreateTeamDto } from './dto/request-dto/create-team.dto';
import { Role } from '@prisma/client';
import { RoleDto } from '../role/dto/response-dto/role.dto';
import { KickMemberDto } from './dto/request-dto/kick-member.dto';
import { AddMemberDto } from './dto/request-dto/add-member.dto';
import { EditRoleDto } from '../role/dto/request-dto/edit-role.dto';
import { AddMemberOnTransactionDto } from './dto/request-dto/add-member-on-transaction.dto';
import { MemberDto } from './dto/response-dto/member.dto';
import { RoleService } from 'src/role/role.service';
import { CreateRoleDto } from 'src/role/dto/request-dto/create-role.dto';
import { GetMembersDto } from './dto/request-dto/get-members.dto';
import { SetMemberRoleDto } from './dto/request-dto/set-member-role.dto';
import { UpdateMemberDto } from './dto/request-dto/update-member.dto';
import { AllMembersDto } from './dto/response-dto/all-members.dto';
import { CsvTeamInterface } from './interfaces/csv-team.interface';
import { FullMemberDto } from './dto/response-dto/full-member.dto';

@Injectable()
export class TeamService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly roleService: RoleService,
  ) {}

  public async findTeamByUserId(userId: string): Promise<TeamDto> {
    const team = await this.entityManager.teamRepository.findTeam({
      members: { some: { userId } },
    });

    if (!team) throw new NotFoundException('You are not in any team');

    return plainToInstance(TeamDto, team);
  }

  public async exportMembers(
    userId: string,
    filter: GetMembersDto,
  ): Promise<{ records: CsvTeamInterface[]; csvWriter: ObjectCsvStringifier }> {
    const { data } = await this.getMembers(userId, filter);

    const records = data.map((item) => {
      return {
        name: `${item.firstName} ${item.lastName}`,
        role: item.roleName,
        email: item?.email,
        recentAction: item.recentTransactionName,
      };
    });

    const csvWriter = createObjectCsvStringifier({
      header: [
        { id: 'name', title: 'Name' },
        { id: 'role', title: 'Role' },
        { id: 'email', title: 'Email' },
        { id: 'recentAction', title: 'recentAction' },
      ],
    });

    return { records, csvWriter };
  }

  public async getMember(userId: string): Promise<MemberDto> {
    const member = await this.entityManager.memberRepository.findMember({
      userId,
    });

    return plainToInstance(MemberDto, member);
  }

  public async getMemberById(id: string): Promise<MemberDto> {
    const member = await this.entityManager.memberRepository.findMember({
      id,
    });

    return plainToInstance(FullMemberDto, member);
  }

  public async getMembers(
    userId: string,
    filter?: GetMembersDto,
  ): Promise<AllMembersDto> {
    const team = await this.findTeamByUserId(userId);

    const data = await this.entityManager.memberRepository.findMembers(
      team.id,
      filter,
    );

    return plainToInstance(AllMembersDto, data);
  }

  public async createTeam(
    userId: string,
    data: CreateTeamDto,
  ): Promise<TeamDto> {
    const user = await this.entityManager.userRepository.findUser({
      id: userId,
    });
    const existTeam = await this.entityManager.teamRepository.findTeam({
      members: { some: { userId } },
    });

    if (existTeam) await this.deleteTeam(userId);

    let team = await this.entityManager.teamRepository.createTeam({
      ...data,
      ownerId: userId,
    });

    const role = await this.entityManager.roleRepository.createOwnerRole(
      team.id,
    );

    const member = await this.entityManager.memberRepository.createMember({
      userId,
      teamId: team.id,
      roleId: role.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleName: role.name,
    });

    team = await this.entityManager.teamRepository.addMember(team.id, member);

    return plainToInstance(TeamDto, team);
  }

  public async addMember(data: AddMemberDto): Promise<TeamDto> {
    const user = await this.entityManager.userRepository.findUser({
      id: data.userId,
    });

    const role = await this.entityManager.roleRepository.findRole(data.roleId);

    const member = await this.entityManager.memberRepository.createMember({
      userId: user.id,
      teamId: data.teamId,
      roleId: data.roleId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleName: role.name,
    });

    const team = await this.entityManager.teamRepository.addMember(
      data.teamId,
      member,
    );

    return plainToInstance(TeamDto, team);
  }

  public async getMemberRole(userId: string): Promise<Role> {
    const member = await this.entityManager.memberRepository.findMember({
      userId,
    });

    return this.entityManager.roleRepository.findRole(member.roleId);
  }

  public async createRole(
    userId: string,
    data: CreateRoleDto,
  ): Promise<RoleDto> {
    return this.roleService.createRole(userId, data);
  }

  public async getRoles(userId: string): Promise<RoleDto[]> {
    return this.roleService.getAllRoles(userId, true);
  }
  public async getAllRoles(userId: string): Promise<RoleDto[]> {
    return this.roleService.getAllRoles(userId);
  }

  public async updateRole(data: EditRoleDto): Promise<RoleDto> {
    return this.roleService.updateRole(data);
  }

  public async deleteRole(roleId: string): Promise<RoleDto> {
    return this.roleService.deleteRole(roleId);
  }

  public async deleteTeam(userId: string): Promise<TeamDto> {
    const team = await this.entityManager.teamRepository.findTeam({
      ownerId: userId,
    });

    const members = await this.entityManager.memberRepository.findMembers(
      team.id,
    );

    if (members.data.length > 1)
      throw new BadRequestException('Cannot delete team with members');

    const deletedTeam = await this.entityManager.teamRepository.deleteTeam(
      team.id,
    );

    return plainToInstance(TeamDto, deletedTeam);
  }

  public async leaveTeam(userId: string): Promise<TeamDto> {
    const member = await this.entityManager.memberRepository.findMember({
      userId,
    });

    const userRole = await this.getMemberRole(userId);

    if (userRole.name == 'Owner')
      throw new ForbiddenException('Owner cannot leave team');

    const deletedMember =
      await this.entityManager.memberRepository.deleteMember(member.id);

    const team = await this.createTeam(member.userId, {
      name: member.firstName + ' ' + member.lastName,
    });

    return plainToInstance(TeamDto, deletedMember);
  }

  public async kickMembers(data: KickMemberDto): Promise<void> {
    await Promise.all(
      data.memberIds.map(async (memberId) => {
        const member = await this.entityManager.memberRepository.findMember({
          id: memberId,
        });
        if (!member) throw new NotFoundException('Member not found');

        const userRole = await this.getMemberRole(member.userId);

        if (userRole.name == 'Owner') {
          throw new BadRequestException('Owner cannot be kicked');
        }

        await this.entityManager.memberRepository.deleteMember(member.id);

        const team = await this.createTeam(member.userId, {
          name: member.firstName + ' ' + member.lastName,
        });
      }),
    );
  }

  public async addMemberOnTransaction(
    data: AddMemberOnTransactionDto,
  ): Promise<MemberDto> {
    const member = await this.entityManager.memberRepository.findMember({
      id: data.memberId,
    });

    const updatedMember =
      await this.entityManager.memberRepository.addTransaction(
        member.id,
        data.transactionId,
      );

    return plainToInstance(MemberDto, updatedMember);
  }

  public async setMemberRole(data: SetMemberRoleDto): Promise<MemberDto> {
    const member = await this.entityManager.memberRepository.findMember({
      id: data.memberId,
    });

    const updatedMember =
      await this.entityManager.memberRepository.setMemberRole(
        member.id,
        data.roleId,
      );

    return plainToInstance(MemberDto, updatedMember);
  }

  public async removeMemberOnTransaction(
    data: AddMemberOnTransactionDto,
  ): Promise<MemberDto> {
    const member = await this.entityManager.memberRepository.findMember({
      id: data.memberId,
    });

    const updatedMember =
      await this.entityManager.memberRepository.removeTransaction(
        member.id,
        data.transactionId,
      );

    return plainToInstance(MemberDto, updatedMember);
  }

  public async updateMember(data: UpdateMemberDto): Promise<MemberDto> {
    const member = await this.entityManager.memberRepository.findMember({
      id: data.memberId,
    });
    if (!member) throw new NotFoundException('Member not found');

    const updatedMember =
      await this.entityManager.memberRepository.updateMember(data);

    return plainToInstance(MemberDto, updatedMember);
  }

  public async updateRecentAction(
    userId: string,
    listId: string,
  ): Promise<void> {
    const member = await this.entityManager.memberRepository.findMember({
      userId,
    });

    if (!member) throw new NotFoundException('Member not found');

    const list = await this.entityManager.listRepository.getListById(listId);

    if (!list.transactionId) return;

    const transaction =
      await this.entityManager.transactionRepository.getTransactionById(
        list.transactionId,
      );

    await this.entityManager.memberRepository.updateRecentAction({
      memberId: member.id,
      transactionName: transaction.street + ' ' + transaction.streetNumber,
      transactionId: list.transactionId,
    });
  }

  public async searchMembers(
    userId: string,
    data: SearchMembersDto,
  ): Promise<MemberDto[]> {
    const team = await this.findTeamByUserId(userId);

    const members = await this.entityManager.memberRepository.findMembers(
      team.id,
      { ...data, take: data.take || 5 },
    );

    return plainToInstance(MemberDto, members.data);
  }

  public async isOwner(userId: string): Promise<boolean> {
    const team = await this.entityManager.teamRepository.findTeam({
      ownerId: userId,
    });

    return !!team;
  }
}
