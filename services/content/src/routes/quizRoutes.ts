import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  createQuiz,
  getQuizById,
  listQuizzes,
  getPublishedQuizzes,
  updateQuiz,
  publishQuiz,
  unpublishQuiz,
  deleteQuizById,
} from '../controllers/quizController';

/**
 * Quiz Routes
 *
 * All routes for quiz management
 *
 * BE-013: Quiz CRUD endpoints
 */

const router = Router();

/**
 * @route   GET /api/quizzes/published
 * @desc    Get all published quizzes (for students)
 * @access  Protected (Any authenticated user)
 */
router.get('/published', authenticateToken, getPublishedQuizzes);

/**
 * @route   POST /api/quizzes
 * @desc    Create a new quiz
 * @access  Protected (Teacher only)
 */
router.post(
  '/',
  authenticateToken,
  requireRole(['teacher']),
  createQuiz
);

/**
 * @route   GET /api/quizzes
 * @desc    Get all quizzes for the authenticated teacher
 * @access  Protected (Teacher only)
 */
router.get(
  '/',
  authenticateToken,
  requireRole(['teacher']),
  listQuizzes
);

/**
 * @route   GET /api/quizzes/:id
 * @desc    Get a single quiz by ID with questions
 * @access  Protected (Owner gets answers, students get quiz without answers)
 */
router.get('/:id', authenticateToken, getQuizById);

/**
 * @route   PUT /api/quizzes/:id
 * @desc    Update a quiz (title, questions, metadata)
 * @access  Protected (Teacher who owns the quiz)
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole(['teacher']),
  updateQuiz
);

/**
 * @route   POST /api/quizzes/:id/publish
 * @desc    Publish a quiz
 * @access  Protected (Teacher who owns the quiz)
 */
router.post(
  '/:id/publish',
  authenticateToken,
  requireRole(['teacher']),
  publishQuiz
);

/**
 * @route   POST /api/quizzes/:id/unpublish
 * @desc    Unpublish a quiz
 * @access  Protected (Teacher who owns the quiz)
 */
router.post(
  '/:id/unpublish',
  authenticateToken,
  requireRole(['teacher']),
  unpublishQuiz
);

/**
 * @route   DELETE /api/quizzes/:id
 * @desc    Delete a quiz
 * @access  Protected (Teacher who owns the quiz)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRole(['teacher']),
  deleteQuizById
);

export default router;
