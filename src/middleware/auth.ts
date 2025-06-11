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
      user?: {
        id: number;
        uuid: string | null;
        email: string;
        role: string;
        countryOfResidence: string | null;
      };
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;
  console.log("-- JWT Protect Middleware Debugging ---");
  console.log("Authorization Header:", req.headers.authorization);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      console.log("Header checked");
      token = req.headers.authorization.split(" ")[1];
      console.log("HEader Token extraction", token);
      console.log("Type of token extracted", typeof token, token?.length);
      console.log("JWT SECRET", config.jwtSecret, config.jwtExpirationTime);
      console.log("JWT SECRET type", typeof config.jwtSecret, config.jwtSecret);
      const decoded: any = jwt.verify(token, config.jwtSecret);
      console.log("decoded token", decoded);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          uuid: true,
          email: true,
          role: true,
          countryOfResidence: true,
        }, // Select only necessary fields for req.user
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
    if (!req.user || !req.user.role) {
      return next(new ApiError("Not authorized, user role not found", 403));
    }
    // check if user's role is included in the allowed roles for this route
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          `Role(${req.user.role}) is not authorized to access this resource`,
          403
        )
      );
    }
    next();
  };
};
