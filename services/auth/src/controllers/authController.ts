import { Request, Response } from 'express';
import { createUser, findByEmail, verifyPassword } from '../models/User';
import { generateToken } from '../middleware/auth';

/**
 * Register a new user
 *
 * POST /api/auth/register
 *
 * Request body:
 * {
 *   email: string,
 *   password: string,
 *   role: 'student' | 'teacher' | 'parent',
 *   firstName: string,
 *   lastName: string
 * }
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await findByEmail(email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
      return;
    }

    // Create user (this handles password hashing, profile creation, and role record)
    const user = await createUser({
      email,
      password,
      role,
      firstName,
      lastName
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Return success response
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific database errors
    if (error instanceof Error) {
      // Unique constraint violation (email already exists)
      if (error.message.includes('duplicate key')) {
        res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
        return;
      }
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
};

/**
 * Login user
 *
 * POST /api/auth/login
 *
 * Request body:
 * {
 *   email: string,
 *   password: string
 * }
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await findByEmail(email);

    // If user doesn't exist or password is incorrect
    // Use the same error message for both cases (security best practice)
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Return success response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
};
