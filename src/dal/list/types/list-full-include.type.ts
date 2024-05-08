import { Prisma } from '@prisma/client';

export const listFullInclude = Prisma.validator<Prisma.ListInclude>()({
  files: { include: { notes: true } },
  dates: true,
  tasks: true,
});

export type ListFullInclude = Prisma.ListGetPayload<{
  include: typeof listFullInclude;
}>;
