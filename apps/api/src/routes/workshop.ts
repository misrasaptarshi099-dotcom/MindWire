import { Router, Request, Response, NextFunction } from 'express';
import { Workshop } from '../models/Workshop.js';
import { getRedisClient } from '../config/redis.js';
import { AppError } from '../utils/errors.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const router = Router();

// Helper to seed default workshop data
const seedDefaultWorkshop = async () => {
  logger.info('Ensuring default workshop data exists in MongoDB...');
  return await Workshop.findOneAndUpdate(
    { workshopId: 'AI_ROBOTICS_SUMMER_2026' },
    {
      $setOnInsert: {
        title: 'MindWire AI & Robotics Summer Workshop',
        subtitle: 'Build. Code. Deploy. Empowering young minds aged 8-14 with hands-on artificial intelligence and robotics.',
        ageGroup: { min: 8, max: 14 },
        durationWeeks: 4,
        mode: 'hybrid',
        feeINR: 2999,
        startDate: new Date('2026-07-01T09:00:00.000Z'),
        endDate: new Date('2026-07-28T17:00:00.000Z'),
        seatsTotal: 50,
        seatsAvailable: 42,
        status: 'active',
        batches: [
          {
            batchId: 'BATCH_01',
            name: 'Morning Tech Pioneers (09:00 AM - 12:00 PM)',
            seats: 25,
            enrolled: 5,
          },
          {
            batchId: 'BATCH_02',
            name: 'Afternoon Code Crafters (02:00 PM - 05:00 PM)',
            seats: 25,
            enrolled: 3,
          },
        ],
      }
    },
    { upsert: true, new: true }
  );
};

// @route   POST /api/workshop/seed
// @desc    Seed the database with default workshop data
// @access  Public
router.post('/seed', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const workshop = await seedDefaultWorkshop();
    res.status(200).json({
      success: true,
      message: 'Seeding complete.',
      data: workshop,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/workshop/info
// @desc    Get workshop details (Cached)
// @access  Public
router.get('/info', async (_req: Request, res: Response, next: NextFunction) => {
  const redis = getRedisClient();
  const cacheKey = 'workshop:info';

  try {
    // Check Redis Cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedData),
      });
    }

    // Query MongoDB
    let workshop = await Workshop.findOne({ workshopId: 'AI_ROBOTICS_SUMMER_2026' });
    if (!workshop) {
      workshop = await seedDefaultWorkshop();
    }

    // Store in cache
    await redis.set(cacheKey, JSON.stringify(workshop), 'EX', 3600); // 1 hour TTL

    res.status(200).json({
      success: true,
      data: workshop,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/workshop/seats
// @desc    Get available seats (Cached, shorter TTL)
// @access  Public
router.get('/seats', async (_req: Request, res: Response, next: NextFunction) => {
  const redis = getRedisClient();
  const cacheKey = 'workshop:seats';

  try {
    const cachedSeats = await redis.get(cacheKey);
    if (cachedSeats) {
      return res.status(200).json({
        success: true,
        data: {
          seatsAvailable: Number(cachedSeats),
        },
      });
    }

    let workshop = await Workshop.findOne({ workshopId: 'AI_ROBOTICS_SUMMER_2026' });
    if (!workshop) {
      workshop = await seedDefaultWorkshop();
    }

    await redis.set(cacheKey, String(workshop.seatsAvailable), 'EX', 60); // 60 seconds TTL

    res.status(200).json({
      success: true,
      data: {
        seatsAvailable: workshop.seatsAvailable,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
