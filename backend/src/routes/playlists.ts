import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /api/playlists:
 *   get:
 *     summary: Get user's playlists
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Playlists retrieved successfully
 */
router.get('/', authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where: { ownerId: req.user!.id },
      include: {
        tracks: {
          include: {
            music: {
              select: {
                id: true,
                title: true,
                artist: true,
                album: true,
                duration: true,
                audioUrl: true,
                genreTags: true,
                moodTags: true
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: playlists
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/playlists/{id}:
 *   get:
 *     summary: Get playlist by ID
 *     tags: [Playlists]
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
 *         description: Playlist retrieved successfully
 *       404:
 *         description: Playlist not found
 */
router.get('/:id', [
  param('id').isString().notEmpty()
], authenticate, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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

    const playlist = await prisma.playlist.findFirst({
      where: {
        id,
        OR: [
          { ownerId: req.user!.id },
          { isPublic: true }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true
          }
        },
        tracks: {
          include: {
            music: {
              select: {
                id: true,
                title: true,
                artist: true,
                album: true,
                duration: true,
                audioUrl: true,
                genreTags: true,
                moodTags: true
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    res.json({
      success: true,
      data: playlist
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/playlists:
 *   post:
 *     summary: Create new playlist
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *               trackIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Playlist created successfully
 */
router.post('/', [
  body('name').trim().notEmpty(),
  body('description').optional().trim(),
  body('isPublic').optional().isBoolean(),
  body('trackIds').optional().isArray()
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

    const { name, description, isPublic = false, trackIds = [] } = req.body;

    // Verify all track IDs exist
    if (trackIds.length > 0) {
      const existingTracks = await prisma.music.findMany({
        where: {
          id: { in: trackIds },
          isActive: true
        },
        select: { id: true }
      });

      if (existingTracks.length !== trackIds.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more tracks not found'
        });
      }
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        isPublic,
        ownerId: req.user!.id,
        tracks: {
          create: trackIds.map((trackId: string, index: number) => ({
            musicId: trackId,
            order: index
          }))
        }
      },
      include: {
        tracks: {
          include: {
            music: {
              select: {
                id: true,
                title: true,
                artist: true,
                album: true,
                duration: true,
                audioUrl: true,
                genreTags: true,
                moodTags: true
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: playlist
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/playlists/{id}:
 *   patch:
 *     summary: Update playlist
 *     tags: [Playlists]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *               trackIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Playlist updated successfully
 *       404:
 *         description: Playlist not found
 */
router.patch('/:id', [
  param('id').isString().notEmpty(),
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('isPublic').optional().isBoolean(),
  body('trackIds').optional().isArray()
], authenticate, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    const { name, description, isPublic, trackIds } = req.body;

    // Check if playlist exists and user owns it
    const existingPlaylist = await prisma.playlist.findFirst({
      where: {
        id,
        ownerId: req.user!.id
      }
    });

    if (!existingPlaylist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    // Verify all track IDs exist if provided
    if (trackIds && trackIds.length > 0) {
      const existingTracks = await prisma.music.findMany({
        where: {
          id: { in: trackIds },
          isActive: true
        },
        select: { id: true }
      });

      if (existingTracks.length !== trackIds.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more tracks not found'
        });
      }
    }

    // Update playlist
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const playlist = await prisma.playlist.update({
      where: { id },
      data: updateData,
      include: {
        tracks: {
          include: {
            music: {
              select: {
                id: true,
                title: true,
                artist: true,
                album: true,
                duration: true,
                audioUrl: true,
                genreTags: true,
                moodTags: true
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    // Update tracks if provided
    if (trackIds !== undefined) {
      // Delete existing tracks
      await prisma.playlistTrack.deleteMany({
        where: { playlistId: id }
      });

      // Add new tracks
      if (trackIds.length > 0) {
        await prisma.playlistTrack.createMany({
          data: trackIds.map((trackId: string, index: number) => ({
            playlistId: id,
            musicId: trackId,
            order: index
          }))
        });
      }
    }

    res.json({
      success: true,
      data: playlist
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/playlists/{id}:
 *   delete:
 *     summary: Delete playlist
 *     tags: [Playlists]
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
 *         description: Playlist deleted successfully
 *       404:
 *         description: Playlist not found
 */
router.delete('/:id', [
  param('id').isString().notEmpty()
], authenticate, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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

    const playlist = await prisma.playlist.findFirst({
      where: {
        id,
        ownerId: req.user!.id
      }
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    await prisma.playlist.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Playlist deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
