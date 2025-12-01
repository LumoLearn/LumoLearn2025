import { Router } from 'express';
import { body } from 'express-validator';
import { generateQuiz, testConnection } from '../controllers/aiController';

const router = Router();

/**
 * POST /api/ai/generate-quiz
 * Generate quiz questions from lesson content
 */
router.post(
  '/generate-quiz',
  [
    body('lessonContent')
      .notEmpty()
      .withMessage('Lesson content is required')
      .isString()
      .withMessage('Lesson content must be a string')
      .isLength({ min: 50 })
      .withMessage('Lesson content must be at least 50 characters'),
    body('numQuestions')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Number of questions must be between 1 and 20'),
    body('difficulty')
      .optional()
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Difficulty must be: easy, medium, or hard')
  ],
  generateQuiz
);

/**
 * GET /api/ai/test
 * Test Gemini API connection
 */
router.get('/test', testConnection);

export default router;
