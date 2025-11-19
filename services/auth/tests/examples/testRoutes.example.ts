/**
 * Test Routes Example - For Reference Only
 * 
 * This file shows how to use authenticateToken and requireRole middleware
 * in your protected routes.
 * 
 * DO NOT USE IN PRODUCTION - This is for testing/learning only
 * 
 * To use these routes:
 * 1. Copy this file to src/routes/ (rename to testRoutes.ts)
 * 2. Register in src/index.ts: app.use('/api/test', testRoutes)
 * 3. Test with tokens from: node tests/utils/generateTestToken.js
 */

/// <reference path="../../src/types/express.d.ts" />

import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../../src/middleware/auth';

const router = Router();

/**
 * Example 1: Protected Route - All Authenticated Users
 * 
 * Requires: Valid JWT token
 * Allowed: All roles (student, teacher, parent)
 */
router.get('/profile', authenticateToken, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Protected route accessed successfully',
    user: req.user  // Available after authenticateToken
  });
});

/**
 * Example 2: Role-Based Route - Single Role
 * 
 * Requires: Valid JWT token + teacher role
 * Allowed: teacher only
 */
router.get(
  '/teacher-only',
  authenticateToken,
  requireRole(['teacher']),
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Teacher-only route accessed successfully',
      user: req.user
    });
  }
);

/**
 * Example 3: Role-Based Route - Multiple Roles
 * 
 * Requires: Valid JWT token + (teacher OR parent role)
 * Allowed: teacher, parent
 */
router.get(
  '/teacher-or-parent',
  authenticateToken,
  requireRole(['teacher', 'parent']),
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Teacher/Parent route accessed successfully',
      user: req.user
    });
  }
);

/**
 * Example 4: Dashboard Route - All Roles
 * 
 * Requires: Valid JWT token
 * Allowed: All authenticated users
 * 
 * Shows how to customize response based on user role
 */
router.get('/dashboard', authenticateToken, (req: Request, res: Response) => {
  const welcomeMessage = {
    student: 'Welcome to your student dashboard',
    teacher: 'Welcome to your teacher dashboard',
    parent: 'Welcome to your parent dashboard'
  };

  res.json({
    success: true,
    message: welcomeMessage[req.user!.role],
    user: req.user
  });
});

/**
 * Example 5: Student-Only Route
 * 
 * Requires: Valid JWT token + student role
 * Allowed: student only
 */
router.get(
  '/student-only',
  authenticateToken,
  requireRole(['student']),
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Student-only route accessed',
      user: req.user
    });
  }
);

/**
 * Example 6: POST Route with Authentication
 * 
 * Shows how to use middleware with POST/PUT/DELETE routes
 */
router.post(
  '/create-lesson',
  authenticateToken,
  requireRole(['teacher']),
  (req: Request, res: Response) => {
    // Only teachers can create lessons
    const { title, content } = req.body;
    
    res.json({
      success: true,
      message: 'Lesson created',
      lessonData: {
        title,
        teacherId: req.user!.userId,
        teacherEmail: req.user!.email
      }
    });
  }
);

/**
 * Example 7: Error Handling
 * 
 * Shows how to handle errors in protected routes
 */
router.get('/with-error-handling', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Your logic here
    const data = { userId: req.user!.userId };
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Example 8: Conditional Role Check
 * 
 * Shows advanced pattern - checking role in handler
 */
router.get('/flexible-access', authenticateToken, (req: Request, res: Response) => {
  const user = req.user!;
  
  // Different response based on role
  if (user.role === 'teacher') {
    res.json({
      success: true,
      message: 'Teacher view',
      data: { fullAccess: true }
    });
  } else if (user.role === 'parent') {
    res.json({
      success: true,
      message: 'Parent view',
      data: { limitedAccess: true }
    });
  } else {
    res.json({
      success: true,
      message: 'Student view',
      data: { restrictedAccess: true }
    });
  }
});

export default router;

/**
 * USAGE IN src/index.ts:
 * 
 * import testRoutes from './routes/testRoutes';
 * app.use('/api/test', testRoutes);
 * 
 * Then test with:
 * curl -X GET http://localhost:3001/api/test/profile \
 *   -H "Authorization: Bearer <token>"
 */

