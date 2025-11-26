import { Router } from 'express';
import {
  uploadLesson,
  getLessons,
  getLessonById,
} from '../controllers/lessonController';

/**
 * Lesson Routes
 *
 * Routes for lesson management (upload, retrieval, etc.)
 * Full implementation in BE-008 and BE-009
 */

const router = Router();

// Placeholder routes - will be fully implemented in BE-008 and BE-009
router.post('/upload', uploadLesson);
router.get('/', getLessons);
router.get('/:id', getLessonById);

export default router;
