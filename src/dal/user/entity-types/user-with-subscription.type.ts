import { Prisma } from '@prisma/client';

export type UserWithSubscription = Prisma.UserGetPayload<{
  include: {
    subscription: true;
    member: true;
  };
}>;
