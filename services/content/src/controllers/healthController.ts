import { Request, Response } from 'express';
import { mongoDb } from '../config/database';

/**
 * Health Check Controller
 *
 * Provides endpoints to check service and database health
 */

/**
 * Basic health check
 *
 * GET /health
 *
 * Response: { success: true, message: "Content Service is running", timestamp: ISO string }
 *
 * @access Public
 */
export const healthCheck = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Content Service is running',
    timestamp: new Date().toISOString(),
    service: 'content',
    version: '1.0.0',
  });
};

/**
 * Database health check
 *
 * GET /health/db
 *
 * Checks MongoDB connection status
 *
 * Response: { success: true, mongodb: "connected", timestamp: ISO string }
 *
 * @access Public
 */
export const databaseHealthCheck = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const isConnected = mongoDb.isConnected();

    if (!isConnected) {
      res.status(503).json({
        success: false,
        error: 'MongoDB not connected',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Test MongoDB connection with ping
    const db = mongoDb.getDb();
    await db.command({ ping: 1 });

    res.status(200).json({
      success: true,
      mongodb: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({
      success: false,
      error: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
};
