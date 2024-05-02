import { Injectable } from '@nestjs/common';
import { Permission, Role, Team } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { TransactionManager } from 'src/infra/prisma/types/transaction-manager.type';

@Injectable()
export class RoleRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public findAllRoles(
    teamId: string,
    saved?: boolean,
    tx?: TransactionManager,
  ): Promise<Role[]> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.role.findMany({
      where: { teamId, savedAsTemplate: saved },
    });
  }

  public async createOwnerRole(
    teamId: string,
    tx?: TransactionManager,
  ): Promise<Role> {
    const transactionManager = tx ?? this.prisma;

    const owner = await transactionManager.role.create({
      data: {
        name: 'Owner',
        teamId,
        financialAndPayment: Permission.FULL_ACCESS,
        manageTemplates: Permission.FULL_ACCESS,
        manageTransaction: Permission.FULL_ACCESS,
        savedAsTemplate: false,
      },
    });

    return owner;
  }

  public async getInvitedRole(
    teamId: string,
    tx?: TransactionManager,
  ): Promise<Role> {
    const transactionManager = tx ?? this.prisma;
    const role = await transactionManager.role.findFirst({
      where: { teamId, name: 'Invited' },
    });

    if (!role) {
      return transactionManager.role.create({
        data: {
          name: 'Invited',
          teamId,
          financialAndPayment: Permission.EDIT,
          manageTemplates: Permission.EDIT,
          manageTransaction: Permission.EDIT,
          savedAsTemplate: false,
        },
      });
    }

    return role;
  }

  public createRole(
    data: Omit<Role, 'id'>,
    tx?: TransactionManager,
  ): Promise<Role> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.role.create({ data });
  }

  public findRole(roleId: string, tx?: TransactionManager): Promise<Role> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.role.findFirst({ where: { id: roleId } });
  }

  public updateRole(
    roleId: string,
    data: Partial<Role>,
    tx?: TransactionManager,
  ): Promise<Role> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.role.update({ where: { id: roleId }, data });
  }

  public async deleteRoles(
    data: Partial<Role>,
    tx?: TransactionManager,
  ): Promise<void> {
    const transactionManager = tx ?? this.prisma;

    await transactionManager.role.deleteMany({ where: data });
  }
}
