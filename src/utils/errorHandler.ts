import { Request, Response, NextFunction } from "express";

// Custom Error Class (useful for consistent error handling)
export class ApiError extends Error {
  statusCode: number;
  errors?: Array<object>; // Optional: for validation errors

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: Array<object>
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    // Capture the stack trace, excluding the constructor call from the trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error for debugging purposes (in development)
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  // Handle specific types of errors if necessary (e.g., database errors)
  if (err.name === "PrismaClientKnownRequestError") {
    // Example: Unique constraint violation
    if (err.code === "P2002") {
      statusCode = 409; // Conflict
      message = `Duplicate field: ${err.meta?.target || "unknown"}`;
    }
    // Add more Prisma error codes as needed
  }

  // Send the error response
  res.status(statusCode).json({
    success: false,
    message: message,
    errors: errors,
    // Include stack trace only in development environment
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
};
