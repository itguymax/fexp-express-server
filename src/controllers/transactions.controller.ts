// src/controllers/transactions.controller.ts
import { Request, Response, NextFunction } from "express";
import { TransactionService } from "../services/transactions.service";
import { ApiError } from "../utils/errorHandler";
import { MatchService } from "../services/matches.service"; // Assuming you need match details

export const TransactionController = {
  initiateTransaction: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) return next(new ApiError("Authentication required", 401));
      const { matchId, amount, currency } = req.body;

      const match = await MatchService.findById(matchId);
      if (!match) return next(new ApiError("Match not found", 404));

      // Basic authorization: ensure current user is part of the match
      if (
        req.user.id !== match.initiatorUserId &&
        req.user.id !== match.receiverUserId
      ) {
        return next(
          new ApiError(
            "Not authorized to initiate transaction for this match",
            403
          )
        );
      }

      // Determine sender/receiver based on match roles
      const senderId = req.user.id;
      const receiverId =
        senderId === match.initiatorUserId
          ? match.receiverUserId
          : match.initiatorUserId;

      const newTransaction = await TransactionService.create(
        matchId,
        senderId,
        receiverId,
        amount,
        currency
      );
      res.status(201).json(newTransaction);
    } catch (error) {
      next(error);
    }
  },

  markSent: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return next(new ApiError("Authentication required", 401));
      const { id } = req.params;
      const transaction = await TransactionService.findById(parseInt(id));

      if (!transaction) return next(new ApiError("Transaction not found", 404));
      if (req.user.id !== transaction.senderUserId) {
        // Only sender can mark as sent
        return next(
          new ApiError("Not authorized to update this transaction status", 403)
        );
      }

      const updatedTransaction = await TransactionService.updateStatus(
        parseInt(id),
        "SENT_BY_SENDER",
        req.body.proofOfPayment
      );
      res.status(200).json(updatedTransaction);
    } catch (error) {
      next(error);
    }
  },

  markReceived: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return next(new ApiError("Authentication required", 401));
      const { id } = req.params;
      const transaction = await TransactionService.findById(parseInt(id));

      if (!transaction) return next(new ApiError("Transaction not found", 404));
      if (req.user.id !== transaction.receiverUserId) {
        // Only receiver can mark as received
        return next(
          new ApiError("Not authorized to update this transaction status", 403)
        );
      }

      const updatedTransaction = await TransactionService.updateStatus(
        parseInt(id),
        "RECEIVED_BY_RECEIVER"
      );
      res.status(200).json(updatedTransaction);
    } catch (error) {
      next(error);
    }
  },
  // TODO: Add get transaction by ID, get user's transactions, mark completed, dispute, cancel
};
