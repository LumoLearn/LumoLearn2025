import { Router } from 'express';
import { register, login } from '../controllers/authController';
import {
  registerValidation,
  loginValidation,
  handleValidationErrors
} from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  registerValidation,
  handleValidationErrors,
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post(
  '/login',
  loginValidation,
  handleValidationErrors,
  login
);

/**
 * @route   GET /api/auth/test
 * @desc    Test route to verify auth routes are working
 * @access  Public
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

export default router;

