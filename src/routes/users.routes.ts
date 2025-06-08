import { Router } from "express";
import { UserController } from "../controllers/users.controller";
import { protect } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User specific operations
 */

/**
 * @swagger
 * /api/v1/users/{uuid}:
 *   get:
 *     summary: Get user details by UUID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the user to retrieve
 *         example: clxf3z8s70000a0t6d7w8e9r0
 *     responses:
 *       '200':
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 uuid:
 *                   type: string
 *                 email:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                   nullable: true
 *                 lastName:
 *                   type: string
 *                   nullable: true
 *                 country:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                   nullable: true
 *                 kycStatus:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 lastLogin:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: User not found
 */
router.get("/:uuid", protect, UserController.getUserByUuid);

// TODO: Add routes for updating user profile, etc.

export default router;
