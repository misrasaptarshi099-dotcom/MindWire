import { Request, Response, NextFunction } from 'express';
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

export const rateLimiter = (limit: number, windowSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ipStr = req.ip || 'unknown';
    
    const redis = getRedisClient();
    const key = `ratelimit:${req.path}:${ipStr}`;

    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - current));

      if (current > limit) {
        logger.warn(`Rate limit exceeded for IP ${ipStr} on route ${req.originalUrl}`);
        res.setHeader('Retry-After', windowSeconds);
        return next(new AppError('Too many requests. Please try again later.', 429, 'TOO_MANY_REQUESTS'));
      }
      next();
    } catch (error) {
      logger.error(`Rate limiter check failed for IP ${ipStr}: ${(error as Error).message}. Failing open.`);
      next();
    }
  };
};
