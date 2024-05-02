import { Prisma } from '@prisma/client';

export const transactionWithPrimaryAgentSelect =
  Prisma.validator<Prisma.TransactionSelect>()({
    id: true,
    street: true,
    participant: {
      select: {
        primaryAgent: { select: { id: true, firstName: true, lastName: true } },
      },
    },
  });

export type TransactionWithPrimaryAgentSelect = Prisma.TransactionGetPayload<{
  select: typeof transactionWithPrimaryAgentSelect;
}>;
