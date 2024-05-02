import { Injectable } from '@nestjs/common';
import { Prisma, SubTasks } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';

import { CreateSubTaskDto } from '../../sub-tasks/dto/request-dto/create-sub-task.dto';
import { PaginationRequestDto } from '../../common/dto/pagination.dto';
import { UpdateSubTaskDto } from '../../sub-tasks/dto/request-dto/update-sub-task.dto';

@Injectable()
export class SubTaskRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public createSubTask(
    dto: CreateSubTaskDto,
    taskId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<SubTasks> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.subTasks.create({
      data: { ...dto, taskId },
    });
  }

  public async getSubTaskList(
    filter: PaginationRequestDto,
    taskId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<SubTasks[]> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.subTasks.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      take: filter?.take,
      skip: filter?.skip,
    });
  }

  public getSubTaskById(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<SubTasks> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.subTasks.findUnique({ where: { id } });
  }

  public updateSubTask(
    id: string,
    dto: UpdateSubTaskDto,
    tx?: Prisma.TransactionClient,
  ): Promise<SubTasks> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.subTasks.update({
      where: { id },
      data: dto,
    });
  }

  public async deleteSubTask(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const transactionManager = tx ?? this.prisma;

    await transactionManager.subTasks.delete({ where: { id } });
  }
}
