// src/controllers/match.controller.ts
import { Request, Response, NextFunction } from "express";
import { MatchService } from "../services/matches.service";
import { ApiError } from "../utils/errorHandler";
import { MatchStatus } from "@prisma/client"; // Import MatchStatus

export const MatchController = {
  // ... (Your existing sendMessage and getMessages methods) ...

  /**
   * Propose a new match between the user's own listing and another user's matching listing.
   * POST /api/v1/matches
   */
  proposeMatch: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return next(new ApiError("Authentication required.", 401));
      }

      const initiatorId = req.user.id;
      const { initiatorListingUuid, matchedListingUuid } = req.body;

      if (!initiatorListingUuid || typeof initiatorListingUuid !== "string") {
        return next(new ApiError("Invalid initiatorListingUuid.", 400));
      }
      if (!matchedListingUuid || typeof matchedListingUuid !== "string") {
        return next(new ApiError("Invalid matchedListingUuid.", 400));
      }

      const newMatch = await MatchService.proposeMatch(
        initiatorId,
        initiatorListingUuid,
        matchedListingUuid
      );

      res.status(201).json({
        status: "success",
        message: "Match proposal sent successfully.",
        data: {
          match: newMatch,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all matches involving the authenticated user.
   * GET /api/v1/matches
   */
  getMyMatches: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return next(new ApiError("Authentication required.", 401));
      }

      const userId = req.user.id;
      const { page = "1", limit = "10", status } = req.query; // Allow filtering by status

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
        return next(new ApiError("Invalid page or limit number.", 400));
      }

      let filterStatus: MatchStatus | undefined;
      if (
        status &&
        Object.values(MatchStatus).includes(status as MatchStatus)
      ) {
        filterStatus = status as MatchStatus;
      } else if (status) {
        // If status is provided but invalid
        return next(
          new ApiError(
            `Invalid match status filter. Must be one of: ${Object.values(
              MatchStatus
            ).join(", ")}.`,
            400
          )
        );
      }

      const { matches, totalMatches } = await MatchService.getMyMatches(
        userId,
        pageNum,
        limitNum,
        filterStatus
      );
      const totalPages = Math.ceil(totalMatches / limitNum);

      res.status(200).json({
        status: "success",
        data: {
          matches,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalMatches,
            limit: limitNum,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Accept a pending match proposal.
   * PUT /api/v1/matches/:uuid/accept
   */
  acceptMatch: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return next(new ApiError("Authentication required.", 401));
      }

      const { uuid } = req.params;
      const userId = req.user.id; // User attempting to accept

      const updatedMatch = await MatchService.acceptMatch(uuid, userId);

      res.status(200).json({
        status: "success",
        message: "Match proposal accepted successfully.",
        data: {
          match: updatedMatch,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reject a pending match proposal.
   * PUT /api/v1/matches/:uuid/reject
   */
  rejectMatch: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return next(new ApiError("Authentication required.", 401));
      }

      const { uuid } = req.params;
      const userId = req.user.id; // User attempting to reject

      const updatedMatch = await MatchService.rejectMatch(uuid, userId);

      res.status(200).json({
        status: "success",
        message: "Match proposal rejected.",
        data: {
          match: updatedMatch,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cancel an active or pending match.
   * PUT /api/v1/matches/:uuid/cancel
   */
  cancelMatch: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return next(new ApiError("Authentication required.", 401));
      }

      const { uuid } = req.params;
      const userId = req.user.id; // User attempting to cancel

      const updatedMatch = await MatchService.cancelMatch(uuid, userId);

      res.status(200).json({
        status: "success",
        message: "Match cancelled successfully.",
        data: {
          match: updatedMatch,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Confirm completion of an accepted match.
   * PUT /api/v1/matches/:uuid/confirm-completion
   */
  confirmCompletion: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || !req.user.id) {
        return next(new ApiError("Authentication required.", 401));
      }

      const { uuid } = req.params;
      const userId = req.user.id; // User confirming completion

      const updatedMatch = await MatchService.confirmCompletion(uuid, userId);

      res.status(200).json({
        status: "success",
        message: "Match completion confirmed.",
        data: {
          match: updatedMatch,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
