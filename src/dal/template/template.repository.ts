import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { CreateTemplateDto } from '../../template/dto/request-dto/create-template.dto';
import { GetTemplateList } from '../../template/dto/request-dto/get-template-list.dto';
import { GetTemplateListInterface } from './interfaces/get-template-list.interface';
import { UpdateTemplateDto } from '../../template/dto/request-dto/update-template.dto';
import {
  TemplateFullInclude,
  templateFullInclude,
} from './types/template-full-include.type';
import { SearchFilterDto } from '../../common/dto/search-filter.dto';
import { TemplateSortByFieldsEnum } from '../../template/interfaces/template-sort-by-fields.enum';

@Injectable()
export class TemplateRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public getTemplateById(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<TemplateFullInclude> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.template.findUnique({
      where: { id },
      include: templateFullInclude,
    });
  }

  public createTemplate(
    userId: string,
    teamId: string,
    dto: CreateTemplateDto,
    tx?: Prisma.TransactionClient,
  ): Promise<TemplateFullInclude> {
    const transactionManager = tx ?? this.prisma;
    const { listIds, agentIds, ...rest } = dto;

    const data: Prisma.TemplateCreateInput = {
      ...rest,
      creator: { connect: { id: userId } },
      team: { connect: { id: teamId } },
    };

    if (dto.agentIds) {
      data.agents = {
        createMany: { data: agentIds?.map((contactId) => ({ contactId })) },
      };
    }

    if (dto.listIds) {
      data.lists = { connect: listIds?.map((id) => ({ id })) };
    }

    return transactionManager.template.create({
      data,
      include: templateFullInclude,
    });
  }

  public getTemplateNames(
    teamId: string,
    filter: SearchFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<{ id: string; name: string }[]> {
    const where: Prisma.TemplateWhereInput = {
      teamId,
    };
    const transactionManager = tx ?? this.prisma;

    if (filter.search) {
      where.name = { contains: filter.search, mode: 'insensitive' };
    }

    return transactionManager.template.findMany({
      where,
      take: filter?.take,
      skip: filter?.skip,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true },
    });
  }

  public async getTemplateList(
    teamId: string,
    filter: GetTemplateList,
    tx?: Prisma.TransactionClient,
  ): Promise<GetTemplateListInterface> {
    const transactionManager = tx ?? this.prisma;

    const where: Prisma.TemplateWhereInput = {
      teamId,
    };

    let orderBy: Prisma.TemplateOrderByWithRelationInput = {
      createdAt: 'desc',
    };

    if (filter?.name) {
      where.name = { in: filter.name };
    }

    if (filter?.sides) {
      where.sides = { hasSome: filter.sides };
    }

    if (filter?.propertyTypes) {
      where.propertyTypes = { hasSome: filter.propertyTypes };
    }

    if (filter.agentIds) {
      where.agents = { some: { contactId: { in: filter.agentIds } } };
    }

    if (filter?.states) {
      where.states = { hasSome: filter.states };
    }

    if (filter.orderByField && filter.orderBy) {
      orderBy = { [filter.orderByField]: filter.orderBy };

      if (filter.orderByField === TemplateSortByFieldsEnum.AGENTS) {
        orderBy = { [filter.orderByField]: { _count: filter.orderBy } };
      }
    }

    const [data, count] = await Promise.all([
      transactionManager.template.findMany({
        where,
        orderBy,
        include: templateFullInclude,
        take: filter?.take,
        skip: filter?.skip,
      }),
      transactionManager.template.count({
        where,
      }),
    ]);

    return { data, count };
  }

  public async updateTemplate(
    id: string,
    dto: UpdateTemplateDto,
    tx?: Prisma.TransactionClient,
  ): Promise<TemplateFullInclude> {
    const transactionManager = tx ?? this.prisma;
    const { listIds, agentIds, ...rest } = dto;

    const data: Prisma.TemplateUpdateInput = {
      ...rest,
    };

    if (dto.listIds) {
      data.lists = { connect: listIds?.map((id) => ({ id })) };
    }

    if (dto.agentIds && dto.agentIds.length > 0) {
      data.agents = {
        deleteMany: { templateId: id },
        createMany: { data: agentIds?.map((contactId) => ({ contactId })) },
      };
    }

    return transactionManager.template.update({
      where: { id },
      data,
      include: templateFullInclude,
    });
  }

  public async deleteTemplates(
    ids: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const transactionManager = tx ?? this.prisma;

    await transactionManager.template.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
