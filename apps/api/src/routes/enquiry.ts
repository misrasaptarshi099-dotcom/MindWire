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
    const { name, email, phone, childName, childAge, message, hp } = req.body;

    // Check honeypot for spam bots
    if (hp) {
      logger.warn(`Spam bot registration blocked for email ${email}`);
      return next(new AppError('Spam detected.', 400, 'SPAM_DETECTED'));
    }

    const redis = getRedisClient();
    const dupKey = `enquiry:dup:${email}`;

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
      const existingEnquiry = await Enquiry.findOne({ email });
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

      // 3. Check seats availability
      let workshop = await Workshop.findOne({ workshopId: 'AI_ROBOTICS_SUMMER_2026' });
      if (!workshop) {
        workshop = await seedDefaultWorkshop();
      }
      if (workshop && workshop.seatsAvailable <= 0) {
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

export default router;
