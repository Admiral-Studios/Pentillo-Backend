import { Injectable } from '@nestjs/common';
import { List, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { CreateListDto } from '../../list/dto/request-dto/create-list.dto';
import { UpdateListDto } from '../../list/dto/request-dto/update-list.dto';
import { GetListsQueryDto } from '../../list/dto/request-dto/get-lists-query.dto';
import {
  ListWithFileIdsInclude,
  listWithFileIdsInclude,
} from './types/list-with-files-include.type';
import {
  ListFullWithSubTasksInclude,
  listFullWithSubTasksInclude,
} from './types/list-full-include-with-subTasks.type';
import { GetListsInterface } from './interfaces/get-lists.interface';
import { SelectListFieldsTransform } from './transformations/exclude-list-fields.transform';

@Injectable()
export class ListRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public createList(
    userId: string,
    teamId: string,
    dto: CreateListDto,
    tx?: Prisma.TransactionClient,
  ): Promise<List> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.list.create({
      data: { userId, teamId, ...dto },
    });
  }

  public deleteList(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<ListWithFileIdsInclude> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.list.delete({
      where: { id },
      include: listWithFileIdsInclude,
    });
  }

  public updateList(
    id: string,
    dto: UpdateListDto,
    tx?: Prisma.TransactionClient,
  ): Promise<List> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.list.update({
      where: { id },
      data: dto,
    });
  }

  public async getLists(
    userId: string,
    teamId: string,
    dto: GetListsQueryDto,
    tx?: Prisma.TransactionClient,
  ): Promise<GetListsInterface> {
    const transactionManager = tx ?? this.prisma;

    const where: Prisma.ListWhereInput = { teamId, type: dto.type };

    if (dto?.transactionId) {
      where.transactionId = dto.transactionId;
    }

    if (dto?.templateId) {
      where.templateId = dto.templateId;
    }

    if (dto?.name) {
      where.name = { contains: dto.name, mode: 'insensitive' };
    }

    const [data, count] = await Promise.all([
      transactionManager.list.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: dto?.skip,
        take: dto?.take,
      }),
      transactionManager.list.count({ where }),
    ]);

    return { data, count };
  }

  public getListById(id: string, tx?: Prisma.TransactionClient): Promise<List> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.list.findUnique({ where: { id } });
  }

  public getListByTemplateId(
    templateId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<ListFullWithSubTasksInclude[]> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.list.findMany({
      where: { templateId },
      include: listFullWithSubTasksInclude,
    });
  }

  public async createManyLists(
    userId: string,
    lists: SelectListFieldsTransform[],
    tx?: Prisma.TransactionClient,
  ): Promise<string[]> {
    const transactionManager = tx ?? this.prisma;

    const listIds = await Promise.all(
      lists.map(async (list) => {
        return transactionManager.list.create({
          data: {
            ...list,
            files: {
              create: list?.files.map((file) => ({
                ...file,
                userId,
                isCopyFile: true,
                notes: {
                  create: file.notes.map((note) => ({
                    ...note,
                    user: { connect: { id: userId } },
                  })),
                },
              })),
            },
            tasks: {
              create: list?.tasks.map((task) => ({
                ...task,
                ownerId: userId,
                subTasks: {
                  create: task?.subTasks.map((subTask) => ({
                    ...subTask,
                  })),
                },
                notes: {
                  create: task.notes.map((note) => ({
                    user: { connect: { id: userId } },
                    ...note,
                  })),
                },
              })),
            },
            dates: {
              create: list?.dates.map((date) => ({
                ...date,
              })),
            },
          },
          select: { id: true },
        });
      }),
    );

    return listIds.map((list) => list.id);
  }
}
