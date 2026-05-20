import { Request, Response } from 'express';
import { mongoDb } from '../config/database';
import { postgresDb } from '../config/postgres';

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
 * Checks MongoDB and PostgreSQL connection status
 *
 * Response: { success: true, mongodb: "connected", postgres: "connected", timestamp: ISO string }
 *
 * @access Public
 */
export const databaseHealthCheck = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const mongoConnected = mongoDb.isConnected();
    const postgresConnected = postgresDb.isConnected();

    const errors: string[] = [];

    // Test MongoDB connection
    if (!mongoConnected) {
      errors.push('MongoDB not connected');
    } else {
      try {
        const db = mongoDb.getDb();
        await db.command({ ping: 1 });
      } catch {
        errors.push('MongoDB ping failed');
      }
    }

    // Test PostgreSQL connection
    if (!postgresConnected) {
      errors.push('PostgreSQL not connected');
    } else {
      try {
        await postgresDb.query('SELECT 1');
      } catch {
        errors.push('PostgreSQL query failed');
      }
    }

    if (errors.length > 0) {
      res.status(503).json({
        success: false,
        errors,
        mongodb: mongoConnected ? 'connected' : 'disconnected',
        postgres: postgresConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      success: true,
      mongodb: 'connected',
      postgres: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({
      success: false,
      error: 'Database connection check failed',
      timestamp: new Date().toISOString(),
    });
  }
};
