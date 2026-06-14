import { Router, Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { Enquiry } from '../models/Enquiry.js';
import { Workshop } from '../models/Workshop.js';
import { getRedisClient } from '../config/redis.js';
import { AppError } from '../utils/errors.js';
import { sendEnrollmentEmail } from '../utils/email.js';
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
const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Initialize Stripe. If missing, we log warnings and support mock modes.
let stripe: Stripe | null = null;
if (stripeSecret && !stripeSecret.startsWith('sk_test_YOUR_')) {
  stripe = new Stripe(stripeSecret, {
    apiVersion: '2023-10-16' as any,
  });
  logger.info('Stripe client initialized.');
} else {
  logger.warn('Stripe Secret Key is missing or invalid. Payments will fall back to MOCK mode.');
}

// @route   POST /api/payment/create-order
// @desc    Create Stripe PaymentIntent for workshop registration
// @access  Public
router.post('/create-order', async (req: Request, res: Response, next: NextFunction) => {
  const { enquiryId, email, name } = req.body;

  if (!enquiryId) {
    return next(new AppError('Enquiry ID is required.', 400, 'VALIDATION_ERROR'));
  }

  try {
    const enquiry = await Enquiry.findOne({ enquiryId });
    if (!enquiry) {
      return next(new AppError('Enquiry not found.', 404, 'NOT_FOUND'));
    }

    if (enquiry.status === 'enrolled') {
      return next(new AppError('This registration has already been paid and enrolled.', 400, 'ALREADY_ENROLLED'));
    }

    const amountInPaise = 299900; // ₹2,999 represented in paise (smallest unit)
    
    let clientSecret = 'mock_secret_value_for_sandbox';
    let paymentIntentId = 'mock_pi_' + crypto.randomUUID().slice(0, 8);

    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInPaise,
        currency: 'inr',
        metadata: {
          enquiryId,
          email,
          name,
        },
        description: 'MindWire AI & Robotics Workshop Registration',
      });

      clientSecret = paymentIntent.client_secret || '';
      paymentIntentId = paymentIntent.id;
    } else {
      logger.info(`[MOCK PAYMENT] Creating mock payment intent for amount: ${amountInPaise} INR`);
    }

    // Update enquiry payment details and set status to initiated
    enquiry.status = 'payment_initiated';
    enquiry.payment = {
      orderId: paymentIntentId,
      status: 'pending',
      amount: amountInPaise / 100,
      currency: 'INR',
    };
    await enquiry.save();

    res.status(200).json({
      success: true,
      clientSecret,
      orderId: paymentIntentId,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'mock_publishable_key',
      prefill: {
        name: enquiry.name,
        email: enquiry.email,
        contact: enquiry.phone,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/payment/verify
// @desc    Verify Stripe payment status after client checkout
// @access  Public
router.post('/verify', async (req: Request, res: Response, next: NextFunction) => {
  const { stripe_order_id, enquiryId } = req.body;

  if (!stripe_order_id || !enquiryId) {
    return next(new AppError('Missing verify parameters.', 400, 'VALIDATION_ERROR'));
  }

  try {
    const enquiry = await Enquiry.findOne({ enquiryId });
    if (!enquiry) {
      return next(new AppError('Enquiry not found.', 404, 'NOT_FOUND'));
    }

    if (enquiry.status === 'enrolled') {
      return res.status(200).json({
        success: true,
        message: "Payment confirmed! You're enrolled.",
        receiptUrl: 'https://stripe.com/receipt/mock',
      });
    }

    let isSuccess = false;
    let paymentId = 'mock_pay_' + crypto.randomUUID().slice(0, 8);

    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.retrieve(stripe_order_id);
      if (paymentIntent.status === 'succeeded') {
        isSuccess = true;
        paymentId = paymentIntent.id;
      }
    } else {
      // In mock mode, assume successful verification if request reaches here
      isSuccess = true;
      logger.info(`[MOCK PAYMENT VERIFICATION] Mock verified order: ${stripe_order_id}`);
    }

    if (!isSuccess) {
      return next(new AppError('Payment has not succeeded yet.', 400, 'PAYMENT_PENDING'));
    }

    // Mark enquiry as enrolled and process seats
    enquiry.status = 'enrolled';
    enquiry.payment.status = 'captured';
    enquiry.payment.paymentId = paymentId;
    enquiry.payment.capturedAt = new Date();
    enquiry.enrolledAt = new Date();
    await enquiry.save();

    // Decrement workshop seats availability
    const workshop = await Workshop.findOne({ workshopId: 'AI_ROBOTICS_SUMMER_2026' });
    if (workshop) {
      workshop.seatsAvailable = Math.max(0, workshop.seatsAvailable - 1);
      // Increment enrolled count on the batch matching enquiry
      const batch = workshop.batches.find((b) => b.batchId === enquiry.batchId);
      if (batch) {
        batch.enrolled = batch.enrolled + 1;
      }
      await workshop.save();

      // Invalidate Redis seats cache
      const redis = getRedisClient();
      await redis.set('workshop:seats', String(workshop.seatsAvailable), 'EX', 60);
      await redis.del('workshop:info');
    }

    // Send confirmation email asynchronously
    sendEnrollmentEmail(enquiry.email, enquiry.name, enquiry.referenceCode, stripe_order_id).catch((err) => {
      logger.error(`Async enrollment email failed: ${err.message}`);
    });

    res.status(200).json({
      success: true,
      message: "Payment confirmed! You're enrolled.",
      receiptUrl: 'https://stripe.com/receipt/mock',
    });
  } catch (error) {
    next(error);
  }
});

// Helper for Stripe Webhook enrollment confirmation
const confirmEnrollment = async (enquiryId: string, paymentId: string) => {
  const enquiry = await Enquiry.findOne({ enquiryId });
  if (!enquiry || enquiry.status === 'enrolled') return;

  enquiry.status = 'enrolled';
  enquiry.payment.status = 'captured';
  enquiry.payment.paymentId = paymentId;
  enquiry.payment.capturedAt = new Date();
  enquiry.enrolledAt = new Date();
  await enquiry.save();

  const workshop = await Workshop.findOne({ workshopId: 'AI_ROBOTICS_SUMMER_2026' });
  if (workshop) {
    workshop.seatsAvailable = Math.max(0, workshop.seatsAvailable - 1);
    const batch = workshop.batches.find((b) => b.batchId === enquiry.batchId);
    if (batch) {
      batch.enrolled = batch.enrolled + 1;
    }
    await workshop.save();

    const redis = getRedisClient();
    await redis.set('workshop:seats', String(workshop.seatsAvailable), 'EX', 60);
    await redis.del('workshop:info');
  }

  sendEnrollmentEmail(enquiry.email, enquiry.name, enquiry.referenceCode, paymentId).catch((err) => {
    logger.error(`Webhook async enrollment email failed: ${err.message}`);
  });
};

// Helper for Stripe Webhook enrollment failure
const failEnrollment = async (enquiryId: string) => {
  const enquiry = await Enquiry.findOne({ enquiryId });
  if (!enquiry || enquiry.status === 'enrolled') return;

  enquiry.payment.status = 'failed';
  await enquiry.save();
};

// @route   POST /api/payment/webhook
// @desc    Stripe Webhook receiver
// @access  Public
router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'];
  const rawBody = (req as any).rawBody;

  if (!stripe || !stripeWebhookSecret || !sig || !rawBody) {
    logger.warn('Stripe Webhook: Stripe config missing or signature verification skipped.');
    return res.status(200).json({ received: true, status: 'skipped_or_mocked' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig as string, stripeWebhookSecret);
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${(err as Error).message}`);
    return next(new AppError(`Webhook Error: ${(err as Error).message}`, 400, 'SIGNATURE_MISMATCH'));
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const enquiryId = paymentIntent.metadata.enquiryId;
        if (enquiryId) {
          logger.info(`Webhook: Confirmed payment for enquiry ${enquiryId}`);
          await confirmEnrollment(enquiryId, paymentIntent.id);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const enquiryId = paymentIntent.metadata.enquiryId;
        if (enquiryId) {
          logger.error(`Webhook: Failed payment for enquiry ${enquiryId}`);
          await failEnrollment(enquiryId);
        }
        break;
      }
      default:
        logger.info(`Webhook: Received event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
});

export default router;
