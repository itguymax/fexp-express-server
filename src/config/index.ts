import dotenv from "dotenv";
dotenv.config();

export const config: {
  port: string | number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpirationTime: string;
  saltRounds: 10; // for bcrypt, more for production,
  jwtIssuer: string | undefined;
  redisUrl: string;
  resetTokenExpiration: string;
  frontendUrl: string;
} = (() => {
  // Basic validation

  if (
    !process.env.DATABASE_URL ||
    !process.env.JWT_SECRET ||
    !process.env.REDIS_URL ||
    !process.env.JWT_EXPIRATION_TIME ||
    !process.env.FRONTEND_URL ||
    !process.env.RESET_TOKEN_EXPIRATION
  ) {
    console.error("CRITICAL ERROR: Missing essential environment varialbles");
    process.exit(1);
  }

  return {
    port: process.env.PORT || 5000,
    databaseUrl: process.env.DATABASE_URL!,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpirationTime: process.env.JWT_EXPIRATION_TIME ?? "1h",
    saltRounds: 10, // for bcrypt, more for production,
    jwtIssuer: process.env.OWNER,
    redisUrl: process.env.REDIS_URL,
    resetTokenExpiration: process.env.RESET_TOKEN_EXPIRATION,
    frontendUrl: process.env.FRONTEND_URL,
  };
})();
