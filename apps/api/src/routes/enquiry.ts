import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Enquiry } from '../models/Enquiry.js';
import { Workshop } from '../models/Workshop.js';
import { AppError } from '../utils/errors.js';
import { validateBody } from '../middlewares/validation.js';
import { rateLimiter } from '../middlewares/rateLimit.js';
import { getRedisClient } from '../config/redis.js';
import { sendEnquiryEmail } from '../utils/email.js';
import { enquirySchema } from '@mindwire/shared';
import { seedDefaultWorkshop } from './workshop.js';
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

// @route   POST /api/enquiry
// @desc    Submit a workshop enquiry / registration
// @access  Public (Rate limited: 5 req/min)
router.post(
  '/',
  rateLimiter(5, 60), // 5 requests per minute
  validateBody(enquirySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, childName, childAge, message, hp, workshopId, batchId } = req.body;

    // Check honeypot for spam bots
    if (hp) {
      logger.warn(`Spam bot registration blocked for email ${email}`);
      return next(new AppError('Spam detected.', 400, 'SPAM_DETECTED'));
    }

    const redis = getRedisClient();
    const targetWorkshopId = workshopId || 'AI_ROBOTICS_SUMMER_2026';
    const dupKey = `enquiry:dup:${email}:${targetWorkshopId}`;

    // 1. Atomic Redis lock to prevent concurrent duplicate submissions
    const lockAcquired = await redis.set(dupKey, '1', 'EX', 86400, 'NX');
    if (!lockAcquired) {
      return next(
        new AppError(
          'This email has a pending enquiry already. Please check your email or dashboard.',
          409,
          'ALREADY_REGISTERED'
        )
      );
    }

    try {
      // 2. Check Database for duplicate registration
      const existingEnquiry = await Enquiry.findOne({ email, workshopId: targetWorkshopId });
      if (existingEnquiry) {
        await redis.del(dupKey); // Release lock — DB already has this record
        return next(
          new AppError(
            'This email is already registered for the workshop.',
            409,
            'ALREADY_REGISTERED'
          )
        );
      }

      // 3. Resolve the actual workshop and check seats availability
      let workshop = await Workshop.findOne({ workshopId: targetWorkshopId });
      if (!workshop) {
        if (!workshopId) {
          workshop = await seedDefaultWorkshop();
        }
      }

      if (!workshop) {
        await redis.del(dupKey);
        return next(new AppError('Workshop configuration not found.', 404, 'NOT_FOUND'));
      }

      const resolvedWorkshopId = workshop.workshopId;
      
      let targetBatchId = 'BATCH_01';
      if (batchId) {
        const isBatchValid = workshop.batches && workshop.batches.some(b => b.batchId === batchId);
        if (!isBatchValid) {
          await redis.del(dupKey);
          return next(new AppError('Invalid batch ID provided.', 400, 'VALIDATION_ERROR'));
        }
        targetBatchId = batchId;
      } else {
        targetBatchId = workshop.batches?.[0]?.batchId || 'BATCH_01';
      }

      if (workshop.seatsAvailable <= 0) {
        await redis.del(dupKey); // Release lock so they can try again if seats open
        return next(
          new AppError(
            'The workshop is currently full. You will be placed on the waitlist.',
            400,
            'WORKSHOP_FULL'
          )
        );
      }

      // 4. Generate unique tokens
      const enquiryId = crypto.randomUUID();
      const randomSeq = crypto.randomBytes(3).toString('hex').toUpperCase();
      const referenceCode = `MW-2026-${randomSeq}`;

      const clientIp = req.ip || 'unknown';

      // 5. Save enquiry in database
      const enquiry = await Enquiry.create({
        enquiryId,
        referenceCode,
        name,
        email,
        phone,
        childName,
        childAge,
        message,
        status: 'pending',
        workshopId: resolvedWorkshopId,
        batchId: targetBatchId,
        feeINR: workshop.feeINR,
        ipAddress: clientIp,
        userAgent: req.headers['user-agent'] || 'unknown',
      });

      // 6. Trigger async email confirmation (do not block client response)
      sendEnquiryEmail(email, name, referenceCode).catch((err) => {
        logger.error(`Async welcome email failed: ${err.message}`);
      });

      res.status(201).json({
        success: true,
        message: 'Registration enquiry received! Check your email for details.',
        data: {
          enquiryId: enquiry.enquiryId,
          referenceCode: enquiry.referenceCode,
        },
      });
    } catch (error) {
      await redis.del(dupKey); // Release lock on unexpected failure
      next(error);
    }
  }
);

// @route   GET /api/enquiry
// @desc    Get all enquiries
// @access  Private (Admin only)
router.get('/', protect, restrictTo('admin'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: enquiries,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/enquiry/:id
// @desc    Delete an enquiry/registration
// @access  Admin
router.delete('/:id', protect, restrictTo('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return next(new AppError('Registration not found', 404, 'NOT_FOUND'));
    }
    res.status(200).json({
      success: true,
      message: 'Registration deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/enquiry/user/me
// @desc    Get all registrations / enquiries for the logged-in user
// @access  Private
router.get('/user/me', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.email) {
      return next(new AppError('User details missing from token.', 400, 'BAD_REQUEST'));
    }
    
    // Find all registrations for this email
    const enquiries = await Enquiry.find({ email: req.user.email }).sort({ createdAt: -1 });
    
    // Fetch details of all associated workshops to enrich the data
    const enrichedEnquiries = await Promise.all(
      enquiries.map(async (enq) => {
        const workshop = await Workshop.findOne({ workshopId: enq.workshopId });
        return {
          enquiryId: enq.enquiryId,
          referenceCode: enq.referenceCode,
          name: enq.name,
          email: enq.email,
          phone: enq.phone,
          childName: enq.childName,
          childAge: enq.childAge,
          message: enq.message,
          status: enq.status,
          payment: enq.payment,
          workshopId: enq.workshopId,
          batchId: enq.batchId,
          createdAt: enq.createdAt,
          enrolledAt: enq.enrolledAt,
          workshopTitle: workshop?.title || 'MindWire Workshop',
          workshopFee: workshop?.feeINR || 2999,
          workshopMode: workshop?.mode || 'hybrid',
          workshopStartDate: workshop?.startDate,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedEnquiries,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
