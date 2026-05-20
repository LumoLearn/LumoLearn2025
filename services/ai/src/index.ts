import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import aiRoutes from './routes/aiRoutes';
import healthRoutes from './routes/healthRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/health', healthRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   🤖 LumoLearn AI Service (Gemini)        ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║   Port: ${PORT}                              ║`);
  console.log(`║   Environment: ${process.env.NODE_ENV || 'development'}              ║`);
  console.log(`║   Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}          ║`);
  console.log('╠════════════════════════════════════════════╣');
  console.log('║   Endpoints:                               ║');
  console.log('║   GET  /health                             ║');
  console.log('║   GET  /health/gemini                      ║');
  console.log('║   GET  /api/ai/test                        ║');
  console.log('║   POST /api/ai/generate-quiz               ║');
  console.log('╚════════════════════════════════════════════╝');
});

export default app;
