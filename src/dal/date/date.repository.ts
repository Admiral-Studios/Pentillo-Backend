import { Injectable } from '@nestjs/common';
import { Date, Prisma, TypeList } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';

import { CreateDateDto } from '../../date/dto/request-dto/create-date.dto';
import { UpdateDateDto } from '../../date/dto/request-dto/update-date.dto';
import { GetDatesFilterDto } from '../../date/dto/request-dto/get-dates-filter.dto';

@Injectable()
export class DateRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public createDate(
    dto: CreateDateDto,
    teamId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Date> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.date.create({
      data: {
        teamId,
        ...dto,
      },
    });
  }

  public getDatesList(
    dto: GetDatesFilterDto,
    teamId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Date[]> {
    const transactionManager = tx ?? this.prisma;

    const where: Prisma.DateWhereInput = {};
    let orderBy: Prisma.DateOrderByWithRelationInput = { createdAt: 'desc' };

    if (dto.listId) {
      where.listId = dto.listId;
    }

    if (dto?.transactionId) {
      where.list = { transactionId: dto.transactionId, type: TypeList.DATES };
    }

    if (dto.isPinned) {
      where.isPinned = dto.isPinned;
    }

    if (dto.datesOrderByField && dto.orderBy) {
      orderBy = { [dto.datesOrderByField]: dto.orderBy };
    }

    return transactionManager.date.findMany({
      where,
      orderBy,
      skip: dto?.skip,
      take: dto?.take,
    });
  }

  public async deleteDates(
    ids: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const transactionManager = tx ?? this.prisma;

    await transactionManager.date.deleteMany({
      where: { id: { in: ids } },
    });
  }

  public updateDate(
    id: string,
    dto: UpdateDateDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Date> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.date.update({
      where: { id },
      data: dto,
    });
  }

  public getDateById(id: string, tx?: Prisma.TransactionClient): Promise<Date> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.date.findUnique({ where: { id } });
  }
}
