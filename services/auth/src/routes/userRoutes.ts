import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get profile for currently logged-in user
 * @access  Protected (Any authenticated user)
 */
router.get(
  '/profile',
  authenticateToken,
  getProfile
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update profile for currently logged-in user
 * @access  Protected (Any authenticated user)
 */
router.put(
  '/profile',
  authenticateToken,
  // Validation rules
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters')
    .matches(/^[a-zA-ZčćžšđČĆŽŠĐ\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters')
    .matches(/^[a-zA-ZčćžšđČĆŽŠĐ\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  handleValidationErrors,
  updateProfile
);

export default router;
