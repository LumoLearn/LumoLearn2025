import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /health
 * Basic health check endpoint
 */
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'AI Service is running',
    service: 'lumolearn-ai-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * GET /health/gemini
 * Check Gemini API configuration
 */
router.get('/gemini', (_req: Request, res: Response) => {
  const hasApiKey = !!process.env.GEMINI_API_KEY;

  res.status(hasApiKey ? 200 : 500).json({
    success: hasApiKey,
    message: hasApiKey
      ? 'Gemini API key is configured'
      : 'Gemini API key is missing',
    configured: hasApiKey
  });
});

export default router;
