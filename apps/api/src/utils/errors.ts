import { Response } from 'express';
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

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public errorCode: string,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleError = (err: Error, res: Response) => {
  if (res.headersSent) {
    logger.error(`Headers already sent. Unhandled Error: ${err.message}\nStack: ${err.stack}`);
    return;
  }

  if (err instanceof AppError) {
    logger.warn(`AppError [${err.errorCode}] (${err.statusCode}): ${err.message}`);
    return res.status(err.statusCode).json({
      success: false,
      error: err.errorCode,
      message: err.message,
      details: err.details,
    });
  }

  // Handle MongoDB duplicate key errors (E11000)
  if ((err as any).code === 11000) {
    const keyValue = (err as any).keyValue;
    const field = keyValue ? Object.keys(keyValue)[0] : 'field';
    logger.warn(`MongoDB E11000 duplicate key: ${field}`);
    return res.status(409).json({
      success: false,
      error: 'DUPLICATE_ENTRY',
      message: `A record with this ${field} already exists.`,
    });
  }

  logger.error(`Unhandled Error: ${err.message}\nStack: ${err.stack}`);
  
  return res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred on the server.',
  });
};
