import express from 'express';
import { query, param, body, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /api/music:
 *   get:
 *     summary: Get music library with search and filters
 *     tags: [Music]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title, artist, or album
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: mood
 *         schema:
 *           type: string
 *         description: Filter by mood tag
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
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Music library retrieved successfully
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('genre').optional().trim(),
  query('mood').optional().trim()
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
    const search = req.query.search as string;
    const genre = req.query.genre as string;
    const mood = req.query.mood as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { contains: search, mode: 'insensitive' } },
        { album: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (genre) {
      where.genreTags = { has: genre };
    }

    if (mood) {
      where.moodTags = { has: mood };
    }

    const [music, total] = await Promise.all([
      prisma.music.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          artist: true,
          album: true,
          duration: true,
          audioUrl: true,
          genreTags: true,
          moodTags: true,
          audioFeatures: true,
          language: true,
          createdAt: true
        }
      }),
      prisma.music.count({ where })
    ]);

    res.json({
      success: true,
      data: music,
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
 * /api/music/{id}:
 *   get:
 *     summary: Get music by ID
 *     tags: [Music]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Music retrieved successfully
 *       404:
 *         description: Music not found
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

    const music = await prisma.music.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        title: true,
        artist: true,
        album: true,
        duration: true,
        audioUrl: true,
        genreTags: true,
        moodTags: true,
        audioFeatures: true,
        language: true,
        createdAt: true
      }
    });

    if (!music) {
      return res.status(404).json({
        success: false,
        error: 'Music not found'
      });
    }

    res.json({
      success: true,
      data: music
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/music:
 *   post:
 *     summary: Add new music (Admin only)
 *     tags: [Music]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - artist
 *               - duration
 *               - audioUrl
 *               - genreTags
 *               - moodTags
 *             properties:
 *               title:
 *                 type: string
 *               artist:
 *                 type: string
 *               album:
 *                 type: string
 *               duration:
 *                 type: integer
 *               audioUrl:
 *                 type: string
 *               genreTags:
 *                 type: array
 *                 items:
 *                   type: string
 *               moodTags:
 *                 type: array
 *                 items:
 *                   type: string
 *               audioFeatures:
 *                 type: object
 *               language:
 *                 type: string
 *     responses:
 *       201:
 *         description: Music created successfully
 *       403:
 *         description: Admin access required
 */
router.post('/', [
  body('title').trim().notEmpty(),
  body('artist').trim().notEmpty(),
  body('duration').isInt({ min: 1 }),
  body('audioUrl').isURL(),
  body('genreTags').isArray(),
  body('moodTags').isArray(),
  body('album').optional().trim(),
  body('audioFeatures').optional().isObject(),
  body('language').optional().trim()
], authenticate, authorize('ADMIN'), async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      title,
      artist,
      album,
      duration,
      audioUrl,
      genreTags,
      moodTags,
      audioFeatures,
      language
    } = req.body;

    const music = await prisma.music.create({
      data: {
        title,
        artist,
        album,
        duration,
        audioUrl,
        genreTags,
        moodTags,
        audioFeatures,
        language,
        uploadedBy: req.user!.id
      },
      select: {
        id: true,
        title: true,
        artist: true,
        album: true,
        duration: true,
        audioUrl: true,
        genreTags: true,
        moodTags: true,
        audioFeatures: true,
        language: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      data: music
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/music/{id}:
 *   delete:
 *     summary: Delete music (Admin only)
 *     tags: [Music]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Music deleted successfully
 *       404:
 *         description: Music not found
 *       403:
 *         description: Admin access required
 */
router.delete('/:id', [
  param('id').isString().notEmpty()
], authenticate, authorize('ADMIN'), async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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

    const music = await prisma.music.findUnique({
      where: { id }
    });

    if (!music) {
      return res.status(404).json({
        success: false,
        error: 'Music not found'
      });
    }

    await prisma.music.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Music deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
