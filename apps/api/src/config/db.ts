import mongoose from 'mongoose';
import winston from 'winston';

// Configure Winston logger for database
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

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.error('MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to bypass Node 18+ DNS resolution issues on Windows
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      logger.error('Halting server execution due to missing database connection.');
      process.exit(1);
    }
  }
};
