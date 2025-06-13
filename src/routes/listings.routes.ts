import { Router } from "express";
import { ListingController } from "../controllers/listings.controller";
import { protect } from "../middleware/auth";
import { validateListingCreation } from "../middleware/validation";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Listings
 *     description: Exchange listings operations
 */

/**
 * @swagger
 * /api/v1/listings:
 *   post:
 *     summary: Create a new exchange listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currencyFrom
 *               - currencyTo
 *               - amountFrom
 *               - amountTo
 *               - exchangeRate
 *               - type
 *               - paymentMethod
 *             properties:
 *               currencyFrom:
 *                 type: string
 *                 example: USD
 *               currencyTo:
 *                 type: string
 *                 example: EUR
 *               amountFrom:
 *                 type: number
 *                 format: float
 *                 example: 100.0
 *               amountTo:
 *                 type: number
 *                 format: float
 *                 example: 92.5
 *               exchangeRate:
 *                 type: number
 *                 format: float
 *                 example: 0.925
 *               type:
 *                 type: string
 *                 enum: [BUY, SELL]
 *                 example: SELL
 *               paymentMethod:
 *                 type: string
 *                 example: Bank Transfer
 *               location:
 *                 type: string
 *                 nullable: true
 *                 example: Paris
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: Urgent exchange needed
 *     responses:
 *       '201':
 *         description: Listing created successfully
 *       '400':
 *         description: Invalid input
 *       '401':
 *         description: Unauthorized
 */
router.post(
  "/",
  protect,
  validateListingCreation,
  ListingController.createListing
);

/**
 * @swagger
 * /api/v1/listings:
 *   get:
 *     summary: Get all active exchange listings
 *     tags: [Listings]
 *     responses:
 *       '200':
 *         description: A list of active exchange listings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   uuid:
 *                     type: string
 *                   userId:
 *                     type: integer
 *                   currencyFrom:
 *                     type: string
 *                   currencyTo:
 *                     type: string
 *                   amountFrom:
 *                     type: number
 *                     format: float
 *                   amountTo:
 *                     type: number
 *                     format: float
 *                   exchangeRate:
 *                     type: number
 *                     format: float
 *                   type:
 *                     type: string
 *                     enum: [BUY, SELL]
 *                   status:
 *                     type: string
 *                     enum: [ACTIVE, FULFILLED, CANCELED]
 *                   paymentMethod:
 *                     type: string
 *                   location:
 *                     type: string
 *                     nullable: true
 *                   description:
 *                     type: string
 *                     nullable: true
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   user:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       uuid:
 *                         type: string
 *                       email:
 *                         type: string
 *                       country:
 *                         type: string
 *       '500':
 *         description: Internal server error
 */
router.get("/", protect, ListingController.getMatchingListings);

/**
 * @swagger
 * /api/v1/listings/{id}:
 *   get:
 *     summary: Get a single exchange listing by ID
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the listing to retrieve
 *     responses:
 *       '200':
 *         description: A single exchange listing
 *       '404':
 *         description: Listing not found
 *       '500':
 *         description: Internal server error
 */
router.get("/:uuid", protect, ListingController.getListingByUuid);

export default router;
