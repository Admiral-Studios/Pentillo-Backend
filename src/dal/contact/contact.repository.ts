import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateContactDto } from '../../contact/dto/request-dto/create-contact.dto';
import { UpdateContactDto } from '../../contact/dto/request-dto/update-contact.dto';
import { GetListContactDto } from 'src/contact/dto/request-dto/get-list-contact.dto';
import { GetListContactInterface } from '../contact/interfaces/get-list-contact.interface';
import {
  ContactFullInclude,
  contactFullInclude,
} from './entity-type/contact-full-include.type';
import { SelectContactInfo } from './interfaces/select-contact-info.interface';
import { CreateTransactionContactDto } from '../../contact/dto/request-dto/create-transaction-contact.dto';
import { SearchFilterDto } from '../../common/dto/search-filter.dto';

@Injectable()
export class ContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  public findContactById(
    contactId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<ContactFullInclude> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.contact.findUnique({
      where: {
        id: contactId,
      },
      include: contactFullInclude,
    });
  }

  public createContact(
    userId: string,
    teamId: string,
    dto: CreateContactDto,
    tx?: Prisma.TransactionClient,
  ): Promise<ContactFullInclude> {
    const transactionManager = tx ?? this.prisma;
    const { workAddress, homeAddress, ...rest } = dto;

    return transactionManager.contact.create({
      data: {
        team: { connect: { id: teamId } },
        user: { connect: { id: userId } },
        ...rest,
        homeAddress: { create: homeAddress },
        workAddress: {
          create: workAddress,
        },
      },
      include: contactFullInclude,
    });
  }

  public getBuyersAndSellers(
    teamId: string,
    filter: SearchFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<SelectContactInfo[]> {
    const transactionManager = tx ?? this.prisma;
    const where: Prisma.ContactWhereInput = { teamId };

    if (filter.search) {
      where.OR = [
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { firstName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return transactionManager.contact.findMany({
      where,
      select: {
        lastName: true,
        firstName: true,
        id: true,
      },
      orderBy: { createdAt: 'desc' },
      take: filter?.take,
      skip: filter?.skip,
    });
  }

  public getAssignedPersonList(
    teamId: string,
    filter: SearchFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<SelectContactInfo[]> {
    const transactionManager = tx ?? this.prisma;
    const where: Prisma.ContactWhereInput = {
      teamId,
      assignedTasks: { some: {} },
    };

    if (filter.search) {
      where.OR = [
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { firstName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return transactionManager.contact.findMany({
      where,
      select: {
        lastName: true,
        firstName: true,
        id: true,
      },
      orderBy: { createdAt: 'desc' },
      take: filter?.take,
      skip: filter?.skip,
    });
  }

  public getAgentsList(
    teamId: string,
    filter: SearchFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<SelectContactInfo[]> {
    const transactionManager = tx ?? this.prisma;
    const where: Prisma.ContactWhereInput = {
      teamId,
      primaryAgents: { some: {} },
    };

    if (filter.search) {
      where.OR = [
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { firstName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return transactionManager.contact.findMany({
      where,
      select: { id: true, firstName: true, lastName: true },
      orderBy: { createdAt: 'desc' },
      take: filter?.take,
      skip: filter?.skip,
    });
  }

  public createTransactionContact(
    userId: string,
    teamId: string,
    dto: CreateTransactionContactDto,
    tx?: Prisma.TransactionClient,
  ): Promise<{ id: string }> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.contact.create({
      data: {
        ...dto,
        team: { connect: { id: teamId } },
        user: { connect: { id: userId } },
        isTransactionOnly: true,
      },
      select: { id: true },
    });
  }

  public updateContact(
    contactId: string,
    dto: UpdateContactDto,
    tx?: Prisma.TransactionClient,
  ): Promise<ContactFullInclude> {
    const transactionManager = tx ?? this.prisma;

    const { workAddress, homeAddress, ...rest } = dto;

    return transactionManager.contact.update({
      where: {
        id: contactId,
      },
      data: {
        ...rest,
        homeAddress: {
          update: homeAddress,
        },
        workAddress: {
          update: workAddress,
        },
      },
      include: contactFullInclude,
    });
  }

  public async getContactList(
    filter: GetListContactDto,
    teamId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<GetListContactInterface> {
    const transactionManager = tx ?? this.prisma;

    const where: Prisma.ContactWhereInput = {
      teamId: teamId,
      isTransactionOnly: false,
    };

    if (filter.search) {
      where.AND = {
        OR: [
          {
            firstName: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
        ],
      };
    }

    if (filter?.company) {
      where.company = { in: filter.company };
    }

    if (filter?.category) {
      where.category = { in: filter.category };
    }

    const [data, count] = await Promise.all([
      transactionManager.contact.findMany({
        where,
        include: contactFullInclude,
        orderBy: { createdAt: 'desc' },
        take: filter?.take,
        skip: filter?.skip,
      }),
      transactionManager.contact.count({ where }),
    ]);

    return { data, count };
  }

  public getCompanyList(
    filter: SearchFilterDto,
    teamId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ company: string }[]> {
    const transactionManager = tx ?? this.prisma;

    const where: Prisma.ContactWhereInput = {
      teamId,
    };

    if (filter.search) {
      where.company = { contains: filter.search, mode: 'insensitive' };
    }

    return transactionManager.contact.findMany({
      where,
      skip: filter?.skip,
      take: filter?.take,
      orderBy: { createdAt: 'desc' },
      select: { company: true },
    });
  }

  public async deleteByIds(
    ids: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const transactionManager = tx ?? this.prisma;

    await transactionManager.contact.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
