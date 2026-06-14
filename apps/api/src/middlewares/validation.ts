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
