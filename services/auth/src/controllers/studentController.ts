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
    
    // Calculate average score (only from attempts with non-null scores)
    const attemptsWithScores = attempts.filter(a => a.score !== null);
    const totalScore = attemptsWithScores.reduce((sum, a) => sum + (a.score || 0), 0);
    const averageScore = attemptsWithScores.length > 0 
      ? Math.round((totalScore / attemptsWithScores.length) * 100) / 100 
      : 0;

    // Count unique quizzes taken
    const uniqueQuizIds = new Set(attempts.map(a => a.quizId));
    const totalQuizzesTaken = uniqueQuizIds.size;

    // Get recent attempts (last 10)
    const recentAttempts = attempts.slice(0, 10).map(attempt => ({
      id: attempt.id,
      quizId: attempt.quizId,
      quizTitle: attempt.quiz?.title || 'Unknown Quiz',
      score: attempt.score,
      submittedAt: attempt.submittedAt,
      answers: attempt.answers
    }));

    // Calculate performance statistics
    // Group attempts by score ranges
    const scoreRanges = {
      excellent: 0,  // 90-100
      good: 0,       // 70-89
      average: 0,    // 50-69
      needsWork: 0   // 0-49
    };

    attemptsWithScores.forEach(attempt => {
      const score = attempt.score || 0;
      if (score >= 90) scoreRanges.excellent++;
      else if (score >= 70) scoreRanges.good++;
      else if (score >= 50) scoreRanges.average++;
      else scoreRanges.needsWork++;
    });

    // Calculate completion rate (percentage of attempts with scores)
    const completionRate = totalAttempts > 0
      ? Math.round((attemptsWithScores.length / totalAttempts) * 100)
      : 0;

    // Find best and worst performances
    const sortedByScore = [...attemptsWithScores].sort((a, b) => (b.score || 0) - (a.score || 0));
    const bestPerformance = sortedByScore.length > 0 ? {
      quizTitle: sortedByScore[0].quiz?.title || 'Unknown Quiz',
      score: sortedByScore[0].score,
      date: sortedByScore[0].submittedAt
    } : null;

    const worstPerformance = sortedByScore.length > 0 ? {
      quizTitle: sortedByScore[sortedByScore.length - 1].quiz?.title || 'Unknown Quiz',
      score: sortedByScore[sortedByScore.length - 1].score,
      date: sortedByScore[sortedByScore.length - 1].submittedAt
    } : null;

    // Calculate trend (comparing recent vs older attempts)
    const halfPoint = Math.floor(attemptsWithScores.length / 2);
    let trend: 'improving' | 'declining' | 'stable' | 'insufficient_data' = 'insufficient_data';
    
    if (attemptsWithScores.length >= 4) {
      const recentAvg = attemptsWithScores.slice(0, halfPoint)
        .reduce((sum, a) => sum + (a.score || 0), 0) / halfPoint;
      const olderAvg = attemptsWithScores.slice(halfPoint)
        .reduce((sum, a) => sum + (a.score || 0), 0) / (attemptsWithScores.length - halfPoint);
      
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

