import { Request, Response } from 'express';

/**
 * Lesson Controller
 *
 * Handles lesson-related operations (upload, retrieval, etc.)
 * Full implementation will be done in BE-008 and BE-009
 */

/**
 * Placeholder for lesson upload endpoint
 *
 * POST /api/lessons/upload
 *
 * Will be implemented in Task BE-008
 *
 * @access Protected (Teacher only)
 */
export const uploadLesson = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.status(501).json({
    success: false,
    error: 'Upload endpoint not yet implemented. Coming in BE-008.',
  });
};

/**
 * Placeholder for get lessons endpoint
 *
 * GET /api/lessons
 *
 * Will be implemented in Task BE-009
 *
 * @access Protected (Teacher only)
 */
export const getLessons = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.status(501).json({
    success: false,
    error: 'Get lessons endpoint not yet implemented. Coming in BE-009.',
  });
};

/**
 * Placeholder for get lesson by ID endpoint
 *
 * GET /api/lessons/:id
 *
 * Will be implemented in Task BE-009
 *
 * @access Protected
 */
export const getLessonById = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.status(501).json({
    success: false,
    error: 'Get lesson by ID endpoint not yet implemented. Coming in BE-009.',
  });
};
