import { Router } from "express";
import { MatchController } from "../controllers/matches.controller";
import { protect } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: API for managing user exchange matches
 */

/**
 * @swagger
 * /api/v1/matches:
 *   post:
 *     summary: Propose a new match between two listings
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - initiatorListingId
 *               - matchedListingId
 *             properties:
 *               initiatorListingId:
 *                 type: integer
 *                 description: The ID of the authenticated user's listing initiating the match.
 *                 example: 1
 *               matchedListingId:
 *                 type: integer
 *                 description: The ID of the other user's listing to match with.
 *                 example: 5
 *     responses:
 *       201:
 *         description: Match proposal created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       400:
 *         description: Invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Listing not found
 *       409:
 *         description: Conflict
 */
router.post("/", protect, MatchController.proposeMatch);

/**
 * @swagger
 * /api/v1/matches:
 *   get:
 *     summary: Get all matches for the authenticated user
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, COMPLETED, CANCELLED, REJECTED, DISPUTED]
 *         description: Filter matches by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of matches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", protect, MatchController.getMyMatches);

/**
 * @swagger
 * /api/v1/matches/{uuid}:
 *   get:
 *     summary: Get a specific match by UUID
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the match
 *     responses:
 *       200:
 *         description: Match details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
// router.get("/:uuid", protect, MatchController.getMatchByUuid);

/**
 * @swagger
 * /api/v1/matches/{uuid}/accept:
 *   put:
 *     summary: Accept a pending match
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Match UUID
 *     responses:
 *       200:
 *         description: Match accepted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       400:
 *         description: Invalid state
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       409:
 *         description: Conflict
 */
router.put("/:uuid/accept", protect, MatchController.acceptMatch);

/**
 * @swagger
 * /api/v1/matches/{uuid}/reject:
 *   put:
 *     summary: Reject a pending match
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Match UUID
 *     responses:
 *       200:
 *         description: Match rejected
 *       400:
 *         description: Invalid state
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put("/:uuid/reject", protect, MatchController.rejectMatch);

/**
 * @swagger
 * /api/v1/matches/{uuid}/cancel:
 *   put:
 *     summary: Cancel a match
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Match UUID
 *     responses:
 *       200:
 *         description: Match cancelled
 *       400:
 *         description: Invalid state
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put("/:uuid/cancel", protect, MatchController.cancelMatch);

/**
 * @swagger
 * /api/v1/matches/{uuid}/confirm-completion:
 *   put:
 *     summary: Confirm match completion
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Match UUID
 *     responses:
 *       200:
 *         description: Completion confirmed
 *       400:
 *         description: Invalid state
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put(
  "/:uuid/confirm-completion",
  protect,
  MatchController.confirmCompletion
);

/**
 * @swagger
 * /api/v1/matches/{uuid}/dispute:
 *   put:
 *     summary: Dispute a match
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Match UUID
 *     responses:
 *       200:
 *         description: Match disputed
 *       400:
 *         description: Invalid state
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
// router.put("/:uuid/dispute", protect, MatchController.disputeMatch);

/**
 * @swagger
 * /api/v1/matches/{uuid}/admin-update-status:
 *   put:
 *     summary: (Admin) Update match status
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Match UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, ACCEPTED, COMPLETED, CANCELLED, REJECTED, DISPUTED]
 *                 example: COMPLETED
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Match not found
 */
// router.put(
//   "/:uuid/admin-update-status",
//   protect,
//   MatchController.adminUpdateMatchStatus
// );

export default router;
