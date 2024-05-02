import { Injectable } from '@nestjs/common';
import { CreateEarlyAccessUserDto } from 'src/early-access-user/dto/request-dto/create-early-access-user.dto';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { EarlyAccessUserDto } from 'src/early-access-user/dto/response-dto/early-access-user.dto';
import { TransactionManager } from 'src/infra/prisma/types/transaction-manager.type';

@Injectable()
export class EarlyAccessUserRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public createEarlyAccessUser(
    data: CreateEarlyAccessUserDto,
    tx?: TransactionManager,
  ): Promise<EarlyAccessUserDto> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.earlyAccessUser.create({ data });
  }

  public findEarlyAccessUser(
    email: string,
  ): Promise<EarlyAccessUserDto | null> {
    return this.prisma.earlyAccessUser.findUnique({ where: { email } });
  }

  public getAllEarlyAccessUsers(): Promise<EarlyAccessUserDto[]> {
    return this.prisma.earlyAccessUser.findMany();
  }
}
