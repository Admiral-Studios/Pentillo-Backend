import { Prisma } from '@prisma/client';

export const transactionFullInclude =
  Prisma.validator<Prisma.TransactionInclude>()({
    details: true,
    contract: true,
    payout: true,
    participant: true,
  });

export type TransactionFullInclude = Prisma.TransactionGetPayload<{
  include: typeof transactionFullInclude;
}>;
