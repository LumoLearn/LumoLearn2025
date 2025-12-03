/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import {
  saveQuizContentToMongo,
  createQuizInPostgres,
  getQuizWithContent,
  listQuizzes as listQuizzesService,
  updateQuizInPostgres,
  updateQuizContentInMongo,
  deleteQuiz,
  isQuizOwner,
  getTeacherIdByUserId,
  getStudentIdByUserId,
  submitQuizAnswers,
  QuizQuestion,
} from '../services/quizService';

/**
 * Quiz Controller
 *
 * Handles quiz-related operations:
 * - BE-013: Quiz CRUD (Create, Read, Update, Publish)
 */

/**
 * Create a new quiz
 *
 * POST /api/quizzes
 *
 * @body title - Quiz title
 * @body questions - Array of quiz questions with options and correct answers
 * @body lessonId - Optional lesson ID to associate quiz with
 * @body metadata - Optional metadata (difficulty, numQuestions, generatedBy)
 *
 * @access Protected (Teacher only)
 */
export const createQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate user authentication
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Get teacher ID from user ID
    const teacherId = await getTeacherIdByUserId(req.user.userId);
    if (!teacherId) {
      res.status(403).json({
        success: false,
        error: 'User is not registered as a teacher',
      });
      return;
    }

    // Validate title
    const title = req.body.title?.trim();
    if (!title) {
      res.status(400).json({
        success: false,
        error: 'Title is required',
      });
      return;
    }

    if (title.length > 255) {
      res.status(400).json({
        success: false,
        error: 'Title must be less than 255 characters',
      });
      return;
    }

    // Validate questions
    const questions: QuizQuestion[] = req.body.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Questions array is required and must not be empty',
      });
      return;
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || typeof q.question !== 'string') {
        res.status(400).json({
          success: false,
          error: `Question ${i + 1}: question text is required`,
        });
        return;
      }

      if (!Array.isArray(q.options) || q.options.length < 2) {
        res.status(400).json({
          success: false,
          error: `Question ${i + 1}: at least 2 options are required`,
        });
        return;
      }

      if (!q.correctAnswer || typeof q.correctAnswer !== 'string') {
        res.status(400).json({
          success: false,
          error: `Question ${i + 1}: correctAnswer is required`,
        });
        return;
      }
    }

    // Optional lesson ID
    const lessonId = req.body.lessonId || undefined;

    // Optional metadata
    const metadata = req.body.metadata || {};

    console.log(`Creating quiz: ${title} with ${questions.length} questions`);

    // Save questions to MongoDB
    const contentId = await saveQuizContentToMongo(questions, metadata);
    console.log(`Quiz content saved to MongoDB with ID: ${contentId}`);

    // Create quiz record in PostgreSQL
    const quiz = await createQuizInPostgres(teacherId, title, contentId, lessonId);
    console.log(`Quiz created in PostgreSQL with ID: ${quiz.id}`);

    res.status(201).json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        lessonId: quiz.lessonId,
        status: quiz.status,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    next(error);
  }
};

/**
 * Get a single quiz by ID
 *
 * GET /api/quizzes/:id
 *
 * @param id - Quiz ID
 * @query includeAnswers - Whether to include correct answers (default: true for teachers)
 *
 * @access Protected
 */
export const getQuizById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate user authentication
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const quizId = req.params.id;
    const includeAnswers = req.query.includeAnswers !== 'false'; // Default true

    // Get quiz with content
    const quiz = await getQuizWithContent(quizId, includeAnswers);

    if (!quiz) {
      res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error('Error getting quiz:', error);
    next(error);
  }
};

/**
 * List quizzes
 *
 * GET /api/quizzes
 *
 * @query lessonId - Filter by lesson ID
 * @query status - Filter by status (draft, published)
 * @query limit - Number of quizzes to return (default: 20)
 * @query offset - Number of quizzes to skip (default: 0)
 * @query sortBy - Sort field (created_at, updated_at, title)
 * @query sortOrder - Sort order (ASC, DESC)
 *
 * @access Protected (Teacher only for their quizzes)
 */
