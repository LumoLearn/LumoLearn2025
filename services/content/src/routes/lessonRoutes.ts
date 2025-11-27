import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  uploadLesson,
  getLessons,
  getLessonById,
  publishLesson,
  unpublishLesson,
  updateLessonTitle,
  deleteLessonById,
  getPublishedLessons,
} from '../controllers/lessonController';

/**
 * Lesson Routes
 *
 * All routes for lesson management
 * 
 * BE-008: Upload endpoint
 * BE-009: Get lessons endpoints
 * BE-010: Publish endpoint (bonus)
 */

const router = Router();

/**
 * @route   GET /api/lessons/published
 * @desc    Get all published lessons (for students)
 * @access  Protected (Any authenticated user)
 */
router.get('/published', authenticateToken, getPublishedLessons);

/**
 * @route   POST /api/lessons/upload
 * @desc    Upload a new lesson (Word/PDF)
 * @access  Protected (Teacher only)
 */
router.post(
  '/upload',
  authenticateToken,
  requireRole(['teacher']),
  uploadLesson
);

/**
 * @route   GET /api/lessons
 * @desc    Get all lessons for the authenticated teacher
 * @access  Protected (Teacher only)
 */
router.get(
  '/',
  authenticateToken,
  requireRole(['teacher']),
  getLessons
);

/**
 * @route   GET /api/lessons/:id
 * @desc    Get a single lesson by ID with content
 * @access  Protected (Owner or any user if published)
 */
router.get('/:id', authenticateToken, getLessonById);

/**
 * @route   PUT /api/lessons/:id
 * @desc    Update lesson title
 * @access  Protected (Teacher who owns the lesson)
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole(['teacher']),
  updateLessonTitle
);

/**
 * @route   PUT /api/lessons/:id/publish
 * @desc    Publish a lesson
 * @access  Protected (Teacher who owns the lesson)
 */
router.put(
  '/:id/publish',
  authenticateToken,
  requireRole(['teacher']),
  publishLesson
);

/**
 * @route   PUT /api/lessons/:id/unpublish
 * @desc    Unpublish a lesson
 * @access  Protected (Teacher who owns the lesson)
 */
router.put(
  '/:id/unpublish',
  authenticateToken,
  requireRole(['teacher']),
  unpublishLesson
);

/**
 * @route   DELETE /api/lessons/:id
 * @desc    Delete a lesson
 * @access  Protected (Teacher who owns the lesson)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRole(['teacher']),
  deleteLessonById
);

export default router;
