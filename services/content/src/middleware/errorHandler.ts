import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

/**
 * Global Error Handler Middleware
 *
 * Handles all errors and returns consistent error responses
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error occurred:', error);

  // Multer file size error
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: `File too large. Maximum size is ${
          parseInt(process.env.MAX_FILE_SIZE_MB || '10')
        }MB.`,
      });
      return;
    }

    res.status(400).json({
      success: false,
      error: `Upload error: ${error.message}`,
    });
    return;
  }

  // File type validation error
  if (error.message && error.message.includes('Invalid file type')) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
    return;
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: error.message,
    });
    return;
  }

  // MongoDB errors
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    res.status(500).json({
      success: false,
      error: 'Database error occurred',
    });
    return;
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
  });
};

/**
 * Not Found Handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
};
