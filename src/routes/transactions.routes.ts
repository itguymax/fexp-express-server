import { Router } from "express";
import { TransactionController } from "../controllers/transactions.controller";
import { protect } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Transactions
 *     description: Operations for managing successful exchanges
 */

/**
 * @swagger
 * /api/v1/transactions:
 *   post:
 *     summary: Initiate a new transaction from an accepted match
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matchId
 *               - amount
 *               - currency
 *             properties:
 *               matchId:
 *                 type: integer
 *                 description: The ID of the accepted match this transaction is based on.
 *                 example: 1
 *               amount:
 *                 type: number
 *                 format: float
 *                 example: 100.00
 *               currency:
 *                 type: string
 *                 example: "USD"
 *     responses:
 *       '201':
 *         description: Transaction initiated successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Not authorized to initiate this transaction
 *       '404':
 *         description: Match not found
 *       '500':
 *         description: Internal server error
 */
router.post("/", protect, TransactionController.initiateTransaction);

/**
 * @swagger
 * /api/v1/transactions/{id}/mark-sent:
 *   put:
 *     summary: Mark a transaction as funds sent by the sender
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the transaction
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proofOfPayment:
 *                 type: string
 *                 nullable: true
 *                 description: Optional URL to proof of payment (e.g., image, screenshot).
 *                 example: "https://example.com/proofs/proof123.jpg"
 *     responses:
 *       '200':
 *         description: Transaction marked as sent
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Not authorized (only sender can mark as sent)
 *       '404':
 *         description: Transaction not found
 *       '500':
 *         description: Internal server error
 */
router.put("/:id/mark-sent", protect, TransactionController.markSent);

/**
 * @swagger
 * /api/v1/transactions/{id}/mark-received:
 *   put:
 *     summary: Mark a transaction as funds received by the receiver
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the transaction
 *         example: 1
 *     responses:
 *       '200':
 *         description: Transaction marked as received
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Not authorized (only receiver can mark as received)
 *       '404':
 *         description: Transaction not found
 *       '500':
 *         description: Internal server error
 */
router.put("/:id/mark-received", protect, TransactionController.markReceived);

export default router;
