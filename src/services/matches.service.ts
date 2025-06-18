// src/services/match.service.ts
import { prisma } from "../database/prisma";
import { ApiError } from "../utils/errorHandler";
import { Match, MatchStatus, ListingStatus } from "@prisma/client"; // Import enums

export const MatchService = {
  // ... (Your existing sendMessage and getMessages methods) ...

  /**
   * Proposes a new match between two listings.
   * - Ensures listings are valid, active, not owned by the same user, and from same country/origin corridor.
   * - Sets initial match status to PENDING.
   * - Updates involved listings' status to PENDING to prevent double-matching.
   */
  proposeMatch: async (
    initiatorId: number,
    initiatorListingUuid: string,
    matchedListingUuid: string
  ): Promise<Match> => {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch initiator's listing and verify ownership
      const initiatorListing = await tx.exchangeListing.findUnique({
        where: { uuid: initiatorListingUuid },
        include: { user: true },
      });

      if (!initiatorListing || initiatorListing.userId !== initiatorId) {
        throw new ApiError(
          "Initiator listing not found or not owned by you.",
          404
        );
      }
      if (
        initiatorListing.status !== ListingStatus.ACTIVE ||
        initiatorListing.expiresAt < new Date()
      ) {
        throw new ApiError(
          "Initiator listing is not active or has expired.",
          400
        );
      }

      // 2. Fetch matched listing and verify validity and matching criteria
      const matchedListing = await tx.exchangeListing.findUnique({
        where: { uuid: matchedListingUuid },
        include: { user: true },
      });

      if (!matchedListing) {
        throw new ApiError("Matched listing not found.", 404);
      }
      if (matchedListing.userId === initiatorId) {
        throw new ApiError("Cannot propose a match to your own listing.", 400);
      }
      if (
        matchedListing.status !== ListingStatus.ACTIVE ||
        matchedListing.expiresAt < new Date()
      ) {
        throw new ApiError(
          "Matched listing is not active or has expired.",
          400
        );
      }

      // 3. Verify corridor match (countryOfResidence and countryOfOrigin)
      if (
        initiatorListing.user.countryOfResidence !==
          matchedListing.user.countryOfResidence ||
        initiatorListing.user.countryOfOrigin !==
          matchedListing.user.countryOfOrigin
      ) {
        throw new ApiError(
          "Listings are not in the same remittance corridor (residence and origin countries must match).",
          400
        );
      }

      // 4. Verify currency and listing type match
      if (
        initiatorListing.currencyFrom !== matchedListing.currencyFrom ||
        initiatorListing.type === matchedListing.type
      ) {
        throw new ApiError(
          "Listings do not have opposite types for the same currency.",
          400
        );
      }

      // 5. Check for existing PENDING/ACCEPTED matches between these two listings
      const existingMatch = await tx.match.findFirst({
        where: {
          OR: [
            {
              initiatorListingId: initiatorListing.id,
              matchedListingId: matchedListing.id,
            },
            {
              initiatorListingId: matchedListing.id,
              matchedListingId: initiatorListing.id,
            }, // Check inverse
          ],
          status: { in: [MatchStatus.PENDING, MatchStatus.ACCEPTED] },
        },
      });

      if (existingMatch) {
        throw new ApiError(
          "A pending or accepted match already exists for these listings.",
          400
        );
      }

      // 6. Create the match
      const newMatch = await tx.match.create({
        data: {
          initiatorId: initiatorId,
          initiatorListingId: initiatorListing.id,
          matchedListingId: matchedListing.id,
          status: MatchStatus.PENDING,
        },
        include: {
          initiator: {
            select: { uuid: true, name: true, countryOfOrigin: true },
          },
          initiatorListing: true,
          matchedListing: {
            include: {
              user: {
                select: { uuid: true, name: true, countryOfOrigin: true },
              },
            },
          },
        },
      });

      // 7. Update listing statuses to PENDING to prevent other matches
      await tx.exchangeListing.update({
        where: { id: initiatorListing.id },
        data: { status: ListingStatus.PENDING },
      });
      await tx.exchangeListing.update({
        where: { id: matchedListing.id },
        data: { status: ListingStatus.PENDING },
      });

      return newMatch;
    });
  },

  /**
   * Retrieves all matches for a given user, including details of the involved listings and users.
   */
  getMyMatches: async (
    userId: number,
    page: number,
    limit: number,
    status?: MatchStatus
  ) => {
    const skip = (page - 1) * limit;

    const whereClause: any = {
      OR: [{ initiatorId: userId }, { matchedListing: { userId: userId } }],
    };

    if (status) {
      whereClause.status = status;
    }

    const matches = await prisma.match.findMany({
      where: whereClause,
      skip: skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        initiator: {
          select: {
            uuid: true,
            name: true,

            countryOfOrigin: true,
          },
        },
        initiatorListing: {
          include: {
            user: {
              select: {
                uuid: true,
                name: true,

                countryOfOrigin: true,
              },
            },
          },
        },
        matchedListing: {
          include: {
            user: {
              select: {
                uuid: true,
                name: true,
                countryOfOrigin: true,
              },
            },
          },
        },
      },
    });

    const totalMatches = await prisma.match.count({
      where: whereClause,
    });

    return { matches, totalMatches };
  },

  /**
   * Accepts a pending match proposal. Only the owner of the matched listing can accept.
   * Moves match status to ACCEPTED and involved listings to IN_PROGRESS.
   */
  acceptMatch: async (matchUuid: string, userId: number): Promise<Match> => {
    return prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { uuid: matchUuid },
        include: {
          initiatorListing: { select: { userId: true, status: true } },
          matchedListing: { select: { userId: true, status: true } },
        },
      });

      if (!match) {
        throw new ApiError("Match not found.", 404);
      }
      if (match.matchedListing.userId !== userId) {
        // Only the owner of the matched listing can accept
        throw new ApiError("Not authorized to accept this match.", 403);
      }
      if (match.status !== MatchStatus.PENDING) {
        throw new ApiError(
          `Match cannot be accepted. Current status: ${match.status}.`,
          400
        );
      }

      const updatedMatch = await tx.match.update({
        where: { id: match.id },
        data: { status: MatchStatus.ACCEPTED },
        include: {
          initiator: {
            select: { uuid: true, name: true, countryOfOrigin: true },
          },
          initiatorListing: true,
          matchedListing: {
            include: {
              user: {
                select: { uuid: true, name: true, countryOfOrigin: true },
              },
            },
          },
        },
      });

      // Update listing statuses to PENDING_MATCH_CONFIRMATION if they aren't already
      // Or simply keep them as PENDING until completion for now,
      // as they are already prevented from new matches by status.
      // We can refine this later if needed.

      return updatedMatch;
    });
  },

  /**
   * Rejects a pending match proposal. Only the owner of the matched listing can reject.
   * Moves match status to REJECTED and reverts involved listings to ACTIVE.
   */
  rejectMatch: async (matchUuid: string, userId: number): Promise<Match> => {
    return prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { uuid: matchUuid },
        include: {
          initiatorListing: { select: { userId: true, id: true } },
          matchedListing: { select: { userId: true, id: true } },
        },
      });

      if (!match) {
        throw new ApiError("Match not found.", 404);
      }
      if (match.matchedListing.userId !== userId) {
        // Only the owner of the matched listing can reject
        throw new ApiError("Not authorized to reject this match.", 403);
      }
      if (match.status !== MatchStatus.PENDING) {
        throw new ApiError(
          `Match cannot be rejected. Current status: ${match.status}.`,
          400
        );
      }

      const updatedMatch = await tx.match.update({
        where: { id: match.id },
        data: { status: MatchStatus.REJECTED },
        include: {
          initiator: {
            select: { uuid: true, name: true, countryOfOrigin: true },
          },
          initiatorListing: true,
          matchedListing: {
            include: {
              user: {
                select: { uuid: true, name: true, countryOfOrigin: true },
              },
            },
          },
        },
      });

      // Revert listing statuses back to ACTIVE
      await tx.exchangeListing.update({
        where: { id: match.initiatorListing.id },
        data: { status: ListingStatus.ACTIVE },
      });
      await tx.exchangeListing.update({
        where: { id: match.matchedListing.id },
        data: { status: ListingStatus.ACTIVE },
      });

      return updatedMatch;
    });
  },

  /**
   * Cancels an active or pending match. Can be initiated by either participant.
   * Moves match status to CANCELLED and reverts involved listings to ACTIVE.
   */
  cancelMatch: async (matchUuid: string, userId: number): Promise<Match> => {
    return prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { uuid: matchUuid },
        include: {
          initiatorListing: { select: { userId: true, id: true } },
          matchedListing: { select: { userId: true, id: true } },
        },
      });

      if (!match) {
        throw new ApiError("Match not found.", 404);
      }
      // Check if the user trying to cancel is a participant
      if (
        match.initiatorListing.userId !== userId &&
        match.matchedListing.userId !== userId
      ) {
        throw new ApiError("Not authorized to cancel this match.", 403);
      }
      if (
        match.status !== MatchStatus.PENDING &&
        match.status !== MatchStatus.ACCEPTED
      ) {
        throw new ApiError(
          `Match cannot be cancelled. Current status: ${match.status}.`,
          400
        );
      }

      const updatedMatch = await tx.match.update({
        where: { id: match.id },
        data: { status: MatchStatus.CANCELED },
        include: {
          initiator: {
            select: { uuid: true, name: true, countryOfOrigin: true },
          },
          initiatorListing: true,
          matchedListing: {
            include: {
              user: {
                select: { uuid: true, name: true, countryOfOrigin: true },
              },
            },
          },
        },
      });

      // Revert listing statuses back to ACTIVE
      await tx.exchangeListing.update({
        where: { id: match.initiatorListing.id },
        data: { status: ListingStatus.ACTIVE },
      });
      await tx.exchangeListing.update({
        where: { id: match.matchedListing.id },
        data: { status: ListingStatus.ACTIVE },
      });

      return updatedMatch;
    });
  },

  /**
   * Confirms completion for one side of an accepted match.
   * If both sides confirm, the match status moves to COMPLETED, and listings to COMPLETED.
   */
  confirmCompletion: async (
    matchUuid: string,
    userId: number
  ): Promise<Match> => {
    return prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { uuid: matchUuid },
        include: {
          initiatorListing: { select: { userId: true, id: true } },
          matchedListing: { select: { userId: true, id: true } },
        },
      });

      if (!match) {
        throw new ApiError("Match not found.", 404);
      }
      if (match.status !== MatchStatus.ACCEPTED) {
        throw new ApiError(
          `Match cannot be confirmed. Current status: ${match.status}. Only ACCEPTED matches can be confirmed.`,
          400
        );
      }

      // Check which user is confirming
      let updateData: any = {};
      if (match.initiatorListing.userId === userId) {
        if (match.initiatorConfirmedCompletion) {
          throw new ApiError(
            "You have already confirmed completion for this match.",
            400
          );
        }
        updateData.initiatorConfirmedCompletion = true;
      } else if (match.matchedListing.userId === userId) {
        if (match.matchedConfirmedCompletion) {
          throw new ApiError(
            "You have already confirmed completion for this match.",
            400
          );
        }
        updateData.matchedConfirmedCompletion = true;
      } else {
        throw new ApiError(
          "Not authorized to confirm completion for this match.",
          403
        );
      }

      // Update match status to COMPLETED if both parties have confirmed
      const newStatus =
        (match.initiatorConfirmedCompletion ||
          updateData.initiatorConfirmedCompletion) &&
        (match.matchedConfirmedCompletion ||
          updateData.matchedConfirmedCompletion)
          ? MatchStatus.COMPLETED
          : MatchStatus.ACCEPTED; // Remain ACCEPTED if only one confirms

      updateData.status = newStatus;

      const updatedMatch = await tx.match.update({
        where: { id: match.id },
        data: updateData,
        include: {
          initiator: {
            select: { uuid: true, name: true, countryOfOrigin: true },
          },
          initiatorListing: true,
          matchedListing: {
            include: {
              user: {
                select: { uuid: true, name: true, countryOfOrigin: true },
              },
            },
          },
        },
      });

      // If match is now COMPLETED, update listing statuses
      if (updatedMatch.status === MatchStatus.COMPLETED) {
        await tx.exchangeListing.update({
          where: { id: match.initiatorListing.id },
          data: { status: ListingStatus.COMPLETED },
        });
        await tx.exchangeListing.update({
          where: { id: match.matchedListing.id },
          data: { status: ListingStatus.COMPLETED },
        });
      }

      return updatedMatch;
    });
  },
};
