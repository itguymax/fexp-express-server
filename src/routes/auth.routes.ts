import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { protect } from "../middleware/auth";
import {
  validateUserLogin,
  validateUserRegistration,
} from "../middleware/validation";
import { loginLimiter } from "../middleware/rateLimit";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User authentication and registration
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - countryOfOrigin
 *               - countryOfResidence
 *               - agreeTerms
 *               - isStudent
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: MySecurePassword123
 *               name:
 *                 type: string
 *                 example: John Doe
 *               countryOfOrigin:
 *                 type: string
 *                 example: Cameroon
 *               countryOfResidence:
 *                 type: string
 *                 example: USA
 *               agreeTerms:
 *                 type: boolean
 *                 example: true
 *               isStudent:
 *                  type: boolean
 *                  example: true
 *
 *     responses:
 *       '201':
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     uuid:
 *                       type: string
 *                       example: clxf3z8s70000a0t6d7w8e9r0
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     countryOfOrigin:
 *                       type: string
 *                       example: Cameroon
 *                     countryOfResidence:
 *                       type: string
 *                       example: USA
 *                     isStudent:
 *                       type: boolean
 *                       example: true
 *                     agreeTerms:
 *                        type: boolean
 *                        example: true
 *                     kycStatus:
 *                       type: string
 *                       example: PENDING
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     lastLogin:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       '400':
 *         description: Invalid input or email already exists
 *       '500':
 *         description: Internal server error
 */
router.post("/register", validateUserRegistration, AuthController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in a user and get a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecurePassword123
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 token_type:
 *                   type: string
 *                   example: bearer
 *       '401':
 *         description: Invalid credentials
 *       '500':
 *         description: Internal server error
 */
router.post("/login", loginLimiter, validateUserLogin, AuthController.login);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 uuid:
 *                   type: string
 *                   example: clxf3z8s70000a0t6d7w8e9r0
 *                 email:
 *                   type: string
 *                   example: user@example.com
 *                 role:
 *                   type: string
 *                   example: USER
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 countryOfOrigin:
 *                   type: string
 *                   example: Cameroon
 *                 countryOfResidence:
 *                    type: string
 *                    example: Russia
 *                 phoneNumber:
 *                   type: string
 *                   example: "+1234567890"
 *                 kycStatus:
 *                   type: string
 *                   example: PENDING
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
 *         description: Not authorized (no token or invalid token)
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
router.get("/profile", protect, AuthController.getProfile);

export default router;
