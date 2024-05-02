import { Prisma } from '@prisma/client';

export type TeamFull = Prisma.TeamGetPayload<{
  include: {
    members: {
      include: {
        user: true;
        role: true;
        transactions: true;
      };
    };
  };
}>;
