import { Prisma } from '@prisma/client';

export const memberTransactionsInclude =
  Prisma.validator<Prisma.MemberInclude>()({
    user: true,
    role: true,
    transactions: true,
  });

export type MemberTransactionInclude = Prisma.MemberGetPayload<{
  include: typeof memberTransactionsInclude;
}>;
