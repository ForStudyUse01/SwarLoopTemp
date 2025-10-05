import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * @swagger
 * /api/recommendations:
 *   post:
 *     summary: Get music recommendations based on mood
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moodEvent:
 *                 type: object
 *                 properties:
 *                   source:
 *                     type: string
 *                     enum: [SELF_REPORT, TEXT_ANALYSIS, VOICE_ANALYSIS]
 *                   label:
 *                     type: string
 *                   score:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 10
 *                   contextText:
 *                     type: string
 *               moodText:
 *                 type: string
 *               limit:
 *                 type: integer
 *                 default: 10
 *     responses:
 *       200:
 *         description: Recommendations generated successfully
 */
router.post('/', [
  body('moodEvent').optional().isObject(),
  body('moodText').optional().isString(),
  body('limit').optional().isInt({ min: 1, max: 50 })
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

    const { moodEvent, moodText, limit = 10 } = req.body;
    const userId = req.user!.id;

    let finalMoodEvent;

    // If moodEvent is provided, use it directly
    if (moodEvent) {
      finalMoodEvent = moodEvent;
    } else if (moodText) {
      // If only moodText is provided, we'll need to call the ML service
      // For now, we'll create a basic mood event
      finalMoodEvent = {
        source: 'TEXT_ANALYSIS',
        label: 'neutral',
        score: 5,
        contextText: moodText
      };
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either moodEvent or moodText is required'
      });
    }

    // Store mood event
    const storedMoodEvent = await prisma.moodEvent.create({
      data: {
        userId,
        source: finalMoodEvent.source,
        label: finalMoodEvent.label,
        score: finalMoodEvent.score,
        contextText: finalMoodEvent.contextText,
        confidence: finalMoodEvent.confidence
      }
    });

    // Get recommendations based on mood
    const recommendations = await getRecommendationsByMood(finalMoodEvent, limit);

    // Store recommendation log
    const recommendation = await prisma.recommendation.create({
      data: {
        userId,
        modelVersion: '1.0.0',
        reason: `Based on ${finalMoodEvent.label} mood (score: ${finalMoodEvent.score})`,
        tracks: {
          create: recommendations.map((rec, index) => ({
            musicId: rec.id,
            score: rec.score,
            reason: rec.reason
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
                moodTags: true,
                audioFeatures: true
              }
            }
          }
        }
      }
    });

    logger.info(`Generated ${recommendations.length} recommendations for user ${userId}`);

    res.json({
      success: true,
      data: {
        moodEvent: storedMoodEvent,
        recommendations: recommendation.tracks.map(track => ({
          ...track.music,
          score: track.score,
          reason: track.reason
        })),
        modelVersion: recommendation.modelVersion,
        reason: recommendation.reason
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/recommendations/history:
 *   get:
 *     summary: Get recommendation history
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Recommendation history retrieved successfully
 */
router.get('/history', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
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

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [recommendations, total] = await Promise.all([
      prisma.recommendation.findMany({
        where: { userId: req.user!.id },
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
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit
      }),
      prisma.recommendation.count({
        where: { userId: req.user!.id }
      })
    ]);

    res.json({
      success: true,
      data: recommendations,
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

// Helper function to get recommendations based on mood
async function getRecommendationsByMood(moodEvent: any, limit: number) {
  const { label, score } = moodEvent;
  
  // Define mood-to-music mapping
  const moodMappings: { [key: string]: { moodTags: string[], audioFeatures?: any } } = {
    'happy': { moodTags: ['happy', 'uplifting', 'energetic'] },
    'sad': { moodTags: ['melancholic', 'calm', 'introspective'] },
    'angry': { moodTags: ['calm', 'peaceful', 'meditative'] },
    'anxious': { moodTags: ['calm', 'peaceful', 'meditative', 'ambient'] },
    'stressed': { moodTags: ['calm', 'peaceful', 'meditative', 'ambient'] },
    'excited': { moodTags: ['energetic', 'uplifting', 'happy'] },
    'calm': { moodTags: ['calm', 'peaceful', 'ambient'] },
    'energetic': { moodTags: ['energetic', 'uplifting', 'happy'] },
    'melancholic': { moodTags: ['melancholic', 'introspective', 'calm'] },
    'neutral': { moodTags: ['neutral', 'balanced'] }
  };

  const moodConfig = moodMappings[label.toLowerCase()] || moodMappings['neutral'];
  
  // Build where clause for music search
  const where: any = {
    isActive: true,
    moodTags: {
      hasSome: moodConfig.moodTags
    }
  };

  // Add audio features filter if available
  if (moodConfig.audioFeatures) {
    where.audioFeatures = moodConfig.audioFeatures;
  }

  // Get music that matches the mood
  const music = await prisma.music.findMany({
    where,
    select: {
      id: true,
      title: true,
      artist: true,
      album: true,
      duration: true,
      audioUrl: true,
      genreTags: true,
      moodTags: true,
      audioFeatures: true
    },
    take: limit * 2 // Get more than needed for better variety
  });

  // Score and rank the music
  const scoredMusic = music.map(track => {
    let score = 0.5; // Base score
    
    // Increase score based on mood tag matches
    const matchingMoodTags = track.moodTags.filter(tag => 
      moodConfig.moodTags.includes(tag)
    );
    score += matchingMoodTags.length * 0.2;
    
    // Adjust score based on mood intensity
    if (score > 5) {
      score += (score - 5) * 0.1; // Higher intensity = slightly higher score
    } else {
      score += (5 - score) * 0.1; // Lower intensity = slightly higher score for calm music
    }
    
    // Normalize score to 0-1 range
    score = Math.min(1, Math.max(0, score));
    
    return {
      ...track,
      score,
      reason: `Matches ${matchingMoodTags.join(', ')} mood tags for ${label} mood`
    };
  });

  // Sort by score and return top results
  return scoredMusic
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export default router;
