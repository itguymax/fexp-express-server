import swaggerJsdoc from "swagger-jsdoc";
import { config } from "./index";
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

export const swaggerDocs = swaggerJsdoc(swaggerOptions);