export const listQuizzes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate user authentication
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Get teacher ID from user ID
    const teacherId = await getTeacherIdByUserId(req.user.userId);
    if (!teacherId) {
      res.status(403).json({
        success: false,
        error: 'User is not registered as a teacher',
      });
      return;
    }

    // Parse query parameters
    const lessonId = req.query.lessonId as string | undefined;
    const status = req.query.status as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const sortBy = (req.query.sortBy as 'created_at' | 'updated_at' | 'title') || 'created_at';
    const sortOrder = (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC';

    // Get quizzes
    const result = await listQuizzesService({
      teacherId,
      lessonId,
      status,
      limit,
      offset,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      quizzes: result.quizzes,
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error listing quizzes:', error);
    next(error);
  }
};

/**
 * Get published quizzes (for students)
 *
 * GET /api/quizzes/published
 *
 * @query lessonId - Filter by lesson ID
 * @query limit - Number of quizzes to return (default: 20)
 * @query offset - Number of quizzes to skip (default: 0)
 *
 * @access Protected (All authenticated users)
 */
export const getPublishedQuizzes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate user authentication
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Parse query parameters
    const lessonId = req.query.lessonId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // Get published quizzes (without correct answers)
    const result = await listQuizzesService({
      status: 'published',
      lessonId,
      limit,
      offset,
      sortBy: 'created_at',
      sortOrder: 'DESC',
    });

    res.status(200).json({
      success: true,
      quizzes: result.quizzes,
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error getting published quizzes:', error);
    next(error);
  }
};

/**
 * Update a quiz
 *
 * PUT /api/quizzes/:id
 *
 * @param id - Quiz ID
 * @body title - Updated quiz title (optional)
 * @body questions - Updated questions array (optional)
 * @body lessonId - Updated lesson ID (optional)
 * @body metadata - Updated metadata (optional)
 *
 * @access Protected (Teacher only, must own the quiz)
 */
export const updateQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate user authentication
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Get teacher ID from user ID
    const teacherId = await getTeacherIdByUserId(req.user.userId);
    if (!teacherId) {
      res.status(403).json({
        success: false,
        error: 'User is not registered as a teacher',
      });
      return;
    }

    const quizId = req.params.id;

    // Check ownership
    const isOwner = await isQuizOwner(quizId, teacherId);
    if (!isOwner) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to update this quiz',
      });
      return;
    }

    // Get current quiz to get contentId
    const currentQuiz = await getQuizWithContent(quizId);
    if (!currentQuiz) {
      res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
      return;
    }

    // Update PostgreSQL metadata
    const metadataUpdates: any = {};
    if (req.body.title !== undefined) {
      const title = req.body.title.trim();
      if (title.length > 255) {
        res.status(400).json({
          success: false,
          error: 'Title must be less than 255 characters',
        });
        return;
      }
      metadataUpdates.title = title;
    }

    if (req.body.lessonId !== undefined) {
      metadataUpdates.lessonId = req.body.lessonId || null;
    }

    let updatedQuiz = currentQuiz;
    if (Object.keys(metadataUpdates).length > 0) {
      const result = await updateQuizInPostgres(quizId, metadataUpdates);
      if (result) {
        updatedQuiz = { ...updatedQuiz, ...result };
      }
    }

    // Update MongoDB content (questions)
    if (req.body.questions !== undefined) {
      const questions: QuizQuestion[] = req.body.questions;

      // Validate questions
      if (!Array.isArray(questions) || questions.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Questions array must not be empty',
        });
        return;
      }

      // Validate each question
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question || !Array.isArray(q.options) || !q.correctAnswer) {
          res.status(400).json({
            success: false,
            error: `Question ${i + 1}: invalid format`,
          });
          return;
        }
      }

      if (currentQuiz.contentId) {
        const metadata = req.body.metadata || updatedQuiz.quizMetadata;
        await updateQuizContentInMongo(currentQuiz.contentId, questions, metadata);
      }
    }

    // Get updated quiz with content
    const finalQuiz = await getQuizWithContent(quizId);

    res.status(200).json({
      success: true,
      quiz: finalQuiz,
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    next(error);
  }
};

