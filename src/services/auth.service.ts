// src/services/auth.service.ts
import bcrypt from "bcryptjs";
import jwt, { Algorithm } from "jsonwebtoken";
import { config } from "../config";
import { User, UserRole } from "@prisma/client"; // Import Prisma's generated User type

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
    role: UserRole;
  }): string => {
    const options: jwt.SignOptions = {
      expiresIn: config.jwtExpirationTime as jwt.SignOptions["expiresIn"],
      issuer: config.jwtIssuer,
      algorithm: "HS256",
    };
    const payload = { id: user.id, uuid: user.uuid, email: user.email };
    if (!config.jwtSecret) {
      throw new Error("Secret missing");
    }
    const token = jwt.sign(payload, config.jwtSecret, options);
    return token;
  },
};
