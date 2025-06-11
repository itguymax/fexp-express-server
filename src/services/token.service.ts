import { redis } from "../database/redis";

export const TokenService = {
  /**
   * Adds a JWT to the blacklist in Redis.
   * The token will expire from the blacklist at its original JWT expiration time.
   * @param token The JWT to blacklist.
   * @param expiresIn The time in seconds until the token expires.
   */
  blacklistToken: async (token: string, expiresIn: number): Promise<void> => {
    // Store the token in Redis with its expiration time
    // 'EX' sets an expiration time in seconds
    await redis.set(`blacklist:${token}`, "true", "EX", expiresIn);
  },

  /**
   * Checks if a JWT is present in the blacklist.
   * @param token The JWT to check.
   * @returns True if the token is blacklisted, false otherwise.
   */
  isTokenBlacklisted: async (token: string): Promise<boolean> => {
    const blacklisted = await redis.get(`blacklist:${token}`);
    return blacklisted === "true";
  },
};
