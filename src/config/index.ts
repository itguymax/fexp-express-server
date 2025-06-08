import dotenv from "dotenv";
dotenv.config();

export const config: {
  port: string | number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpirationTime: number | string | undefined;
  saltRounds: 10; // for bcrypt, more for production,
  jwtIssuer: string | undefined;
} = {
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpirationTime: process.env.JWT_EXPIRATION_TIME,
  saltRounds: 10, // for bcrypt, more for production,
  jwtIssuer: process.env.OWNER,
};

// Basic validation

if (!config.databaseUrl || !config.jwtSecret) {
  console.error("CRITICAL ERROR: Missing essential environment varialbles");
  process.exit(1);
}
