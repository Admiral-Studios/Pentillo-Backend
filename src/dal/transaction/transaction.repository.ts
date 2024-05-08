import { Injectable } from '@nestjs/common';
import { Payout, Prisma, Transaction } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';

import { CreateTransactionDto } from '../../transaction/dto/request-dto/create-transaction.dto';
import {
  TransactionFullInclude,
  transactionFullInclude,
} from './types/transaction-full-include.type';
import { GetListTransactionInterface } from './interfaces/get-list-transaction.interface';
import { GetListTransaction } from '../../transaction/dto/request-dto/get-list-transaction.dto';
import { UpdateTransactionDto } from '../../transaction/dto/request-dto/update-transaction.dto';
import { UpdatePayoutDto } from '../../transaction/dto/request-dto/update-payout.dto';
import {
  ParticipantFullInclude,
  participantFullInclude,
} from './types/participant-full-include.type';
import { transactionWithContactInclude } from './types/transaction-contact-include.type';
import { UpdateParticipantDto } from '../../transaction/dto/request-dto/update-participant.dto';
import { CreateParticipantDto } from '../../transaction/dto/request-dto/create-participant.dto';
import { SearchFilterDto } from '../../common/dto/search-filter.dto';
import { SortByFieldsEnum } from '../../transaction/interfaces/sort-by-fields.enum';
import {
  TransactionWithPrimaryAgentSelect,
  transactionWithPrimaryAgentSelect,
} from './types/transaction-primary-agent-select.type';