/**
 * Publish a quiz
 *
 * POST /api/quizzes/:id/publish
 *
 * @param id - Quiz ID
 *
 * @access Protected (Teacher only, must own the quiz)
 */
export const publishQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate user authentication
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Get teacher ID from user ID
    const teacherId = await getTeacherIdByUserId(req.user.userId);
    if (!teacherId) {
      res.status(403).json({
        success: false,
        error: 'User is not registered as a teacher',
      });
      return;
    }

    const quizId = req.params.id;

    // Check ownership
    const isOwner = await isQuizOwner(quizId, teacherId);
    if (!isOwner) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to publish this quiz',
      });
      return;
    }

    // Update status to published
    const updatedQuiz = await updateQuizInPostgres(quizId, { status: 'published' });

    if (!updatedQuiz) {
      res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Quiz published successfully',
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error('Error publishing quiz:', error);
    next(error);
  }
};

/**
 * Unpublish a quiz
 *
 * POST /api/quizzes/:id/unpublish
 *
 * @param id - Quiz ID
 *
 * @access Protected (Teacher only, must own the quiz)
 */
export const unpublishQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate user authentication
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Get teacher ID from user ID
    const teacherId = await getTeacherIdByUserId(req.user.userId);
    if (!teacherId) {
      res.status(403).json({
        success: false,
        error: 'User is not registered as a teacher',
      });
      return;
    }

    const quizId = req.params.id;

    // Check ownership
    const isOwner = await isQuizOwner(quizId, teacherId);
    if (!isOwner) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to unpublish this quiz',
      });
      return;
    }

    // Update status to draft
    const updatedQuiz = await updateQuizInPostgres(quizId, { status: 'draft' });

    if (!updatedQuiz) {
      res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Quiz unpublished successfully',
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error('Error unpublishing quiz:', error);
    next(error);
  }
};

/**
 * Delete a quiz
 *
 * DELETE /api/quizzes/:id
 *
 * @param id - Quiz ID
 *
 * @access Protected (Teacher only, must own the quiz)
 */
export const deleteQuizById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate user authentication
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Get teacher ID from user ID
    const teacherId = await getTeacherIdByUserId(req.user.userId);
    if (!teacherId) {
      res.status(403).json({
        success: false,
        error: 'User is not registered as a teacher',
      });
      return;
    }

    const quizId = req.params.id;

    // Check ownership
    const isOwner = await isQuizOwner(quizId, teacherId);
    if (!isOwner) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this quiz',
      });
      return;
    }

    // Delete quiz
    const deleted = await deleteQuiz(quizId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    next(error);
  }
};

/**
 * Submit quiz answers (BE-014)
 *
 * POST /api/quizzes/:id/submit
 *
 * @param id - Quiz ID
 * @body answers - Object with answers in format { "question1": "A", "question2": "B", ... }
 *
 * @access Protected (Student only)
 */
export const submitQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate user authentication
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Get student ID from user ID
    const studentId = await getStudentIdByUserId(req.user.userId);
    if (!studentId) {
      res.status(403).json({
        success: false,
        error: 'User is not registered as a student',
      });
      return;
    }

    const quizId = req.params.id;

    // Validate answers
    const answers = req.body.answers;
    if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
      res.status(400).json({
        success: false,
        error: 'Answers object is required and must not be empty',
      });
      return;
    }

    // Submit quiz and calculate results
    const result = await submitQuizAnswers(quizId, studentId, answers);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error submitting quiz:', error);

    // Handle specific errors
    if (error.message === 'Quiz not found or has no questions') {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    if (error.message === 'Quiz is not published yet') {
      res.status(403).json({
        success: false,
        error: error.message,
      });
      return;
    }

    next(error);
  }
};
