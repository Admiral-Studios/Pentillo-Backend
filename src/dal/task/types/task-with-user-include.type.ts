import { Prisma } from '@prisma/client';

export const taskWithAssignedPersonInclude =
  Prisma.validator<Prisma.TaskInclude>()({
    assignedPerson: true,
  });

export type TaskWithAssignedPersonInclude = Prisma.TaskGetPayload<{
  include: typeof taskWithAssignedPersonInclude;
}>;