@Injectable()
export class TransactionRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async createTransaction(
    userId: string,
    teamId: string,
    dto: CreateTransactionDto,
    listIds?: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<Transaction> {
    const transactionManager = tx ?? this.prisma;
    const { templateId, streetNumber, ...rest } = dto.transaction;

    const participantData = this.composeCreateParticipantData(dto.participant);

    const data: Prisma.TransactionCreateInput = {
      ...rest,
      streetNumber: streetNumber.toString(),
      creator: { connect: { id: userId } },
      team: { connect: { id: teamId } },
      contract: { create: dto.contract },
      details: { create: dto.transactionDetails },
      payout: { create: {} },
      participant: {
        create: participantData,
      },
    };

    if (templateId) {
      data.template = {
        connect: { id: templateId },
      };
    }

    if (listIds && listIds.length) {
      data.lists = { connect: listIds?.map((id) => ({ id })) };
    }

    return transactionManager.transaction.create({ data });
  }

  public getTransactionAddressList(
    filter: SearchFilterDto,
    teamId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ streetNumber: string; street: string }[]> {
    const transactionManager = tx ?? this.prisma;

    const where: Prisma.TransactionWhereInput = {
      teamId,
    };

    if (filter.search) {
      where.OR = [
        { street: { contains: filter.search, mode: 'insensitive' } },
        { streetNumber: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return transactionManager.transaction.findMany({
      where,
      select: { streetNumber: true, street: true },
      orderBy: { createdAt: 'desc' },
      take: filter?.take,
      skip: filter?.skip,
    });
  }

  public getTransactionStateList(
    filter: SearchFilterDto,
    teamId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ state: string }[]> {
    const transactionManager = tx ?? this.prisma;

    const where: Prisma.TransactionWhereInput = {
      teamId,
    };

    if (filter.search) {
      where.state = { contains: filter.search, mode: 'insensitive' };
    }

    return transactionManager.transaction.findMany({
      where,
      select: { state: true },
      orderBy: { createdAt: 'desc' },
      take: filter?.take,
      skip: filter?.skip,
    });
  }

  public async deleteTransactions(
    ids: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const transactionManager = tx ?? this.prisma;

    await transactionManager.transaction.deleteMany({
      where: { id: { in: ids } },
    });
  }

  public async getTransactionById(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<TransactionFullInclude> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.transaction.findUnique({
      where: { id },
      include: transactionFullInclude,
    });
  }

  public globalSearchTransactions(
    teamId: string,
    filter: SearchFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<TransactionWithPrimaryAgentSelect[]> {
    const transactionManager = tx ?? this.prisma;

    const where: Prisma.TransactionWhereInput = {
      teamId,
    };

    if (filter.search) {
      where.AND = {
        OR: [
          {
            street: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
          {
            participant: {
              primaryAgent: {
                OR: [
                  {
                    lastName: { contains: filter.search, mode: 'insensitive' },
                  },
                  {
                    firstName: { contains: filter.search, mode: 'insensitive' },
                  },
                ],
              },
            },
          },
        ],
      };
    }

    return transactionManager.transaction.findMany({
      where,
      select: transactionWithPrimaryAgentSelect,
      orderBy: { createdAt: 'desc' },
      take: filter?.take,
      skip: filter?.skip,
    });
  }

  public async getTransactionList(
    teamId: string,
    filter: GetListTransaction,
    tx?: Prisma.TransactionClient,
  ): Promise<GetListTransactionInterface> {
    const transactionManager = tx ?? this.prisma;

    const where: Prisma.TransactionWhereInput = {
      teamId,
    };

    let orderBy: Prisma.TransactionOrderByWithRelationInput = {
      createdAt: 'desc',
    };

    if (filter.search) {
      where.AND = {
        OR: [
          {
            street: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
          {
            dir: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
          {
            city: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
          {
            state: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
        ],
      };
    }

    if (filter?.maxPrice && filter?.minPrice) {
      where.purchase = { gte: filter.minPrice, lte: filter.maxPrice };
    }

    if (filter?.status) {
      where.status = { in: filter.status };
    }

    if (filter?.side) {
      where.side = { in: filter.side };
    }

    if (filter?.propertyType) {
      where.propertyType = { in: filter.propertyType };
    }

    if (filter?.address) {
      where.street = { in: filter.address };
    }

    if (filter?.startDate && filter?.endDate) {
      where.closedDate = {
        gte: filter.startDate,
        lte: filter.endDate,
      };
    }

    if (filter?.agents && filter?.agents.length) {
      where.participant = {
        primaryAgent: {
          id: { in: filter.agents },
        },
      };
    }

    if (filter?.buyerAndSellerIds && filter?.buyerAndSellerIds.length) {
      where.participant = {
        buyersAndSellers: {
          some: {
            contactId: {
              in: filter.buyerAndSellerIds,
            },
          },
        },
      };
    }

    if (filter.orderByField && filter.orderBy) {
      orderBy = { [filter.orderByField]: filter.orderBy };

      if (filter.orderByField === SortByFieldsEnum.AGENT) {
        orderBy = {
          participant: {
            primaryAgent: {
              firstName: filter.orderBy,
            },
          },
        };
      }
    }

    const [data, count] = await Promise.all([
      transactionManager.transaction.findMany({
        where,
        include: transactionWithContactInclude,
        orderBy,
        take: filter?.take,
        skip: filter?.skip,
      }),
      transactionManager.transaction.count({
        where,
      }),
    ]);

    return { data, count };
  }

  public async updateTransaction(
    id: string,
    dto: UpdateTransactionDto,
    tx?: Prisma.TransactionClient,
  ): Promise<TransactionFullInclude> {
    const transactionManager = tx ?? this.prisma;

    const { streetNumber, ...rest } = dto.transaction;

    return transactionManager.transaction.update({
      where: { id },
      data: {
        streetNumber: streetNumber.toString(),
        ...rest,
        details: { update: dto?.transactionDetails },
        contract: { update: dto?.contract },
      },
      include: transactionFullInclude,
    });
  }

  public updateTransactionPayout(
    transactionId: string,
    dto: UpdatePayoutDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Payout> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.payout.update({
      where: { transactionId },
      data: dto,
    });
  }

  public updateTransactionParticipant(
    transactionId: string,
    participantId: string,
    dto: UpdateParticipantDto,
    tx?: Prisma.TransactionClient,
  ): Promise<ParticipantFullInclude> {
    const transactionManager = tx ?? this.prisma;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { buyerAndSellerIds, transactionContacts, ...rest } = dto;

    return transactionManager.participant.update({
      where: { transactionId },
      data: {
        ...rest,
        buyersAndSellers: {
          deleteMany: { participantId },
          createMany: {
            data: buyerAndSellerIds.map((contactId) => ({
              contactId,
            })),
          },
        },
      },
      include: participantFullInclude,
    });
  }

  public getTransactionPayout(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Payout> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.payout.findUnique({
      where: { transactionId: id },
    });
  }

  public getTransactionParticipant(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<ParticipantFullInclude> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.participant.findUnique({
      where: { transactionId: id },
      include: participantFullInclude,
    });
  }

  private composeCreateParticipantData(
    dto: CreateParticipantDto,
  ): Prisma.ParticipantCreateWithoutTransactionInput {
    const participantData: Prisma.ParticipantCreateWithoutTransactionInput = {
      primaryAgent: { connect: { id: dto.primaryAgentId } },
      buyersAndSellers: {
        createMany: {
          data: dto.buyerAndSellerIds.map((contactId) => ({
            contactId,
          })),
        },
      },
    };

    if (dto.goAgentId) {
      participantData.goAgent = { connect: { id: dto.goAgentId } };
    }

    if (dto.firstAssistantId) {
      participantData.firstAssistant = {
        connect: { id: dto.firstAssistantId },
      };
    }

    if (dto.secondAssistantId) {
      participantData.secondAssistant = {
        connect: { id: dto.secondAssistantId },
      };
    }

    return participantData;
  }
}
