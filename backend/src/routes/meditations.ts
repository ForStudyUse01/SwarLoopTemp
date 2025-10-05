import express from 'express';
import { query, param, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /api/meditations:
 *   get:
 *     summary: Get meditation sessions
 *     tags: [Meditations]
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: duration
 *         schema:
 *           type: integer
 *         description: Filter by duration in seconds
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Meditation sessions retrieved successfully
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  query('duration').optional().isInt({ min: 1 })
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const difficulty = req.query.difficulty as string;
    const duration = req.query.duration ? parseInt(req.query.duration as string) : undefined;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { isActive: true };

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (duration) {
      // Allow some tolerance for duration filtering (±30 seconds)
      where.duration = {
        gte: duration - 30,
        lte: duration + 30
      };
    }

    const [meditations, total] = await Promise.all([
      prisma.meditation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          duration: true,
          audioUrl: true,
          difficulty: true,
          createdAt: true
        }
      }),
      prisma.meditation.count({ where })
    ]);

    res.json({
      success: true,
      data: meditations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/meditations/{id}:
 *   get:
 *     summary: Get meditation session by ID
 *     tags: [Meditations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meditation session retrieved successfully
 *       404:
 *         description: Meditation session not found
 */
router.get('/:id', [
  param('id').isString().notEmpty()
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;

    const meditation = await prisma.meditation.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        title: true,
        duration: true,
        audioUrl: true,
        difficulty: true,
        createdAt: true
      }
    });

    if (!meditation) {
      return res.status(404).json({
        success: false,
        error: 'Meditation session not found'
      });
    }

    res.json({
      success: true,
      data: meditation
    });
  } catch (error) {
    next(error);
  }
});

export default router;
