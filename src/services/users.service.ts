// src/services/users.service.ts
import { prisma } from "../database/prisma";
import { User } from "@prisma/client"; // Prisma's generated type

export const UserService = {
  create: async (userData: any, passwordHash: string): Promise<User> => {
    return prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: passwordHash,
        name: userData.name,
        countryOfOrigin: userData.countryOfOrigin,
        countryOfResidence: userData.countryOfResidence,
        kycStatus: "PENDING", // Default status on creation
        isStudent: userData.isStudent,
        agreeTerms: userData.agreeTerms,
      },
    });
  },

  findByEmail: async (email: string): Promise<User | null> => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  findById: async (id: number): Promise<User | null> => {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  findByUuid: async (uuid: string): Promise<User | null> => {
    return prisma.user.findUnique({
      where: { uuid },
    });
  },

  updateLastLogin: async (userId: number): Promise<User> => {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  },
  updatePassword: async (
    userId: number,
    newPasswordHash: string
  ): Promise<User> => {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  },
  // TODO: Add more CRUD operations for users (e.g., update profile, delete)
};
