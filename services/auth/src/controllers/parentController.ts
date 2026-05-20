import { Request, Response } from 'express';
import { AppDataSource } from '../config/typeorm.config';
import { Parent } from '../entities/Parent.entity';
import { Student } from '../entities/Student.entity';
import { User } from '../entities/User.entity';
import { Profile } from '../entities/Profile.entity';

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
 * Link a student to a parent
 *
 * POST /api/parents/link-student
 *
 * Request body:
 * {
 *   studentId: string (UUID) - The student's user ID or student entity ID
 * }
 *
 * @access Protected (Parent only)
 */
export const linkStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUser = req.user;
    const { studentId } = req.body;

    // Authentication check
    if (!currentUser) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Authorization check: Only parents can link students
    if (currentUser.role !== 'parent') {
      res.status(403).json({
        success: false,
        error: 'Access denied. Only parents can link students.'
      });
      return;
    }

    // Validate studentId
    if (!studentId) {
      res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
      return;
    }

    // Get repositories
    const parentRepo = AppDataSource.getRepository(Parent);
    const studentRepo = AppDataSource.getRepository(Student);

    // Find parent by current user's userId
    const parent = await parentRepo.findOne({
      where: { userId: currentUser.userId },
      relations: ['students']
    });

    if (!parent) {
      res.status(404).json({
        success: false,
        error: 'Parent profile not found'
      });
      return;
    }

    // Find student by student ID or user ID
    let student = await studentRepo.findOne({
      where: { id: studentId },
      relations: ['user']
    });

    // If not found by student entity ID, try by user ID
    if (!student) {
      student = await studentRepo.findOne({
        where: { userId: studentId },
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

    // Check if student is already linked to this parent
    const isAlreadyLinked = parent.students.some(s => s.id === student.id);

    if (isAlreadyLinked) {
      res.status(400).json({
        success: false,
        error: 'Student is already linked to this parent'
      });
      return;
    }

    // Add student to parent's students array
    parent.students.push(student);
    await parentRepo.save(parent);

    res.status(201).json({
      success: true,
      message: 'Student linked successfully',
      student: {
        id: student.id,
        userId: student.userId
      }
    });

  } catch (error) {
    console.error('Link student error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
};

/**
 * Get all children (students) linked to a parent
 *
 * GET /api/parents/children
 *
 * @access Protected (Parent only)
 */
export const getChildren = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUser = req.user;

    // Authentication check
    if (!currentUser) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Authorization check: Only parents can view their children
    if (currentUser.role !== 'parent') {
      res.status(403).json({
        success: false,
        error: 'Access denied. Only parents can view their children.'
      });
      return;
    }

    // Get parent repository
    const parentRepo = AppDataSource.getRepository(Parent);

    // Find parent with students and their related data
    const parent = await parentRepo.findOne({
      where: { userId: currentUser.userId },
      relations: ['students', 'students.user', 'students.user.profile']
    });

    if (!parent) {
      res.status(404).json({
        success: false,
        error: 'Parent profile not found'
      });
      return;
    }

    // Map students to a clean response format
    const children = parent.students.map(student => ({
      id: student.id,
      userId: student.userId,
      email: student.user.email,
      firstName: student.user.profile?.firstName || '',
      lastName: student.user.profile?.lastName || '',
      accessibilitySettings: student.accessibilitySettings
    }));

    res.status(200).json({
      success: true,
      children
    });

  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
};
