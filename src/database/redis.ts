import { Redis } from "ioredis";
import { config } from "../config";

const redis = new Redis(config.redisUrl);

redis.on("connect", () => {
  console.log("Connected to Redis successfully!");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
  // Optional: Add logic to handle Redis connection loss, e.g., graceful shutdown or retry
});

export { redis };
