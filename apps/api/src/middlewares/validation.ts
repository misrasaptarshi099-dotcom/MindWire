import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/errors.js';

export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        next(new AppError('Input validation failed.', 400, 'VALIDATION_ERROR', details));
      } else {
        next(error);
      }
    }
  };
};

export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction): void => {
  // Simple input trimming and HTML sanitization for string fields to prevent XSS
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        let val = req.body[key].trim();
        // Remove basic script and html tags
        val = val.replace(/<[^>]*>/g, '');
        req.body[key] = val;
      }
    }
  }
  next();
};
