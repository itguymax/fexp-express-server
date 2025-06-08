// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../database/prisma";
import { config } from "../config";
import { ApiError } from "../utils/errorHandler";

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; uuid: string | null; email: string };
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded: any = jwt.verify(token, config.jwtSecret);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, uuid: true, email: true }, // Select only necessary fields for req.user
      });

      if (!user) {
        return next(new ApiError("Not authorized, user not found", 401));
      }

      req.user = user; // Attach user to request
      next();
    } catch (error: any) {
      console.error("Token verification error:", error.message);
      return next(new ApiError("Not authorized, token failed", 401));
    }
  }

  if (!token) {
    return next(new ApiError("Not authorized, no token", 401));
  }
};

// Middleware to ensure user is active/verified if needed (expand later)
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Implement role-based authorization here if you add roles to your User model
    // For now, this is a placeholder
    next();
  };
};
