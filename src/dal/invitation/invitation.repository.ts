import { Injectable } from '@nestjs/common';
import { Invitation } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { TransactionManager } from 'src/infra/prisma/types/transaction-manager.type';
import { CreateFullInvitationDto } from 'src/invitation/dto/request-dto/create-full-invitation.dto';

@Injectable()
export class InvitationRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async createInvitation(
    data: CreateFullInvitationDto,
    tx?: TransactionManager,
  ): Promise<Invitation> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.invitation.create({ data });
  }

  public async findInvitation(
    data: Partial<Invitation>,
    tx?: TransactionManager,
  ): Promise<Invitation> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.invitation.findFirst({ where: data });
  }

  public async deleteInvitation(
    data: Partial<Invitation>,
    tx?: TransactionManager,
  ): Promise<void> {
    const transactionManager = tx ?? this.prisma;

    await transactionManager.invitation.deleteMany({ where: data });
  }

  public async updateInvitation(
    id: string,
    data: Partial<Invitation>,
    tx?: TransactionManager,
  ): Promise<Invitation | null> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.invitation.update({ where: { id }, data });
  }
}
