import express from 'express';
import { query, param, body, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get articles
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title or content
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
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
 *         description: Articles retrieved successfully
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('tags').optional().trim()
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
    const tags = req.query.tags as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      where.tags = { hasSome: tagArray };
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          summary: true,
          author: true,
          tags: true,
          createdAt: true
        }
      }),
      prisma.article.count({ where })
    ]);

    res.json({
      success: true,
      data: articles,
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
 * /api/articles/{id}:
 *   get:
 *     summary: Get article by ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article retrieved successfully
 *       404:
 *         description: Article not found
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

    const article = await prisma.article.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        title: true,
        content: true,
        summary: true,
        author: true,
        tags: true,
        createdAt: true
      }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Create new article (Admin only)
 *     tags: [Articles]
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
 *               - content
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               summary:
 *                 type: string
 *               author:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Article created successfully
 *       403:
 *         description: Admin access required
 */
router.post('/', [
  body('title').trim().notEmpty(),
  body('content').trim().notEmpty(),
  body('author').trim().notEmpty(),
  body('summary').optional().trim(),
  body('tags').optional().isArray()
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

    const { title, content, summary, author, tags = [] } = req.body;

    const article = await prisma.article.create({
      data: {
        title,
        content,
        summary,
        author,
        tags
      },
      select: {
        id: true,
        title: true,
        content: true,
        summary: true,
        author: true,
        tags: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      data: article
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/articles/{id}:
 *   patch:
 *     summary: Update article (Admin only)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               summary:
 *                 type: string
 *               author:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       404:
 *         description: Article not found
 *       403:
 *         description: Admin access required
 */
router.patch('/:id', [
  param('id').isString().notEmpty(),
  body('title').optional().trim().notEmpty(),
  body('content').optional().trim().notEmpty(),
  body('summary').optional().trim(),
  body('author').optional().trim().notEmpty(),
  body('tags').optional().isArray()
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
    const { title, content, summary, author, tags } = req.body;

    const article = await prisma.article.findUnique({
      where: { id }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (summary !== undefined) updateData.summary = summary;
    if (author !== undefined) updateData.author = author;
    if (tags !== undefined) updateData.tags = tags;

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        content: true,
        summary: true,
        author: true,
        tags: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: updatedArticle
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     summary: Delete article (Admin only)
 *     tags: [Articles]
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
 *         description: Article deleted successfully
 *       404:
 *         description: Article not found
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

    const article = await prisma.article.findUnique({
      where: { id }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    await prisma.article.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
