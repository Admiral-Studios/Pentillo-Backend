import { Injectable } from '@nestjs/common';
import { TransactionManager } from '../../infra/prisma/types/transaction-manager.type';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { User } from '@prisma/client';
import { UserWithSubscription } from './entity-types/user-with-subscription.type';
import { RegistrationDto } from 'src/auth/dto/request-dto/registration.dto';
import { FindUserDto } from 'src/user/dto/request-dto/find-user.dto';

@Injectable()
export class UserRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async findAllUsers(tx?: TransactionManager): Promise<User[]> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.user.findMany();
  }

  public async findUser(
    data: FindUserDto,
    tx?: TransactionManager,
  ): Promise<UserWithSubscription | null> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.user.findFirst({
      where: {
        OR: [{ id: data.id }, { email: data.email }],
      },
      include: {
        subscription: true,
        member: true,
      },
    });
  }

  public async createUser(
    data: RegistrationDto,
    tx?: TransactionManager,
  ): Promise<User> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.user.create({ data });
  }

  public async createUserWithGoogle(
    email: string,
    firstName: string,
    lastName?: string,
    tx?: TransactionManager,
  ): Promise<User> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.user.create({
      data: {
        email,
        firstName,
        lastName,
        isConfirmed: true,
        isSignedByGoogle: true,
      },
    });
  }

  public async updateUser(
    id: string,
    data: Partial<User>,
    tx?: TransactionManager,
  ): Promise<User> {
    const transactionManager = tx ?? this.prisma;
    return transactionManager.user.update({
      where: { id },
      data,
    });
  }

  public async deleteUserByEmail(
    email: string,
    tx?: TransactionManager,
  ): Promise<User> {
    const transactionManager = tx ?? this.prisma;
    return transactionManager.user.delete({ where: { email } });
  }
}
