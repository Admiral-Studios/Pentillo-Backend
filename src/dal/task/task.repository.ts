import { Injectable } from '@nestjs/common';
import { Prisma, Task, TaskStatus } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';

import { CreateTaskDto } from '../../task/dto/request-dto/create-task.dto';
import { UpdateTaskDto } from '../../task/dto/request-dto/update-task.dto';
import { GetTaskList } from '../../task/dto/request-dto/get-task-list.dto';
import { GetListTasksInterface } from './interfaces/get-list-tasks.interface';
import {
  TaskWithAssignedPersonInclude,
  taskWithAssignedPersonInclude,
} from './types/task-with-user-include.type';
import { AddedTasksToListDto } from '../../task/dto/request-dto/added-tasks-to-list.dto';
import { SearchFilterDto } from '../../common/dto/search-filter.dto';
import { TasksOrderByField } from '../../task/enums/tasks-order-by-field.enum';

@Injectable()
export class TaskRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public createTask(
    dto: CreateTaskDto,
    ownerId: string,
    teamId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Task> {
    const transactionManager = tx ?? this.prisma;
    const { notes, subTasks, listId, assignedPersonId, ...rest } = dto;

    const data: Prisma.TaskCreateInput = {
      ...rest,
      owner: { connect: { id: ownerId } },
      team: { connect: { id: teamId } },
    };

    if (listId) {
      data.list = { connect: { id: listId } };
    }

    if (assignedPersonId) {
      data.assignedPerson = { connect: { id: assignedPersonId } };
    }

    if (notes) {
      data.notes = { create: { text: notes, userId: ownerId } };
    }

    if (subTasks) {
      data.subTasks = { createMany: { data: dto?.subTasks } };
    }

    return transactionManager.task.create({ data });
  }

  public getTaskTitleList(
    teamId: string,
    filter: SearchFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<{ id: string; title: string }[]> {
    const transactionManager = tx ?? this.prisma;
    const where: Prisma.TaskWhereInput = { teamId };

    if (filter.search) {
      where.title = { contains: filter.search, mode: 'insensitive' };
    }

    return transactionManager.task.findMany({
      where,
      select: { id: true, title: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  public connectTasksToList(
    dto: AddedTasksToListDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.task.updateMany({
      where: { id: { in: dto.taskIds } },
      data: {
        listId: dto.listId,
      },
    });
  }

  public async getTaskList(
    teamId: string,
    filter: GetTaskList,
    tx?: Prisma.TransactionClient,
  ): Promise<GetListTasksInterface> {
    const transactionManager = tx ?? this.prisma;

    const where: Prisma.TaskWhereInput = { teamId };

    let orderBy: Prisma.TaskOrderByWithRelationInput = { createdAt: 'desc' };

    if (filter?.search) {
      where.title = { contains: filter.search, mode: 'insensitive' };
    }

    if (filter?.startDueDate && filter?.endDueDate) {
      where.dueDate = {
        gte: filter.startDueDate,
        lte: filter.endDueDate,
      };
    }

    if (filter.listId) {
      where.listId = filter.listId;
    }

    if (filter.tasksOrderByField && filter.orderBy) {
      orderBy = { [filter.tasksOrderByField]: filter.orderBy };

      if (filter.tasksOrderByField === TasksOrderByField.OWNER) {
        orderBy = { assignedPerson: { firstName: filter.orderBy } };
      }
    }

    if (filter?.status) {
      where.status = { in: filter.status };
    }

    if (filter?.title) {
      where.title = { in: filter.title };
    }

    if (filter?.assignedPersonIds) {
      where.assignedPersonId = { in: filter.assignedPersonIds };
    }

    if (filter?.ownerIds) {
      where.ownerId = { in: filter.ownerIds };
    }

    const [data, count] = await Promise.all([
      transactionManager.task.findMany({
        where,
        include: taskWithAssignedPersonInclude,
        orderBy,
        take: filter?.take,
        skip: filter?.skip,
      }),
      transactionManager.task.count({ where }),
    ]);

    return { data, count };
  }

  public getTaskById(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<TaskWithAssignedPersonInclude> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.task.findUnique({
      where: { id },
      include: taskWithAssignedPersonInclude,
    });
  }

  public updateTask(
    id: string,
    dto: UpdateTaskDto,
    tx?: Prisma.TransactionClient,
  ): Promise<TaskWithAssignedPersonInclude> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.task.update({
      where: { id },
      data: dto,
      include: taskWithAssignedPersonInclude,
    });
  }

  public async updateTasksStatus(
    ids: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const transactionManager = tx ?? this.prisma;

    await transactionManager.task.updateMany({
      where: { id: { in: ids } },
      data: { status: TaskStatus.DONE },
    });
  }

  public async deleteTasks(
    ids: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const transactionManager = tx ?? this.prisma;

    await transactionManager.task.deleteMany({ where: { id: { in: ids } } });
  }
}
