import { Prisma } from '@prisma/client';

export const templateFullInclude = Prisma.validator<Prisma.TemplateInclude>()({
  lists: true,
  agents: {
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
  },
});

export type TemplateFullInclude = Prisma.TemplateGetPayload<{
  include: typeof templateFullInclude;
}>;
