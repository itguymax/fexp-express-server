// src/services/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { User } from "@prisma/client"; // Import Prisma's generated User type

export const AuthService = {
  hashPassword: async (password: string): Promise<string> => {
    return await bcrypt.hash(password, config.saltRounds);
  },

  comparePasswords: async (
    password: string,
    hash: string
  ): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
  },

  generateToken: (user: {
    id: number;
    uuid: string;
    email: string;
  }): string => {
    const options = {
      //   expiresIn: config.jwtExpirationTime,
      issuer: config.jwtIssuer,
    };
    const payload = { id: user.id, uuid: user.uuid, email: user.email };
    return jwt.sign(payload, config.jwtSecret, options);
  },
};
