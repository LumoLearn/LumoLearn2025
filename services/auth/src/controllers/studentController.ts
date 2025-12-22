import { Request, Response } from 'express';
import { AppDataSource } from '../config/typeorm.config';
import { Student, AccessibilitySettings } from '../entities/Student.entity';
import { QuizAttempt } from '../entities/QuizAttempt.entity';
import { Quiz } from '../entities/Quiz.entity';
import { Parent } from '../entities/Parent.entity';
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

/**
 * Get student progress and analytics
 * 
 * GET /api/students/:id/progress
 * 
 * Returns:
 * - Total number of quiz attempts
 * - Average score across all quizzes
 * - Total number of unique quizzes taken
 * - Recent quiz attempts with details
 * - Performance statistics
 * 
 * @access Protected (Student can access their own progress, Parent can access their children's progress)
 */
export const getStudentProgress = async (req: AuthRequest, res: Response): Promise<void> => {
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

    // Get repositories
    const studentRepo = AppDataSource.getRepository(Student);
    const quizAttemptRepo = AppDataSource.getRepository(QuizAttempt);
    const parentRepo = AppDataSource.getRepository(Parent);

    // Find student by student ID or user ID
    let student = await studentRepo.findOne({
      where: { id },
      relations: ['user', 'user.profile']
    });

    // If not found by student ID, try by user ID
    if (!student) {
      student = await studentRepo.findOne({
        where: { userId: id },
        relations: ['user', 'user.profile']
      });
    }

    if (!student) {
      res.status(404).json({
        success: false,
        error: 'Student not found'
      });
      return;
    }

    // Authorization check
    let isAuthorized = false;

    // Student can access their own progress
    if (currentUser.role === 'student' && student.userId === currentUser.userId) {
      isAuthorized = true;
    }

    // Parent can access their children's progress
    if (currentUser.role === 'parent') {
      const parent = await parentRepo.findOne({
        where: { userId: currentUser.userId },
        relations: ['students']
      });

      if (parent) {
        const isChild = parent.students.some(s => s.id === student.id);
        if (isChild) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own progress or your children\'s progress.'
      });
      return;
    }

    // Fetch all quiz attempts for this student
    const attempts = await quizAttemptRepo.find({
      where: { studentId: student.id },
      relations: ['quiz'],
      order: { submittedAt: 'DESC' }
    });

    // Calculate statistics
    const totalAttempts = attempts.length;

    // Calculate average score as percentage (only from attempts with non-null scores and totalQuestions)
    const attemptsWithScores = attempts.filter(a => a.score !== null && a.totalQuestions !== null && a.totalQuestions > 0);
    const percentages = attemptsWithScores.map(a => Math.round(((a.score || 0) / (a.totalQuestions || 1)) * 100));
    const totalPercentage = percentages.reduce((sum, p) => sum + p, 0);
    const averageScore = attemptsWithScores.length > 0
      ? Math.round((totalPercentage / attemptsWithScores.length) * 100) / 100
      : 0;

    // Count unique quizzes taken
    const uniqueQuizIds = new Set(attempts.map(a => a.quizId));
    const totalQuizzesTaken = uniqueQuizIds.size;

    // Get recent attempts (last 10)
    const recentAttempts = attempts.slice(0, 10).map(attempt => {
      const score = attempt.score || 0;
      const totalQuestions = attempt.totalQuestions || 0;
      const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

      return {
        id: attempt.id,
        quizId: attempt.quizId,
        quizTitle: attempt.quiz?.title || 'Unknown Quiz',
        score: score,
        totalQuestions: totalQuestions,
        percentage: percentage,
        submittedAt: attempt.submittedAt,
        answers: attempt.answers
      };
    });

    // Calculate performance statistics
    // Group attempts by score ranges (based on percentage)
    const scoreRanges = {
      excellent: 0,  // 90-100%
      good: 0,       // 70-89%
      average: 0,    // 50-69%
      needsWork: 0   // 0-49%
    };

    attemptsWithScores.forEach(attempt => {
      const percentage = Math.round(((attempt.score || 0) / (attempt.totalQuestions || 1)) * 100);
      if (percentage >= 90) scoreRanges.excellent++;
      else if (percentage >= 70) scoreRanges.good++;
      else if (percentage >= 50) scoreRanges.average++;
      else scoreRanges.needsWork++;
    });

    // Calculate completion rate (percentage of attempts with scores)
    const completionRate = totalAttempts > 0
      ? Math.round((attemptsWithScores.length / totalAttempts) * 100)
      : 0;

    // Find best and worst performances (based on percentage)
    const sortedByPercentage = [...attemptsWithScores].sort((a, b) => {
      const percentageA = ((a.score || 0) / (a.totalQuestions || 1)) * 100;
      const percentageB = ((b.score || 0) / (b.totalQuestions || 1)) * 100;
      return percentageB - percentageA;
    });

    const bestPerformance = sortedByPercentage.length > 0 ? {
      id: sortedByPercentage[0].id,
      quizId: sortedByPercentage[0].quizId,
      quizTitle: sortedByPercentage[0].quiz?.title || 'Unknown Quiz',
      score: sortedByPercentage[0].score || 0,
      totalQuestions: sortedByPercentage[0].totalQuestions || 0,
      percentage: Math.round(((sortedByPercentage[0].score || 0) / (sortedByPercentage[0].totalQuestions || 1)) * 100),
      submittedAt: sortedByPercentage[0].submittedAt
    } : null;

    const worstPerformance = sortedByPercentage.length > 0 ? {
      id: sortedByPercentage[sortedByPercentage.length - 1].id,
      quizId: sortedByPercentage[sortedByPercentage.length - 1].quizId,
      quizTitle: sortedByPercentage[sortedByPercentage.length - 1].quiz?.title || 'Unknown Quiz',
      score: sortedByPercentage[sortedByPercentage.length - 1].score || 0,
      totalQuestions: sortedByPercentage[sortedByPercentage.length - 1].totalQuestions || 0,
      percentage: Math.round(((sortedByPercentage[sortedByPercentage.length - 1].score || 0) / (sortedByPercentage[sortedByPercentage.length - 1].totalQuestions || 1)) * 100),
      submittedAt: sortedByPercentage[sortedByPercentage.length - 1].submittedAt
    } : null;

    // Calculate trend (comparing recent vs older attempts based on percentage)
    const halfPoint = Math.floor(attemptsWithScores.length / 2);
    let trend: 'improving' | 'declining' | 'stable' | 'insufficient_data' = 'insufficient_data';

    if (attemptsWithScores.length >= 4) {
      const recentPercentages = attemptsWithScores.slice(0, halfPoint)
        .map(a => ((a.score || 0) / (a.totalQuestions || 1)) * 100);
      const olderPercentages = attemptsWithScores.slice(halfPoint)
        .map(a => ((a.score || 0) / (a.totalQuestions || 1)) * 100);

      const recentAvg = recentPercentages.reduce((sum, p) => sum + p, 0) / recentPercentages.length;
      const olderAvg = olderPercentages.reduce((sum, p) => sum + p, 0) / olderPercentages.length;

      const difference = recentAvg - olderAvg;
      if (difference > 5) trend = 'improving';
      else if (difference < -5) trend = 'declining';
      else trend = 'stable';
    }

    // Response
    res.status(200).json({
      success: true,
      studentId: student.id,
      studentName: `${student.user.profile?.firstName || ''} ${student.user.profile?.lastName || ''}`.trim() || 'Unknown Student',
      totalAttempts,
      totalQuizzesTaken,
      averageScore,
      completionRate,
      recentAttempts,
      statistics: {
        scoreDistribution: scoreRanges,
        bestPerformance,
        worstPerformance,
        trend
      }
    });

  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
};

