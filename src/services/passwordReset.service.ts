// src/services/passwordReset.service.ts
import { prisma } from "../database/prisma";
import { ApiError } from "../utils/errorHandler";
import { v4 as uuidv4 } from "uuid"; // For generating unique tokens
import bcrypt from "bcryptjs";
import { config } from "../config";
import { PasswordResetToken } from "@prisma/client"; // Import Prisma model type

export const PasswordResetService = {
  /**
   * Generates, hashes, and stores a password reset token for a user.
   * @param userId The ID of the user requesting the reset.
   * @returns The plain-text token (to be sent in email).
   */
  createResetToken: async (userId: number): Promise<string> => {
    // Invalidate any existing active tokens for this user first
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: userId,
        used: false,
        expiresAt: { gt: new Date() }, // Only invalidate future-dated tokens
      },
      data: { used: true }, // Mark as used/invalidated
    });

    const plainToken = uuidv4();
    const hashedToken = await bcrypt.hash(plainToken, config.saltRounds); // Hash the token before storing

    const expiresAt = new Date();
    // Parse expiration time from string (e.g., '30m', '1h')
    const expirationDurationMs = parseDuration(config.resetTokenExpiration);
    expiresAt.setTime(expiresAt.getTime() + expirationDurationMs);

    await prisma.passwordResetToken.create({
      data: {
        userId: userId,
        token: hashedToken, // Store the hashed token
        expiresAt: expiresAt,
      },
    });

    return plainToken; // Return the plain token to be sent to the user
  },

  /**
   * Validates a password reset token and marks it as used.
   * @param plainToken The plain-text token received from the user.
   * @returns The user's ID if the token is valid, null otherwise.
   */
  validateAndUseResetToken: async (
    plainToken: string
  ): Promise<number | null> => {
    // Get all active tokens for comparison (safer than direct findUnique on hashed token)
    const activeTokens = await prisma.passwordResetToken.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" }, // Latest token first
    });

    let validTokenRecord: PasswordResetToken | null = null;
    for (const tokenRecord of activeTokens) {
      if (await bcrypt.compare(plainToken, tokenRecord.token)) {
        validTokenRecord = tokenRecord;
        break;
      }
    }

    if (!validTokenRecord) {
      return null; // Token not found or invalid hash
    }

    // Mark the token as used
    await prisma.passwordResetToken.update({
      where: { id: validTokenRecord.id },
      data: { used: true },
    });

    return validTokenRecord.userId;
  },
};

// Helper function to parse duration string (e.g., '30m', '1h')
function parseDuration(duration: string): number {
  const value = parseInt(duration.slice(0, -1));
  const unit = duration.slice(-1);

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return 3600 * 1000; // Default to 1 hour if invalid unit
  }
}
