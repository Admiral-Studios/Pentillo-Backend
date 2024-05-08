import { Injectable } from '@nestjs/common';
import { Subscription } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { TransactionManager } from 'src/infra/prisma/types/transaction-manager.type';
import { CreateSubscriptionDataDto } from 'src/subscription/dto/request-dto/create-subscription-data.dto';

@Injectable()
export class SubscriptionRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async createSubscription(
    data: CreateSubscriptionDataDto,
    tx?: TransactionManager,
  ): Promise<Subscription> {
    const transactionManager = tx ?? this.prisma;

    await transactionManager.subscription.deleteMany({
      where: { userId: data.userId },
    });

    return transactionManager.subscription.create({ data });
  }
  public findSubscription(
    data: Partial<Subscription>,
    tx?: TransactionManager,
  ): Promise<Subscription> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.subscription.findFirst({ where: data });
  }

  public updateSubscription(
    id: string,
    data: Partial<Subscription>,
    tx?: TransactionManager,
  ): Promise<Subscription> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.subscription.update({
      where: { id },
      data,
    });
  }

  public deleteSubscription(
    id: string,
    tx?: TransactionManager,
  ): Promise<Subscription> {
    const transactionManager = tx ?? this.prisma;

    return transactionManager.subscription.delete({ where: { id } });
  }
}
