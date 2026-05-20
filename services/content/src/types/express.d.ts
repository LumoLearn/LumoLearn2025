/**
 * Extended Express Request type with user information
 * This augments the Express Request interface globally
 */

declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      email: string;
      role: 'student' | 'teacher' | 'parent';
    };
  }
}
