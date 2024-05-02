import { Prisma } from '@prisma/client';

export const membersFullInclude = Prisma.validator<Prisma.MemberInclude>()({
  user: true,
  role: true,
});

export type MembersFullInclude = Prisma.MemberGetPayload<{
  include: typeof membersFullInclude;
}>;
