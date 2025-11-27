/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { parseFile } from '../services/fileService';
import {
  saveContentToMongo,
  createLessonInPostgres,
  getLessonWithContent,
  listLessons,
  updateLesson,
  deleteLesson,
  isLessonOwner,
  getTeacherIdByUserId,
  LessonMetadata,
} from '../services/lessonService';
import { upload } from '../config/multer';

/**
 * Lesson Controller
 *
 * Handles lesson-related operations:
 * - BE-008: Upload lesson (Word/PDF → HTML → MongoDB + PostgreSQL)
 * - BE-009: Get lessons (list and single)
 */

/**
 * Upload a new lesson
 *
 * POST /api/lessons/upload
 * Content-Type: multipart/form-data
 *
 * @body file - Word (.docx) or PDF (.pdf) file
 * @body title - Lesson title
 *
 * @access Protected (Teacher only)
 */
export const uploadLesson = [
  // Multer middleware for file upload
  upload.single('file'),
  
  // Controller logic
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      // Validate file
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded. Please upload a .docx or .pdf file.',
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

      console.log(`Processing upload: ${req.file.originalname} (${req.file.size} bytes)`);

      // Parse file to HTML
      const parsedContent = await parseFile(req.file.buffer, req.file.originalname);
      console.log(`File parsed successfully. HTML length: ${parsedContent.html.length}`);

      // Save content to MongoDB
      const contentId = await saveContentToMongo(parsedContent);
      console.log(`Content saved to MongoDB with ID: ${contentId}`);

      // Create lesson record in PostgreSQL
      const lesson = await createLessonInPostgres(teacherId, title, contentId);
      console.log(`Lesson created in PostgreSQL with ID: ${lesson.id}`);

      res.status(201).json({
        success: true,
        message: 'Lesson uploaded successfully',
        lesson: {
          id: lesson.id,
          title: lesson.title,
          contentId: lesson.contentId,
          teacherId: lesson.teacherId,
          isPublished: lesson.isPublished,
          createdAt: lesson.createdAt,
        },
        fileInfo: {
          originalName: req.file.originalname,
          size: req.file.size,
          type: parsedContent.metadata?.fileType,
        },
      });
    } catch (error) {
      console.error('Error uploading lesson:', error);
      next(error);
    }
  },
];

/**
 * Get all lessons for the authenticated teacher
 *
 * GET /api/lessons
 * @query isPublished - Filter by published status (optional)
 * @query limit - Number of results (default: 20, max: 100)
 * @query offset - Pagination offset (default: 0)
 * @query sortBy - Sort field: 'created_at' | 'title' (default: 'created_at')
 * @query sortOrder - Sort order: 'ASC' | 'DESC' (default: 'DESC')
 *
 * @access Protected (Teacher only)
 */
export const getLessons = async (
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
    const isPublishedParam = req.query.isPublished;
    let isPublished: boolean | undefined;
    if (isPublishedParam === 'true') {
      isPublished = true;
    } else if (isPublishedParam === 'false') {
      isPublished = false;
    }

    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string) || 20, 1),
      100
    );
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
    
    const sortBy = (req.query.sortBy as string) === 'title' ? 'title' : 'created_at';
    const sortOrder = (req.query.sortOrder as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Fetch lessons
    const { lessons, total } = await listLessons({
      teacherId,
      isPublished,
      limit,
      offset,
      sortBy,
      sortOrder,
    });

    res.json({
      success: true,
      lessons,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + lessons.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    next(error);
  }
};

/**
 * Get a single lesson by ID with content
 *
 * GET /api/lessons/:id
 *
 * @param id - Lesson UUID
 *
 * @access Protected (Teacher who owns the lesson, or any user if published)
 */
export const getLessonById = async (
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

    const lessonId = req.params.id;
    if (!lessonId) {
      res.status(400).json({
        success: false,
        error: 'Lesson ID is required',
      });
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(lessonId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid lesson ID format',
      });
      return;
    }

    // Fetch lesson with content
    const lesson = await getLessonWithContent(lessonId);
    if (!lesson) {
      res.status(404).json({
        success: false,
        error: 'Lesson not found',
      });
      return;
    }

    // Check access permissions
    // Teachers can view their own lessons (published or not)
    // Students can view only published lessons
    if (req.user.role === 'teacher') {
      const teacherId = await getTeacherIdByUserId(req.user.userId);
      if (lesson.teacherId !== teacherId && !lesson.isPublished) {
        res.status(403).json({
          success: false,
          error: 'Access denied. You can only view your own unpublished lessons.',
        });
        return;
      }
    } else if (!lesson.isPublished) {
      res.status(403).json({
        success: false,
        error: 'This lesson is not published yet',
      });
      return;
    }

    res.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        isPublished: lesson.isPublished,
        createdAt: lesson.createdAt,
        fileMetadata: lesson.fileMetadata,
      },
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    next(error);
  }
};

/**
 * Publish a lesson
 *
 * PUT /api/lessons/:id/publish
 *
 * @param id - Lesson UUID
 *
 * @access Protected (Teacher who owns the lesson)
 */
