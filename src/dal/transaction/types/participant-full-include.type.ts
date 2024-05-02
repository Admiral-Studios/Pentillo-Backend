import { Prisma } from '@prisma/client';

export const participantFullInclude =
  Prisma.validator<Prisma.ParticipantInclude>()({
    firstAssistant: true,
    secondAssistant: true,
    primaryAgent: true,
    goAgent: true,
    buyersAndSellers: { include: { contact: true } },
  });

export type ParticipantFullInclude = Prisma.ParticipantGetPayload<{
  include: typeof participantFullInclude;
}>;
