import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from 'src/dal/entity-manager';
import { CreateRoleDto } from './dto/request-dto/create-role.dto';
import { RoleDto } from './dto/response-dto/role.dto';
import { plainToInstance } from 'class-transformer';
import { EditRoleDto } from './dto/request-dto/edit-role.dto';

@Injectable()
export class RoleService {
  constructor(private readonly entityManager: EntityManager) {}

  public async createRole(
    userId: string,
    data: CreateRoleDto,
  ): Promise<RoleDto> {
    const team = await this.entityManager.teamRepository.findTeam({
      ownerId: userId,
    });

    const fullData = {
      ...data,
      teamId: team.id,
    };

    const role = this.entityManager.roleRepository.createRole(fullData);

    return plainToInstance(RoleDto, role);
  }

  public async getAllRoles(
    userId: string,
    saved?: boolean,
  ): Promise<RoleDto[]> {
    const team = await this.entityManager.teamRepository.findTeam({
      members: {
        some: {
          user: {
            id: userId,
          },
        },
      },
    });
    const roles = await this.entityManager.roleRepository.findAllRoles(
      team.id,
      saved,
    );

    return plainToInstance(RoleDto, roles);
  }

  public async updateRole(data: EditRoleDto): Promise<RoleDto> {
    const { roleId, ...updatedData } = data;

    const updatedRole = await this.entityManager.roleRepository.updateRole(
      roleId,
      updatedData,
    );

    return plainToInstance(RoleDto, updatedRole);
  }

  public async deleteRole(roleId: string): Promise<RoleDto> {
    const role = await this.entityManager.roleRepository.findRole(roleId);
    const membersWithRole =
      await this.entityManager.memberRepository.findMember({
        teamId: role.teamId,
        roleId,
      });
    if (membersWithRole)
      throw new BadRequestException('Cannot delete role with members');

    const deletedRole = await this.entityManager.roleRepository.deleteRoles({
      id: roleId,
    });

    return plainToInstance(RoleDto, deletedRole);
  }
}
