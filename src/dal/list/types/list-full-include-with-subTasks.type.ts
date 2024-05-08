import { Prisma } from '@prisma/client';
import { listFullInclude } from './list-full-include.type';

export const listFullWithSubTasksInclude =
  Prisma.validator<Prisma.ListInclude>()({
    ...listFullInclude,
    tasks: {
      include: {
        subTasks: true,
        notes: true,
        assignedPerson: { select: { id: true } },
      },
    },
  });

export type ListFullWithSubTasksInclude = Prisma.ListGetPayload<{
  include: typeof listFullWithSubTasksInclude;
}>;
