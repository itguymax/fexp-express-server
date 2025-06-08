// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/users.service";
import { AuthService } from "../services/auth.service";
import { ApiError } from "../utils/errorHandler";

export const AuthController = {
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
