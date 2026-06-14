import dns from 'node:dns';
// Force Google DNS — fixes "querySrv ECONNREFUSED" on ISPs that block SRV lookups
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

import './config/env.js';
import winston from 'winston';

// Configure Winston Logger
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

import { app } from './app.js';
import { connectDB } from './config/db.js';
import { seedDefaultWorkshop } from './routes/workshop.js';

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Seed default workshop data on startup
  try {
    await seedDefaultWorkshop();
    logger.info('Default workshop seeded/verified.');
  } catch (error) {
    logger.error(`Error seeding default workshop: ${(error as Error).message}`);
  }

  // Start listening
  const server = app.listen(PORT, () => {
    logger.info(`⚡ MINDWIRE Backend API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err: Error) => {
    logger.error(`Unhandled Rejection: ${err.message}\nStack: ${err.stack}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });

  // Handle Uncaught Exceptions
  process.on('uncaughtException', (err: Error) => {
    logger.error(`Uncaught Exception: ${err.message}\nStack: ${err.stack}`);
    // Close server & exit process
    process.exit(1);
  });
};

startServer().catch((err) => {
  logger.error(`Failed to start server: ${(err as Error).message}\nStack: ${(err as Error).stack}`);
  process.exit(1);
});
