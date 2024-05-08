import { Injectable } from '@nestjs/common';
import { Member, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { TransactionManager } from 'src/infra/prisma/types/transaction-manager.type';
import { CreateMemberDto } from 'src/team/dto/request-dto/create-member.dto';
import { GetMembersDto } from 'src/team/dto/request-dto/get-members.dto';
import { UpdateMemberDto } from 'src/team/dto/request-dto/update-member.dto';
import { UpdateRecentActionDto } from 'src/team/dto/request-dto/update-recent-action.dto';
import { GetMembersInterface } from './interfaces/get-members.interface';
import { MemberTransactionInclude } from './entity-types/member-transactions-include.type';
import { SearchMembersDto } from 'src/team/dto/request-dto/search-members.dto';

@Injectable()
export class MemberRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public createMember(
    data: CreateMemberDto,
    tx?: TransactionManager,
  ): Promise<Member> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.member.create({ data });
  }

  public async findMember(
    data: Partial<Member>,
    tx?: TransactionManager,
  ): Promise<MemberTransactionInclude> {
    const transactionManager = tx ?? this.prisma;
    return transactionManager.member.findFirst({
      where: data,
      include: {
        user: true,
        role: true,
        transactions: true,
      },
    });
  }

  public async findMembers(
    teamId: string,
    filter?: GetMembersDto | SearchMembersDto,
    tx?: TransactionManager,
  ): Promise<GetMembersInterface> {
    const transactionManager = tx ?? this.prisma;

    let where: Prisma.MemberWhereInput = { teamId };
    let orderBy: Prisma.MemberOrderByWithRelationInput = { firstName: 'desc' };

    const include: Prisma.MemberInclude = { role: true, user: true };
    if (filter?.name) {
      if (typeof filter.name === 'string') {
        where = {
          ...where,
          OR: [
            { firstName: { contains: filter.name, mode: 'insensitive' } },
            { middleName: { contains: filter.name, mode: 'insensitive' } },
            { lastName: { contains: filter.name, mode: 'insensitive' } },
          ],
        };
      } else {
        if (filter.name.length === 1) {
          const [firstName, lastName] = filter.name[0].split(' ');
          if (!lastName) {
            where = {
              ...where,
              OR: [
                { firstName: { contains: firstName, mode: 'insensitive' } },
                { middleName: { contains: firstName, mode: 'insensitive' } },
                { lastName: { contains: firstName, mode: 'insensitive' } },
              ],
            };
          } else {
            where.firstName = {
              contains: firstName,
              mode: 'insensitive',
            };
            where.lastName = {
              contains: lastName,
              mode: 'insensitive',
            };
          }
        }
        if (filter.name.length > 1) {
          where = {
            ...where,
            OR: filter.name.map((nameItem: string) => ({
              firstName: {
                contains: nameItem.split(' ')[0],
                mode: 'insensitive',
              },
              lastName: {
                contains: nameItem.split(' ')[1],
                mode: 'insensitive',
              },
            })),
          };
        }
      }
    }

    if (filter?.email) {
      if (typeof filter.email === 'string') {
        where.user = {
          email: { contains: filter.email, mode: 'insensitive' },
        };
      } else {
        where.user = {
          email: { in: filter.email },
        };
      }
    }

    if (filter?.role) {
      if (typeof filter.role === 'string') {
        where.roleName = { contains: filter.role, mode: 'insensitive' };
      } else {
        where.roleName = { in: filter.role };
      }
    }

    if (filter?.membersOrderByField && filter?.orderBy) {
      orderBy = { [filter.membersOrderByField]: filter.orderBy };
    }

    const [data, count] = await Promise.all([
      transactionManager.member.findMany({
        where,
        include,
        orderBy,
        skip: filter?.skip,
        take: filter?.take,
      }),
      transactionManager.member.count({
        where,
      }),
    ]);

    return { data, count };
  }

  public deleteMember(
    memberId: string,
    tx?: TransactionManager,
  ): Promise<Member> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.member.delete({ where: { id: memberId } });
  }

  public addTransaction(
    memberId: string,
    transactionId: string,
  ): Promise<Member> {
    return this.prisma.member.update({
      where: { id: memberId },
      data: {
        transactions: {
          create: [
            {
              transactionId,
            },
          ],
        },
      },
    });
  }

  public removeTransaction(
    memberId: string,
    transactionId: string,
  ): Promise<Member> {
    return this.prisma.member.update({
      where: { id: memberId },
      data: {
        transactions: {
          delete: {
            memberId_transactionId: {
              memberId,
              transactionId,
            },
          },
        },
      },
    });
  }

  public async setMemberRole(
    memberId: string,
    roleId: string,
    tx?: TransactionManager,
  ): Promise<Member> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.member.update({
      where: { id: memberId },
      data: { roleId },
    });
  }

  public async updateMember(
    data: UpdateMemberDto,
    tx?: TransactionManager,
  ): Promise<Member> {
    const { memberId, ...newData } = data; // Remove memberId from data
    const transactionManager = tx ?? this.prisma;

    return transactionManager.member.update({
      where: { id: memberId },
      data: newData,
    });
  }

  public async updateRecentAction(
    data: UpdateRecentActionDto,
    tx?: TransactionManager,
  ): Promise<Member> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.member.update({
      where: { id: data.memberId },
      data: {
        recentTransactionName: data.transactionName,
        recentTransactionId: data.transactionId,
      },
    });
  }
}
