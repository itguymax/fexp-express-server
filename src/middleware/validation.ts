// src/middleware/validation.ts
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errorHandler";

// Generic middleware to check validation results
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return a 400 Bad Request with validation errors
    return next(new ApiError("Validation failed", 400, errors.array()));
  }
  next();
};

// User registration validation
export const validateUserRegistration = [
  body("email").isEmail().withMessage("Please enter a valid email address"),
  body("password").isLength({ min: 6 }).withMessage("Password is short"),
  body("countryOfOrigin").notEmpty().withMessage("Field is required"),
  body("countryOfResidence").notEmpty().withMessage("Field is required"),
  body("name").isString().withMessage("Field is required"),
  body("isStudent").isBoolean().withMessage("Field required"),
  body("agreeTerms").isBoolean().withMessage("Field required"),

  handleValidationErrors, // Apply the generic error handler
];

// User login validation
export const validateUserLogin = [
  body("email").isEmail().withMessage("Please enter a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Listing creation validation (example - expand as needed)
export const validateListingCreation = [
  body("currencyFrom")
    .notEmpty()
    .withMessage("Source currency is required")
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be 3 characters"),
  body("currencyTo")
    .notEmpty()
    .withMessage("Target currency is required")
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be 3 characters"),
  body("amountFrom")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),
  body("amountTo")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),
  body("type").isIn(["BUY", "SELL"]).withMessage("Type must be BUY or SELL"),
  body("paymentMethod").notEmpty().withMessage("Payment method is required"),
  handleValidationErrors,
];
