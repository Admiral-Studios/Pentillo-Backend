import { Injectable } from '@nestjs/common';
import { Member, Team, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { TransactionManager } from 'src/infra/prisma/types/transaction-manager.type';
import { TeamFull } from './entity-types/team-full.type';

@Injectable()
export class TeamRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public findTeam(
    data: Prisma.TeamWhereInput,
    tx?: TransactionManager,
  ): Promise<TeamFull> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.team.findFirst({
      where: data,
      include: {
        members: { include: { role: true, user: true, transactions: true } },
      },
    });
  }

  public createTeam(
    data: Omit<Team, 'id'>,
    tx?: TransactionManager,
  ): Promise<Team> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.team.create({ data });
  }

  public addMember(
    id: string,
    mamber: Member,
    tx?: TransactionManager,
  ): Promise<Team> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.team.update({
      where: { id },
      data: { members: { connect: { id: mamber.id } } },
    });
  }

  public deleteTeam(id: string, tx?: TransactionManager): Promise<Team> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.team.delete({ where: { id } });
  }
}
