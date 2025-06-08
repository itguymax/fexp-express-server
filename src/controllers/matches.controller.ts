// src/controllers/matches.controller.ts
import { Request, Response, NextFunction } from "express";
import { MatchService } from "../services/matches.service";
import { ApiError } from "../utils/errorHandler";

export const MatchController = {
  createMatch: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return next(new ApiError("Authentication required", 401));
      const { listingId, receiverUserId, amount } = req.body;
      // You'd typically get receiverUserId from the listing details, not directly from request body
      // For MVP, assuming it's passed or derived from listingId
      const newMatch = await MatchService.create(
        listingId,
        req.user.id,
        receiverUserId,
        amount
      );
      res.status(201).json(newMatch);
    } catch (error) {
      next(error);
    }
  },

  acceptMatch: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const match = await MatchService.findById(parseInt(id));

      if (!match) return next(new ApiError("Match not found", 404));
      // Basic authorization: ensure the current user is the receiver of the match
      if (req.user?.id !== match.receiverUserId) {
        return next(new ApiError("Not authorized to accept this match", 403));
      }

      const updatedMatch = await MatchService.updateStatus(
        parseInt(id),
        "ACCEPTED"
      );
      res.status(200).json(updatedMatch);
    } catch (error) {
      next(error);
    }
  },

  // TODO: Add rejectMatch, cancelMatch, get user's matches
};
