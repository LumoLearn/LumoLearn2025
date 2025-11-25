import { Request, Response } from 'express';
import { AppDataSource } from '../config/typeorm.config';
import { Student, AccessibilitySettings } from '../entities/Student.entity';

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
 * Get accessibility settings for a student
 * 
 * GET /api/students/:id/settings
 * 
 * @access Protected (Student can only access their own settings, Parent can access their children's settings)
 */
export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Get student repository
    const studentRepo = AppDataSource.getRepository(Student);

    // Find student by student ID or user ID
    let student = await studentRepo.findOne({
      where: { id },
      relations: ['user']
    });

    // If not found by student ID, try by user ID
    if (!student) {
      student = await studentRepo.findOne({
        where: { userId: id },
        relations: ['user']
      });
    }

    if (!student) {
      res.status(404).json({
        success: false,
        error: 'Student not found'
      });
      return;
    }

    // Authorization check: Student can only access their own settings
    // TODO: Add parent authorization when parent-student relationship is implemented
    if (currentUser.role === 'student' && student.userId !== currentUser.userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own settings.'
      });
      return;
    }

    // Return accessibility settings
    res.status(200).json({
      success: true,
      settings: student.accessibilitySettings || {
        font_family: 'Arial',
        font_size: 16,
        line_spacing: 1.5,
        letter_spacing: 0,
        text_color: '#000000',
        background_color: '#FFFFFF'
      }
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
};

/**
 * Update accessibility settings for a student
 * 
 * PUT /api/students/:id/settings
 * 
 * Request body:
 * {
 *   font_family?: string,
 *   font_size?: number,
 *   line_spacing?: number,
 *   letter_spacing?: number,
 *   text_color?: string,
 *   background_color?: string
 * }
 * 
 * @access Protected (Student can only update their own settings)
 */
export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const newSettings = req.body;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Get student repository
    const studentRepo = AppDataSource.getRepository(Student);

    // Find student by student ID or user ID
    let student = await studentRepo.findOne({
      where: { id },
      relations: ['user']
    });

    // If not found by student ID, try by user ID
    if (!student) {
      student = await studentRepo.findOne({
        where: { userId: id },
        relations: ['user']
      });
    }

    if (!student) {
      res.status(404).json({
        success: false,
        error: 'Student not found'
      });
      return;
    }

    // Authorization check: Student can only update their own settings
    if (currentUser.role === 'student' && student.userId !== currentUser.userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You can only update your own settings.'
      });
      return;
    }

    // Merge existing settings with new settings
    const currentSettings = student.accessibilitySettings || {
      font_family: 'Arial',
      font_size: 16,
      line_spacing: 1.5,
      letter_spacing: 0,
      text_color: '#000000',
      background_color: '#FFFFFF'
    };

    const updatedSettings: AccessibilitySettings = {
      ...currentSettings,
      ...newSettings
    };

    // Update student settings
    student.accessibilitySettings = updatedSettings;
    await studentRepo.save(student);

    // Return updated settings
    res.status(200).json({
      success: true,
      settings: updatedSettings
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
};

