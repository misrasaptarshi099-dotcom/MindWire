import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import winston from 'winston';

import { AppError, handleError } from './utils/errors.js';
import authRouter from './routes/auth.js';
import enquiryRouter from './routes/enquiry.js';
import paymentRouter from './routes/payment.js';
import workshopRouter from './routes/workshop.js';
import userRouter from './routes/user.js';

// Setup logger
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

const app: Express = express();

// Trust proxy for secure cookies and rate limiting behind reverse proxies (like Nginx/Load Balancers)
app.set('trust proxy', 1);

// 1. Security headers via Helmet
app.use(helmet());

// 2. CORS configuration
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()) 
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS request from origin: ${origin}`);
        callback(new AppError('Not allowed by CORS', 403, 'CORS_ERROR'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  })
);

// 3. Express JSON body parser with rawBody capture for Stripe webhook signature verification
app.use(
  express.json({
    verify: (req: Request, _res: Response, buf: Buffer) => {
      if (req.originalUrl.includes('/api/payment/webhook')) {
        (req as any).rawBody = buf;
      }
    },
  })
);

app.use(express.urlencoded({ extended: true }));

// 4. Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// 5. Routes registration
app.use('/api/auth', authRouter);
app.use('/api/enquiry', enquiryRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/workshop', workshopRouter);
app.use('/api/users', userRouter);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 6. 404 Route Not Found handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'The requested API route was not found on this server.',
  });
});

// 7. Global Error Handler middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  handleError(err, res);
});

export { app };
