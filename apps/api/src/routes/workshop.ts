import { Router, Request, Response, NextFunction } from 'express';
import { Workshop } from '../models/Workshop.js';
import { Enquiry } from '../models/Enquiry.js';
import { getRedisClient } from '../config/redis.js';
import { AppError } from '../utils/errors.js';
import { protect, restrictTo } from '../middlewares/auth.js';
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
export const seedDefaultWorkshop = async () => {
  logger.info('Ensuring default workshop data exists in MongoDB...');
  await Workshop.findOneAndUpdate(
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

  const workshop = await Workshop.findOne({ workshopId: 'AI_ROBOTICS_SUMMER_2026' });
  if (!workshop) {
    throw new Error('Failed to find or seed the default workshop AI_ROBOTICS_SUMMER_2026');
  }

  const enrolledB1 = await Enquiry.countDocuments({
    workshopId: 'AI_ROBOTICS_SUMMER_2026',
    batchId: 'BATCH_01',
    status: 'enrolled'
  });
  const enrolledB2 = await Enquiry.countDocuments({
    workshopId: 'AI_ROBOTICS_SUMMER_2026',
    batchId: 'BATCH_02',
    status: 'enrolled'
  });

  workshop.batches = workshop.batches.map(b => {
    if (b.batchId === 'BATCH_01') b.enrolled = enrolledB1;
    if (b.batchId === 'BATCH_02') b.enrolled = enrolledB2;
    return b;
  });

  const totalEnrolled = enrolledB1 + enrolledB2;
  workshop.seatsAvailable = Math.max(0, workshop.seatsTotal - totalEnrolled);
  await workshop.save();

  const redis = getRedisClient();
  await redis.set('workshop:seats', String(workshop.seatsAvailable), 'EX', 60);
  await redis.del('workshop:info');

  logger.info(`Workshop seats synchronized. B1 enrolled: ${enrolledB1}, B2 enrolled: ${enrolledB2}, Available: ${workshop.seatsAvailable}`);
  return workshop;
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

// @route   GET /api/workshop
// @desc    Get all workshops
// @access  Public
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const workshops = await Workshop.find({}).sort({ startDate: 1 });
    res.status(200).json({
      success: true,
      data: workshops,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/workshop
// @desc    Create a new workshop
// @access  Private (Admin only)
router.post('/', protect, restrictTo('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Basic verification of required fields
    const { workshopId, title, subtitle, ageGroup, durationWeeks, mode, feeINR, startDate, endDate, seatsTotal } = req.body;
    if (!workshopId || !title || !subtitle || !ageGroup || !durationWeeks || !mode || feeINR == null || !startDate || !endDate || !seatsTotal) {
      return next(new AppError('All required fields must be provided.', 400, 'VALIDATION_ERROR'));
    }

    const existing = await Workshop.findOne({ workshopId });
    if (existing) {
      return next(new AppError('Workshop with this ID already exists.', 409, 'ALREADY_EXISTS'));
    }

    // Default batches if not provided
    const batches = req.body.batches || [
      {
        batchId: 'BATCH_01',
        name: 'Morning Tech Pioneers (09:00 AM - 12:00 PM)',
        seats: Math.floor(seatsTotal / 2),
        enrolled: 0,
      },
      {
        batchId: 'BATCH_02',
        name: 'Afternoon Code Crafters (02:00 PM - 05:00 PM)',
        seats: Math.ceil(seatsTotal / 2),
        enrolled: 0,
      },
    ];

    const workshop = await Workshop.create({
      ...req.body,
      batches,
    });

    // Invalidate Redis caches
    const redis = getRedisClient();
    await redis.del('workshop:info');
    await redis.del('workshop:seats');

    res.status(201).json({
      success: true,
      data: workshop,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/workshop/:workshopId
// @desc    Update a workshop
// @access  Private (Admin only)
router.put('/:workshopId', protect, restrictTo('admin'), async (req: Request, res: Response, next: NextFunction) => {
  const { workshopId } = req.params;
  try {
    const existingWorkshop = await Workshop.findOne({ workshopId });
    if (!existingWorkshop) {
      return next(new AppError('Workshop not found.', 404, 'NOT_FOUND'));
    }

    const newSeatsTotal = req.body.seatsTotal !== undefined ? Number(req.body.seatsTotal) : existingWorkshop.seatsTotal;
    const newBatches = req.body.batches !== undefined ? req.body.batches : existingWorkshop.batches;

    if (req.body.seatsTotal !== undefined || req.body.batches !== undefined) {
      const calculatedTotal = newBatches.reduce((acc: number, b: any) => acc + (Number(b.seats) || 0), 0);
      if (calculatedTotal !== newSeatsTotal) {
        return next(new AppError(`Total batch seats (${calculatedTotal}) must match workshop seatsTotal (${newSeatsTotal}). Please update batch capacities accordingly.`, 400, 'VALIDATION_ERROR'));
      }
    }

    const workshop = await Workshop.findOneAndUpdate(
      { workshopId },
      req.body,
      { new: true, runValidators: true }
    );

    // Invalidate Redis caches
    const redis = getRedisClient();
    await redis.del('workshop:info');
    await redis.del('workshop:seats');

    res.status(200).json({
      success: true,
      data: workshop,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/workshop/:workshopId
// @desc    Delete a workshop
// @access  Private (Admin only)
router.delete('/:workshopId', protect, restrictTo('admin'), async (req: Request, res: Response, next: NextFunction) => {
  const { workshopId } = req.params;
  try {
    if (workshopId === 'AI_ROBOTICS_SUMMER_2026') {
      return next(new AppError('Cannot delete the seeded default workshop.', 400, 'VALIDATION_ERROR'));
    }

    const workshop = await Workshop.findOneAndDelete({ workshopId });
    if (!workshop) {
      return next(new AppError('Workshop not found.', 404, 'NOT_FOUND'));
    }

    // Invalidate Redis caches
    const redis = getRedisClient();
    await redis.del('workshop:info');
    await redis.del('workshop:seats');

    res.status(200).json({
      success: true,
      message: 'Workshop deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
