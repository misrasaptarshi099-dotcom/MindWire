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
let redis: Redis | null = null;

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
const timeoutStore = new Map<string, NodeJS.Timeout>();
const mockRedis = {
  get: async (key: string) => fallbackStore.get(key) || null,
  set: async (key: string, value: string, ...args: (string | number)[]) => {
    const upperArgs = args.map(a => typeof a === 'string' ? a.toUpperCase() : a);
    const hasNX = upperArgs.includes('NX');
    if (hasNX && fallbackStore.has(key)) {
      return null;
    }
    fallbackStore.set(key, value);
    const exIndex = upperArgs.indexOf('EX');
    if (exIndex !== -1) {
      const ttl = Number(upperArgs[exIndex + 1]);
      if (ttl > 0) {
        if (timeoutStore.has(key)) {
          clearTimeout(timeoutStore.get(key));
        }
        const t = setTimeout(() => {
          fallbackStore.delete(key);
          timeoutStore.delete(key);
        }, ttl * 1000);
        timeoutStore.set(key, t);
      }
    }
    return 'OK';
  },
  del: async (key: string) => {
    if (timeoutStore.has(key)) {
      clearTimeout(timeoutStore.get(key));
      timeoutStore.delete(key);
    }
    return fallbackStore.delete(key) ? 1 : 0;
  },
  incr: async (key: string) => {
    const val = Number(fallbackStore.get(key) || 0) + 1;
    fallbackStore.set(key, String(val));
    return val;
  },
  expire: async (key: string, seconds: number) => {
    if (fallbackStore.has(key)) {
      if (timeoutStore.has(key)) {
        clearTimeout(timeoutStore.get(key));
      }
      const t = setTimeout(() => {
        fallbackStore.delete(key);
        timeoutStore.delete(key);
      }, seconds * 1000);
      timeoutStore.set(key, t);
      return 1;
    }
    return 0;
  },
  quit: async () => 'OK',
  on: () => {},
  status: 'ready'
};

export const getRedisClient = (): Pick<Redis, 'get' | 'set' | 'del' | 'incr' | 'expire' | 'quit' | 'on' | 'status'> | typeof mockRedis => {
  if (redis && redis.status === 'ready') {
    return redis;
  }
  return mockRedis;
};

export { redis };
