import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation rules for user registration
 */
export const registerValidation = [
  // Email validation
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),

  // Password validation
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .trim(),

  // Role validation
  body('role')
    .isIn(['student', 'teacher', 'parent'])
    .withMessage('Role must be one of: student, teacher, parent'),

  // First name validation
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters')
    .trim(),

  // Last name validation
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters')
    .trim(),
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  // Email validation
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),

  // Password validation (just check if present)
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .trim(),
];

/**
 * Middleware to handle validation errors
 *
 * This should be used after validation rules to check if there are any errors
 * and return them in a consistent format
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg
      }))
    });
    return;
  }

  next();
};
