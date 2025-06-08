// src/services/matches.service.ts
import { prisma } from "../database/prisma";
import { Match, MatchStatus } from "@prisma/client";

export const MatchService = {
  create: async (
    listingId: number,
    initiatorUserId: number,
    receiverUserId: number,
    amount: number | null = null
  ): Promise<Match> => {
    return prisma.match.create({
      data: {
        listingId,
        initiatorUserId,
        receiverUserId,
        amount,
        status: MatchStatus.PENDING,
      },
    });
  },

  findById: async (id: number): Promise<Match | null> => {
    return prisma.match.findUnique({
      where: { id },
      include: {
        listing: true,
        initiator: { select: { id: true, uuid: true, email: true } },
        receiver: { select: { id: true, uuid: true, email: true } },
      },
    });
  },

  updateStatus: async (
    matchId: number,
    status: MatchStatus
  ): Promise<Match> => {
    return prisma.match.update({
      where: { id: matchId },
      data: { status },
    });
  },

  // TODO: Add more methods for listing matches, filtering, etc.
};
