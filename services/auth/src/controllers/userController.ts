import { Request, Response } from 'express';
import { AppDataSource } from '../config/typeorm.config';
import { User } from '../entities/User.entity';
import { Profile } from '../entities/Profile.entity';
import { Student } from '../entities/Student.entity';
import { Teacher } from '../entities/Teacher.entity';
import { Parent } from '../entities/Parent.entity';

/**
 * Extended Request interface with user property from auth middleware
 */
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'student' | 'teacher' | 'parent';
  };
}

/**
 * Get profile for currently logged-in user
 *
 * GET /api/users/profile
 *
 * @access Protected (Any authenticated user can access their own profile)
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Get repositories
    const userRepo = AppDataSource.getRepository(User);
    const profileRepo = AppDataSource.getRepository(Profile);

    // Find user with profile
    const user = await userRepo.findOne({
      where: { id: currentUser.userId },
      relations: ['profile']
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Base response with user and profile data
    const responseData: any = {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: {
        firstName: user.profile?.firstName || null,
        lastName: user.profile?.lastName || null
      }
    };

    // Fetch role-specific data dynamically based on user role
    if (user.role === 'student') {
      const studentRepo = AppDataSource.getRepository(Student);
      const student = await studentRepo.findOne({
        where: { userId: user.id }
      });

      if (student) {
        responseData.student = {
          id: student.id,
          accessibilitySettings: student.accessibilitySettings || {
            font_family: 'Arial',
            font_size: 16,
            line_spacing: 1.5,
            letter_spacing: 0,
            text_color: '#000000',
            background_color: '#FFFFFF'
          }
        };
      }
    } else if (user.role === 'teacher') {
      const teacherRepo = AppDataSource.getRepository(Teacher);
      const teacher = await teacherRepo.findOne({
        where: { userId: user.id }
      });

      if (teacher) {
        responseData.teacher = {
          id: teacher.id
        };
      }
    } else if (user.role === 'parent') {
      const parentRepo = AppDataSource.getRepository(Parent);
      const parent = await parentRepo.findOne({
        where: { userId: user.id },
        relations: ['students']
      });

      if (parent) {
        responseData.parent = {
          id: parent.id,
          childrenCount: parent.students?.length || 0
        };
      }
    }

    // Return complete profile with role-specific data
    res.status(200).json(responseData);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
};

/**
 * Update profile for currently logged-in user
 *
 * PUT /api/users/profile
 *
 * Request body:
 * {
 *   firstName?: string,
 *   lastName?: string
 * }
 *
 * @access Protected (Any authenticated user can update their own profile)
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUser = req.user;
    const { firstName, lastName } = req.body;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Validate that at least one field is provided
    if (!firstName && !lastName) {
      res.status(400).json({
        success: false,
        error: 'At least one field (firstName or lastName) must be provided'
      });
      return;
    }

    // Get repositories
    const userRepo = AppDataSource.getRepository(User);
    const profileRepo = AppDataSource.getRepository(Profile);

    // Find user with profile
    const user = await userRepo.findOne({
      where: { id: currentUser.userId },
      relations: ['profile']
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // If profile doesn't exist, create it (edge case, should exist from registration)
    if (!user.profile) {
      const newProfile = profileRepo.create({
        userId: user.id,
        firstName: firstName || null,
        lastName: lastName || null
      });
      await profileRepo.save(newProfile);

      res.status(200).json({
        success: true,
        profile: {
          firstName: newProfile.firstName,
          lastName: newProfile.lastName
        }
      });
      return;
    }

    // Update profile dynamically (only fields that are provided)
    if (firstName !== undefined) {
      user.profile.firstName = firstName;
    }
    if (lastName !== undefined) {
      user.profile.lastName = lastName;
    }

    // Save updated profile
    await profileRepo.save(user.profile);

    // Return updated profile
    res.status(200).json({
      success: true,
      profile: {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
};
