import { Prisma } from '@prisma/client';

export const noteWithUserInclude = Prisma.validator<Prisma.NoteInclude>()({
  user: { select: { firstName: true, lastName: true, id: true } },
});

export type NoteWithAssignedPersonInclude = Prisma.NoteGetPayload<{
  include: typeof noteWithUserInclude;
}>;