export const publishLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const lessonId = req.params.id;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(lessonId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid lesson ID format',
      });
      return;
    }

    // Check ownership
    const teacherId = await getTeacherIdByUserId(req.user.userId);
    if (!teacherId) {
      res.status(403).json({
        success: false,
        error: 'User is not registered as a teacher',
      });
      return;
    }

    const isOwner = await isLessonOwner(lessonId, teacherId);
    if (!isOwner) {
      res.status(403).json({
        success: false,
        error: 'You can only publish your own lessons',
      });
      return;
    }

    // Update lesson
    const updatedLesson = await updateLesson(lessonId, { isPublished: true });
    if (!updatedLesson) {
      res.status(404).json({
        success: false,
        error: 'Lesson not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Lesson published successfully',
      lesson: updatedLesson,
    });
  } catch (error) {
    console.error('Error publishing lesson:', error);
    next(error);
  }
};

/**
 * Unpublish a lesson
 *
 * PUT /api/lessons/:id/unpublish
 *
 * @param id - Lesson UUID
 *
 * @access Protected (Teacher who owns the lesson)
 */
export const unpublishLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const lessonId = req.params.id;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(lessonId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid lesson ID format',
      });
      return;
    }

    // Check ownership
    const teacherId = await getTeacherIdByUserId(req.user.userId);
    if (!teacherId) {
      res.status(403).json({
        success: false,
        error: 'User is not registered as a teacher',
      });
      return;
    }

    const isOwner = await isLessonOwner(lessonId, teacherId);
    if (!isOwner) {
      res.status(403).json({
        success: false,
        error: 'You can only unpublish your own lessons',
      });
      return;
    }

    // Update lesson
    const updatedLesson = await updateLesson(lessonId, { isPublished: false });
    if (!updatedLesson) {
      res.status(404).json({
        success: false,
        error: 'Lesson not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Lesson unpublished successfully',
      lesson: updatedLesson,
    });
  } catch (error) {
    console.error('Error unpublishing lesson:', error);
    next(error);
  }
};

/**
 * Update lesson title
 *
 * PUT /api/lessons/:id
 *
 * @param id - Lesson UUID
 * @body title - New lesson title
 *
 * @access Protected (Teacher who owns the lesson)
 */
export const updateLessonTitle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const lessonId = req.params.id;
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

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(lessonId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid lesson ID format',
      });
      return;
    }

    // Check ownership
    const teacherId = await getTeacherIdByUserId(req.user.userId);
    if (!teacherId) {
      res.status(403).json({
        success: false,
        error: 'User is not registered as a teacher',
      });
      return;
    }

    const isOwner = await isLessonOwner(lessonId, teacherId);
    if (!isOwner) {
      res.status(403).json({
        success: false,
        error: 'You can only update your own lessons',
      });
      return;
    }

    // Update lesson
    const updatedLesson = await updateLesson(lessonId, { title });
    if (!updatedLesson) {
      res.status(404).json({
        success: false,
        error: 'Lesson not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      lesson: updatedLesson,
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    next(error);
  }
};

/**
 * Delete a lesson
 *
 * DELETE /api/lessons/:id
 *
 * @param id - Lesson UUID
 *
 * @access Protected (Teacher who owns the lesson)
 */
export const deleteLessonById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const lessonId = req.params.id;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(lessonId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid lesson ID format',
      });
      return;
    }

    // Check ownership
    const teacherId = await getTeacherIdByUserId(req.user.userId);
    if (!teacherId) {
      res.status(403).json({
        success: false,
        error: 'User is not registered as a teacher',
      });
      return;
    }

    const isOwner = await isLessonOwner(lessonId, teacherId);
    if (!isOwner) {
      res.status(403).json({
        success: false,
        error: 'You can only delete your own lessons',
      });
      return;
    }

    // Delete lesson
    const deleted = await deleteLesson(lessonId);
    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Lesson not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    next(error);
  }
};

/**
 * Get published lessons (for students)
 *
 * GET /api/lessons/published
 *
 * @query limit - Number of results (default: 20, max: 100)
 * @query offset - Pagination offset (default: 0)
 *
 * @access Protected (Any authenticated user)
 */
export const getPublishedLessons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string) || 20, 1),
      100
    );
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

    // Query all published lessons
    const query = `
      SELECT l.id, l.title, l.is_published as "isPublished", l.created_at as "createdAt",
             p.first_name as "teacherFirstName", p.last_name as "teacherLastName"
      FROM lessons l
      JOIN teachers t ON l.teacher_id = t.id
      JOIN profiles p ON t.user_id = p.user_id
      WHERE l.is_published = true
      ORDER BY l.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `SELECT COUNT(*) FROM lessons WHERE is_published = true`;

    // Import postgresDb here to avoid circular dependency
    const { postgresDb } = await import('../config/postgres');
    
    const [dataResult, countResult] = await Promise.all([
      postgresDb.query(query, [limit, offset]),
      postgresDb.query<{ count: string }>(countQuery, []),
    ]);

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      lessons: dataResult.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        isPublished: row.isPublished,
        createdAt: row.createdAt,
        teacher: {
          firstName: row.teacherFirstName,
          lastName: row.teacherLastName,
        },
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + dataResult.rows.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching published lessons:', error);
    next(error);
  }
};
