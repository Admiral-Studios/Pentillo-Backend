import { Prisma } from '@prisma/client';

export const transactionWithContactInclude =
  Prisma.validator<Prisma.TransactionInclude>()({
    participant: {
      include: {
        primaryAgent: { select: { firstName: true, lastName: true } },
        buyersAndSellers: {
          include: {
            contact: {
              select: { firstName: true, lastName: true, category: true },
            },
          },
        },
      },
    },
  });

export type TransactionWithContactInclude = Prisma.TransactionGetPayload<{
  include: typeof transactionWithContactInclude;
}>;
