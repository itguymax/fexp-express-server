import { Router } from "express";
import { MatchController } from "../controllers/matches.controller";
import { protect } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Matches
 *     description: Operations for expressing interest in listings
 */

/**
 * @swagger
 * /api/v1/matches:
 *   post:
 *     summary: Create a new match (express interest in a listing)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listingId
 *               - receiverUserId
 *             properties:
 *               listingId:
 *                 type: integer
 *                 example: 1
 *               receiverUserId:
 *                 type: integer
 *                 description: The user ID of the listing owner.
 *                 example: 2
 *               amount:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Matched amount if partial, otherwise null/full listing amount.
 *                 example: 50.00
 *     responses:
 *       '201':
 *         description: Match created successfully
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Listing or user not found
 *       '500':
 *         description: Internal server error
 */
router.post("/", protect, MatchController.createMatch);

/**
 * @swagger
 * /api/v1/matches/{id}/accept:
 *   put:
 *     summary: Accept a pending match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the match to accept
 *         example: 1
 *     responses:
 *       '200':
 *         description: Match accepted successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Not authorized to accept this match
 *       '404':
 *         description: Match not found
 *       '500':
 *         description: Internal server error
 */
router.put("/:id/accept", protect, MatchController.acceptMatch);

export default router;
