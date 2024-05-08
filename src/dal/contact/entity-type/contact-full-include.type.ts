import { Prisma } from '@prisma/client';

export const contactFullInclude = Prisma.validator<Prisma.ContactInclude>()({
  homeAddress: true,
  workAddress: true,
});

export type ContactFullInclude = Prisma.ContactGetPayload<{
  include: typeof contactFullInclude;
}>;
