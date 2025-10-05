import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Track user events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [PLAY, PAUSE, SKIP, LIKE, DISLIKE, MOOD_SUBMIT, PLAYLIST_CREATE, PLAYLIST_UPDATE, PLAYLIST_DELETE]
 *               data:
 *                 type: object
 *                 description: Additional event data
 *     responses:
 *       200:
 *         description: Event tracked successfully
 */
router.post('/', [
  body('type').isIn(['PLAY', 'PAUSE', 'SKIP', 'LIKE', 'DISLIKE', 'MOOD_SUBMIT', 'PLAYLIST_CREATE', 'PLAYLIST_UPDATE', 'PLAYLIST_DELETE']),
  body('data').optional().isObject()
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

    const { type, data } = req.body;
    const userId = req.user!.id;

    const event = await prisma.event.create({
      data: {
        userId,
        type,
        data
      }
    });

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
});

export default router;
