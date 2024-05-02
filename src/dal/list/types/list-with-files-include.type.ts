import { Prisma } from '@prisma/client';

export const listWithFileIdsInclude = Prisma.validator<Prisma.ListInclude>()({
  files: { select: { id: true } },
});

export type ListWithFileIdsInclude = Prisma.ListGetPayload<{
  include: typeof listWithFileIdsInclude;
}>;
