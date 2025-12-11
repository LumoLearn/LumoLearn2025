import { Router } from 'express';
import { linkStudent, getChildren } from '../controllers/parentController';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  linkStudentValidation,
  handleValidationErrors
} from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/parents/link-student
 * @desc    Link a student to the authenticated parent
 * @access  Protected (Parent only)
 */
router.post(
  '/link-student',
  authenticateToken,
  requireRole(['parent']),
  linkStudentValidation,
  handleValidationErrors,
  linkStudent
);

/**
 * @route   GET /api/parents/children
 * @desc    Get all children (students) linked to the authenticated parent
 * @access  Protected (Parent only)
 */
router.get(
  '/children',
  authenticateToken,
  requireRole(['parent']),
  getChildren
);

export default router;
