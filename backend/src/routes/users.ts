import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 */
router.get('/me', authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        preferences: true,
        consentFlags: true,
        createdAt: true,
        lastLogin: true
      }
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *               preferences:
 *                 type: object
 *               consentFlags:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch('/me', [
  body('displayName').optional().trim().isLength({ min: 1 }),
  body('avatarUrl').optional().isURL(),
  body('preferences').optional().isObject(),
  body('consentFlags').optional().isObject()
], authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { displayName, avatarUrl, preferences, consentFlags } = req.body;
    const updateData: any = {};

    if (displayName !== undefined) updateData.displayName = displayName;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (preferences !== undefined) updateData.preferences = preferences;
    if (consentFlags !== undefined) updateData.consentFlags = consentFlags;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        preferences: true,
        consentFlags: true,
        createdAt: true,
        lastLogin: true
      }
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

export default router;
