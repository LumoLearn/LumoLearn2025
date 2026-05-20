import { Router } from 'express';
import { getSettings, updateSettings, getStudentProgress } from '../controllers/studentController';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  accessibilitySettingsValidation,
  handleValidationErrors
} from '../middleware/validation';

const router = Router();

/**
 * @route   GET /api/students/:id/settings
 * @desc    Get accessibility settings for a student
 * @access  Protected (Student can only access their own settings)
 */
router.get(
  '/:id/settings',
  authenticateToken,
  requireRole(['student', 'parent']), // Parent can also view their children's settings
  getSettings
);

/**
 * @route   PUT /api/students/:id/settings
 * @desc    Update accessibility settings for a student
 * @access  Protected (Student can only update their own settings)
 */
router.put(
  '/:id/settings',
  authenticateToken,
  requireRole(['student']), // Only students can update their own settings
  accessibilitySettingsValidation,
  handleValidationErrors,
  updateSettings
);

/**
 * @route   GET /api/students/:id/progress
 * @desc    Get student progress and analytics (quiz attempts, scores, statistics)
 * @access  Protected (Student can access their own progress, Parent can access their children's progress)
 */
router.get(
  '/:id/progress',
  authenticateToken,
  requireRole(['student', 'parent']), // Student or Parent can access
  getStudentProgress
);

export default router;

