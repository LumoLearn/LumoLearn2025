import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { mongoDb } from './config/database';
import { postgresDb } from './config/postgres';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import healthRoutes from './routes/healthRoutes';
import lessonRoutes from './routes/lessonRoutes';
import quizRoutes from './routes/quizRoutes';
import { getUploadConfig } from './config/multer';

// Load environment variables
dotenv.config();

/**
 * LumoLearn Content Service
 *
 * Microservice for managing lesson uploads and content storage
 * - Handles Word (.docx) and PDF file uploads
 * - Stores lesson content in MongoDB
 * - Stores lesson metadata in PostgreSQL
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
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
const corsOptions = {
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

// Quiz routes
app.use('/api/quizzes', quizRoutes);

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
      lessons: {
        upload: 'POST /api/lessons/upload',
        list: 'GET /api/lessons',
        get: 'GET /api/lessons/:id',
        published: 'GET /api/lessons/published',
        publish: 'PUT /api/lessons/:id/publish',
        unpublish: 'PUT /api/lessons/:id/unpublish',
        update: 'PUT /api/lessons/:id',
        delete: 'DELETE /api/lessons/:id',
      },
      quizzes: {
        create: 'POST /api/quizzes',
        list: 'GET /api/quizzes',
        get: 'GET /api/quizzes/:id',
        published: 'GET /api/quizzes/published',
        update: 'PUT /api/quizzes/:id',
        publish: 'POST /api/quizzes/:id/publish',
        unpublish: 'POST /api/quizzes/:id/unpublish',
        delete: 'DELETE /api/quizzes/:id',
      },
    },
    configuration: {
      maxFileSizeMB: uploadConfig.maxFileSizeMB,
      allowedFileTypes: uploadConfig.allowedExtensions,
      mongodbConnected: mongoDb.isConnected(),
      postgresConnected: postgresDb.isConnected(),
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

    // Connect to PostgreSQL
    console.log('\n2. Connecting to PostgreSQL...');
    await postgresDb.connect();

    // Start Express server
    console.log('\n3. Starting Express server...');
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${NODE_ENV}`);
      console.log(`✓ MongoDB connected: ${mongoDb.isConnected()}`);
      console.log(`✓ PostgreSQL connected: ${postgresDb.isConnected()}`);

      const uploadConfig = getUploadConfig();
      console.log(`✓ Max file size: ${uploadConfig.maxFileSizeMB}MB`);
      console.log(`✓ Allowed file types: ${uploadConfig.allowedExtensions.join(', ')}`);

      console.log('\n' + '='.repeat(60));
      console.log('Content Service is ready to accept requests!');
      console.log('='.repeat(60));
      console.log(`\nEndpoints:`);
      console.log(`  - Health check:      http://localhost:${PORT}/health`);
      console.log(`  - Database check:    http://localhost:${PORT}/health/db`);
      console.log(`  - Upload lesson:     POST http://localhost:${PORT}/api/lessons/upload`);
      console.log(`  - List lessons:      GET http://localhost:${PORT}/api/lessons`);
      console.log(`  - Get lesson:        GET http://localhost:${PORT}/api/lessons/:id`);
      console.log(`  - Published lessons: GET http://localhost:${PORT}/api/lessons/published`);
      console.log(`  - Create quiz:       POST http://localhost:${PORT}/api/quizzes`);
      console.log(`  - List quizzes:      GET http://localhost:${PORT}/api/quizzes`);
      console.log(`  - Get quiz:          GET http://localhost:${PORT}/api/quizzes/:id`);
      console.log(`  - Published quizzes: GET http://localhost:${PORT}/api/quizzes/published`);
      console.log(`  - Service info:      http://localhost:${PORT}/`);
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

    await postgresDb.disconnect();
    console.log('✓ PostgreSQL disconnected');

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
