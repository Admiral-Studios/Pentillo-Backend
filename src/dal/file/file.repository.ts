import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/infra/prisma/prisma.service';
import { CreateFileInterface } from './interfaces/create-file.interface';
import { File, Prisma } from '@prisma/client';
import { UpdateFileDto } from '../../storage/dto/request-dto/update-file.dto';
import { GetFilesFilterDto } from '../../storage/dto/request-dto/search-file-list.dto';
import { FilesOrderByField } from '../../storage/enums/files-order-by-field.enum';
import {
  FileWithNotesInclude,
  fileWithNotesInclude,
} from './types/file-with-notes.type';

@Injectable()
export class FileRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public createFile(
    createFileInterface: CreateFileInterface,
    tx?: Prisma.TransactionClient,
  ): Promise<File> {
    const transactionManager = tx ?? this.prisma;

    const { note, userId, listId, ...rest } = createFileInterface;

    const data: Prisma.FileCreateInput = {
      ...rest,
      user: { connect: { id: userId } },
      list: { connect: { id: listId } },
    };

    if (note) {
      data.notes = {
        create: { text: note, userId: createFileInterface.userId },
      };
    }

    return transactionManager.file.create({
      data,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  public async deleteFiles(
    ids: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const transactionManager = tx ?? this.prisma;

    await transactionManager.file.deleteMany({ where: { id: { in: ids } } });
  }

  public getFilesByIds(
    ids?: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<File[]> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.file.findMany({ where: { id: { in: ids } } });
  }

  public updateFile(
    id: string,
    userId: string,
    dto: UpdateFileDto,
    tx?: Prisma.TransactionClient,
  ): Promise<File> {
    const transactionManager = tx ?? this.prisma;

    const { notes, ...rest } = dto;

    const data: Prisma.FileUpdateInput = {
      ...rest,
    };

    if (notes) {
      data.notes = {
        createMany: {
          data: notes?.map((note) => ({ text: note.text, userId })),
        },
      };
    }

    return transactionManager.file.update({ where: { id }, data });
  }

  public getFileById(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<FileWithNotesInclude> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.file.findUnique({
      where: { id },
      include: fileWithNotesInclude,
    });
  }

  public async getFileListByFilter(
    filter: GetFilesFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<File[]> {
    const transactionManager = tx ?? this.prisma;

    const where: Prisma.FileWhereInput = {};
    let orderBy: Prisma.FileOrderByWithRelationInput = { createdAt: 'desc' };

    if (filter.listId) {
      where.listId = filter.listId;
    }

    if (filter.filesOrderByField && filter.orderBy) {
      orderBy = { [filter.filesOrderByField]: filter.orderBy };

      if (filter.filesOrderByField === FilesOrderByField.OWNER) {
        orderBy = { user: { firstName: filter.orderBy } };
      }
    }

    return transactionManager.file.findMany({
      where,
      orderBy,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      skip: filter?.skip,
      take: filter?.take,
    });
  }
}
