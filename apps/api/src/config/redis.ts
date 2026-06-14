import { Redis } from 'ioredis';
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

const redisUrl = process.env.REDIS_URL;
let redis: any;

if (redisUrl) {
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 3) {
          logger.error('Redis connection failed permanently.');
          return null; // stop retrying
        }
        return Math.min(times * 200, 1000);
      }
    });

    redis.on('connect', () => {
      logger.info('Redis connected successfully.');
    });

    redis.on('error', (err: any) => {
      logger.error(`Redis connection error: ${err.message}`);
    });
  } catch (err) {
    logger.error(`Failed to initialize Redis: ${(err as Error).message}`);
  }
} else {
  logger.warn('REDIS_URL is not set. Caching will be disabled.');
}

// Minimal in-memory store fallback for Redis if connection fails or is missing
const fallbackStore = new Map<string, string>();
const mockRedis = {
  get: async (key: string) => fallbackStore.get(key) || null,
  set: async (key: string, value: string, mode?: string, duration?: number) => {
    fallbackStore.set(key, value);
    if (mode === 'EX' && duration) {
      setTimeout(() => fallbackStore.delete(key), duration * 1000);
    }
    return 'OK';
  },
  del: async (key: string) => {
    return fallbackStore.delete(key) ? 1 : 0;
  },
  incr: async (key: string) => {
    const val = Number(fallbackStore.get(key) || 0) + 1;
    fallbackStore.set(key, String(val));
    return val;
  },
  expire: async (key: string, seconds: number) => {
    if (fallbackStore.has(key)) {
      setTimeout(() => fallbackStore.delete(key), seconds * 1000);
      return 1;
    }
    return 0;
  },
  quit: async () => 'OK',
  on: () => {},
  status: 'ready'
};

export const getRedisClient = () => {
  if (redis && redis.status === 'ready') {
    return redis;
  }
  return mockRedis;
};

export { redis };
