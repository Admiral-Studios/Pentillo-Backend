import { Prisma } from '@prisma/client';

export const fileWithNotesInclude = Prisma.validator<Prisma.FileInclude>()({
  notes: { select: { text: true } },
});

export type FileWithNotesInclude = Prisma.FileGetPayload<{
  include: typeof fileWithNotesInclude;
}>;
