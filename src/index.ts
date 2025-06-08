// src/index.ts
import express from "express";
import { config } from "./config";
import { prisma } from "./database/prisma";
import { errorHandler } from "./utils/errorHandler";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";

// Import your route modules
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/users.routes";
import listingsRoutes from "./routes/listings.routes";
import matchesRoutes from "./routes/matches.routes";
import transactionsRoutes from "./routes/transactions.routes";
import { corsOptions, confCors } from "./config/cors";

const app = express();

// Middleware

app.use(confCors(corsOptions));
app.use(helmet());
app.use(express.json()); // Body parser for JSON requests

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "FexP Express API MVP",
      version: "1.0.0",
      description:
        "Minimal Viable Product API for peer-to-peer currency exchange built with Express.js and Prisma.",
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Local development server",
      },
      // Add production server URL here when deployed
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter your JWT token in the format: `Bearer YOUR_TOKEN`",
        },
      },
    },
    // Global security for all routes (can be overridden per route)
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API route files (e.g., auth.routes.ts, users.routes.ts)
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
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
