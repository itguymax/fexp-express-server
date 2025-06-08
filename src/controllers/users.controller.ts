// src/controllers/users.controller.ts
import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/users.service";
import { ApiError } from "../utils/errorHandler";

export const UserController = {
  getUserByUuid: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid } = req.params;
      const user = await UserService.findByUuid(uuid);

      if (!user) {
        return next(new ApiError("User not found", 404));
      }

      const { passwordHash, ...userPublicData } = user; // Exclude sensitive info
      res.status(200).json(userPublicData);
    } catch (error) {
      next(error);
    }
  },

  // TODO: Add methods for updating user profile, etc.
};
