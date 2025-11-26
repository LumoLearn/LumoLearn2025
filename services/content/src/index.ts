import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { mongoDb } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import healthRoutes from './routes/healthRoutes';
import lessonRoutes from './routes/lessonRoutes';
import { getUploadConfig } from './config/multer';

// Load environment variables
dotenv.config();

/**
 * LumoLearn Content Service
 *
 * Microservice for managing lesson uploads and content storage
 * - Handles Word (.docx) and PDF file uploads
 * - Stores lesson content in MongoDB
 * - Provides lesson retrieval endpoints
 *
 * Port: 3002 (default)
 */

const app: Application = express();
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Middleware Configuration
 */

// Security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development only)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

/**
 * Routes
 */

// Health check routes
app.use('/health', healthRoutes);

// Lesson routes
app.use('/api/lessons', lessonRoutes);

// Root route
app.get('/', (req, res) => {
  const uploadConfig = getUploadConfig();

  res.json({
    success: true,
    service: 'LumoLearn Content Service',
    version: '1.0.0',
    status: 'running',
    environment: NODE_ENV,
    endpoints: {
      health: '/health',
      database: '/health/db',
      lessons: '/api/lessons',
    },
    configuration: {
      maxFileSizeMB: uploadConfig.maxFileSizeMB,
      allowedFileTypes: uploadConfig.allowedExtensions,
      mongodbConnected: mongoDb.isConnected(),
    },
  });
});

/**
 * Error Handling
 */

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

/**
 * Server Initialization
 */

const startServer = async (): Promise<void> => {
  try {
    console.log('='.repeat(60));
    console.log('LumoLearn Content Service - Starting...');
    console.log('='.repeat(60));

    // Connect to MongoDB
    console.log('\n1. Connecting to MongoDB...');
    await mongoDb.connect();

    // Start Express server
    console.log('\n2. Starting Express server...');
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${NODE_ENV}`);
      console.log(`✓ MongoDB connected: ${mongoDb.isConnected()}`);

      const uploadConfig = getUploadConfig();
      console.log(`✓ Max file size: ${uploadConfig.maxFileSizeMB}MB`);
      console.log(`✓ Allowed file types: ${uploadConfig.allowedExtensions.join(', ')}`);

      console.log('\n' + '='.repeat(60));
      console.log('Content Service is ready to accept requests!');
      console.log('='.repeat(60));
      console.log(`\nEndpoints:`);
      console.log(`  - Health check:    http://localhost:${PORT}/health`);
      console.log(`  - Database check:  http://localhost:${PORT}/health/db`);
      console.log(`  - Lessons API:     http://localhost:${PORT}/api/lessons`);
      console.log(`  - Service info:    http://localhost:${PORT}/`);
      console.log('');
    });
  } catch (error) {
    console.error('\n✗ Failed to start Content Service:');
    console.error(error);
    process.exit(1);
  }
};

/**
 * Graceful Shutdown
 */

const shutdown = async (): Promise<void> => {
  console.log('\nShutting down Content Service...');

  try {
    await mongoDb.disconnect();
    console.log('✓ MongoDB disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server
startServer();

export default app;
