import { Request } from 'express';

/**
 * Extended Express Request type with user information
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: 'student' | 'teacher' | 'parent';
      };
    }
  }
}

export {};
