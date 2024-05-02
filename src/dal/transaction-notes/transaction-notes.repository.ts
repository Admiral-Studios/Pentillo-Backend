import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { FilterTransactionNotes } from '../../transaction-notes/dto/request-dto/filter-transaction-notes.dto';
import { Prisma, TransactionNotes } from '@prisma/client';

@Injectable()
export class TransactionNotesRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public createTransactionNote(
    transactionId: string,
    text: string,
    tx?: Prisma.TransactionClient,
  ): Promise<TransactionNotes> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.transactionNotes.create({
      data: { transactionId, text },
    });
  }

  public getTransactionNoteById(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<TransactionNotes> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.transactionNotes.findUnique({ where: { id } });
  }

  public getTransactionNotes(
    transactionId: string,
    filter: FilterTransactionNotes,
    tx?: Prisma.TransactionClient,
  ): Promise<TransactionNotes[]> {
    const transactionManager = tx ?? this.prisma;

    const where: Prisma.TransactionNotesWhereInput = { transactionId };

    if (filter?.search) {
      where.text = { contains: filter.search, mode: 'insensitive' };
    }

    return transactionManager.transactionNotes.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: filter?.skip,
      take: filter?.take,
    });
  }

  public updateTransactionNote(
    id: string,
    text: string,
    tx?: Prisma.TransactionClient,
  ): Promise<TransactionNotes> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.transactionNotes.update({
      where: { id },
      data: { text },
    });
  }

  public async deleteTransactionNotes(
    ids: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const transactionManager = tx ?? this.prisma;

    await transactionManager.transactionNotes.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
