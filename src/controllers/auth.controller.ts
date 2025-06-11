// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/users.service";
import { AuthService } from "../services/auth.service";
import { ApiError } from "../utils/errorHandler";
import { TokenService } from "../services/token.service";
import { PasswordResetService } from "../services/passwordReset.service";
import { EmailSender } from "../utils/emailSender";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

export const AuthController = {
  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1]; // Get token from request

      if (!token) {
        return next(new ApiError("No token provided", 400));
      }

      // Decode token to get expiration time
      const decoded: any = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        return next(new ApiError("Invalid token or missing expiration", 400));
      }

      // Calculate remaining expiration time in seconds
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000); // JWT exp is in seconds

      if (expiresIn > 0) {
        await TokenService.blacklistToken(token, expiresIn);
      }

      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  },
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const user = await UserService.findByEmail(email);

      if (!user) {
        // For security, always send a success message even if email not found
        // to prevent email enumeration attacks.
        console.log(
          `Password reset requested for non-existent email: ${email}`
        );
        return res.status(200).json({
          message:
            "If a matching account is found, a password reset email will be sent.",
        });
      }

      const resetToken = await PasswordResetService.createResetToken(user.id);
      await EmailSender.sendPasswordResetEmail(user.email, resetToken);

      res.status(200).json({
        message:
          "If a matching account is found, a password reset email will be sent.",
      });
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, email, newPassword } = req.body;

      if (!token || !email || !newPassword) {
        return next(
          new ApiError("Token, email, and new password are required", 400)
        );
      }

      const user = await UserService.findByEmail(email);
      if (!user) {
        return next(new ApiError("Invalid request: User not found", 404)); // User must exist
      }

      const userId = await PasswordResetService.validateAndUseResetToken(token);

      if (userId !== user.id) {
        // Ensure token belongs to the correct user
        return next(
          new ApiError("Invalid or expired password reset token", 400)
        );
      }

      const hashedPassword = await AuthService.hashPassword(newPassword);
      await UserService.updatePassword(userId, hashedPassword); // Implement this new method in UserService

      res
        .status(200)
        .json({ message: "Password has been reset successfully." });
    } catch (error) {
      next(error);
    }
  },

  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        email,
        password,
        name,
        countryOfOrigin,
        countryOfResidence,
        isStudent,
        agreeTerms,
      } = req.body;

      const existingUser = await UserService.findByEmail(email);
      if (existingUser) {
        return next(new ApiError("Email already registered", 400));
      }

      const hashedPassword = await AuthService.hashPassword(password);
      const newUser = await UserService.create(
        {
          email,
          name,
          countryOfOrigin,
          countryOfResidence,
          isStudent,
          agreeTerms,
        },
        hashedPassword
      );

      // Exclude passwordHash from response for security
      const { passwordHash, ...userWithoutPassword } = newUser;
      res.status(201).json({
        message: "User registered successfully",
        user: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const user = await UserService.findByEmail(email);

      if (
        !user ||
        !(await AuthService.comparePasswords(
          password,
          user.passwordHash as string
        ))
      ) {
        return next(new ApiError("Invalid credentials", 401));
      }

      await UserService.updateLastLogin(user.id);
      const token = AuthService.generateToken({
        id: user.id,
        uuid: user.uuid as string,
        email: user.email,
        role: user.role,
      });

      res.status(200).json({
        access_token: token,
        token_type: "bearer",
      });
    } catch (error) {
      next(error);
    }
  },

  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.user is set by the 'protect' middleware
      if (!req.user) {
        return next(new ApiError("User not authenticated", 401));
      }
      const user = await UserService.findById(req.user.id);
      if (!user) {
        return next(new ApiError("User not found", 404));
      }
      const { passwordHash, ...userProfile } = user;
      res.status(200).json(userProfile);
    } catch (error) {
      next(error);
    }
  },
};
