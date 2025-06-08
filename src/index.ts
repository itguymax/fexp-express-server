// src/index.ts
import express from "express";
import { config } from "./config";
import { prisma } from "./database/prisma";
import { errorHandler } from "./utils/errorHandler";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";

// Import your route modules
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/users.routes";
import listingsRoutes from "./routes/listings.routes";
import matchesRoutes from "./routes/matches.routes";
import transactionsRoutes from "./routes/transactions.routes";
import { corsOptions, confCors } from "./config/cors";
import { swaggerDocs } from "./config/swagger";
import { apiLimiter } from "./middleware/rateLimit";

const app = express();

// Middleware

app.use(confCors(corsOptions));
app.use(helmet());
app.use(express.json()); // Body parser for JSON requests

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("api/v1", apiLimiter); // General API rate limit to non-auth routes (optional but good for DDoS)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/listings", listingsRoutes);
app.use("/api/v1/matches", matchesRoutes);
app.use("/api/v1/transactions", transactionsRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.send("FexP Express API is running!");
});

// Global error handling middleware (should be last middleware)
app.use(errorHandler);

// Start the server
const startServer = async () => {
  try {
    await prisma.$connect(); // Connect to the database
    console.log("Connected to the database successfully!");
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(
        `API Docs available at http://localhost:${config.port}/api-docs`
      );
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit process if database connection fails
  } finally {
    // Ensure that prisma.$disconnect() is called when the application shuts down
    process.on("beforeExit", async () => {
      await prisma.$disconnect();
      console.log("Disconnected from the database.");
    });
  }
};

startServer();
