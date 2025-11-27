import { ObjectId, WithId, Document } from 'mongodb';
import { postgresDb } from '../config/postgres';
import { mongoDb } from '../config/database';
import { ParsedContent } from './fileService';

/**
 * Lesson Service
 *
 * Handles lesson CRUD operations across MongoDB and PostgreSQL
 * - MongoDB: stores HTML content
 * - PostgreSQL: stores metadata and relationships
 */

// Collection name for MongoDB
const LESSONS_COLLECTION = 'lessons';

/**
 * Lesson metadata stored in PostgreSQL
 */
export interface LessonMetadata {
  id: string;
  teacherId: string;
  title: string;
  contentId: string | null;
  isPublished: boolean;
  createdAt: Date;
}

/**
 * Lesson content stored in MongoDB
 */
export interface LessonContent {
  _id?: ObjectId;
  html: string;
  plainText: string;
  metadata: {
    fileType: string;
    fileName: string;
    fileSize: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Complete lesson with content
 */
export interface LessonWithContent extends LessonMetadata {
  content?: string;
  plainText?: string;
  fileMetadata?: {
    fileType: string;
    fileName: string;
    fileSize: number;
  };
}

/**
 * Options for listing lessons
 */
export interface ListLessonsOptions {
  teacherId: string;
  isPublished?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'title';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Save lesson content to MongoDB
 */
export const saveContentToMongo = async (
  parsedContent: ParsedContent
): Promise<string> => {
  const db = mongoDb.getDb();
  const collection = db.collection<LessonContent>(LESSONS_COLLECTION);

  const document: Omit<LessonContent, '_id'> = {
    html: parsedContent.html,
    plainText: parsedContent.plainText,
    metadata: parsedContent.metadata || {
      fileType: 'unknown',
      fileName: 'unknown',
      fileSize: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(document as LessonContent);
  return result.insertedId.toString();
};

/**
 * Get lesson content from MongoDB
 */
export const getContentFromMongo = async (
  contentId: string
): Promise<LessonContent | null> => {
  try {
    const db = mongoDb.getDb();
    const collection = db.collection<LessonContent>(LESSONS_COLLECTION);
    
    const document = await collection.findOne({
      _id: new ObjectId(contentId),
    });

    return document;
  } catch (error) {
    console.error('Error fetching content from MongoDB:', error);
    return null;
  }
};

/**
 * Delete lesson content from MongoDB
 */
export const deleteContentFromMongo = async (
  contentId: string
): Promise<boolean> => {
  try {
    const db = mongoDb.getDb();
    const collection = db.collection<LessonContent>(LESSONS_COLLECTION);
    
    const result = await collection.deleteOne({
      _id: new ObjectId(contentId),
    });

    return result.deletedCount === 1;
  } catch (error) {
    console.error('Error deleting content from MongoDB:', error);
    return false;
  }
};

/**
 * Create lesson metadata in PostgreSQL
 */
export const createLessonInPostgres = async (
  teacherId: string,
  title: string,
  contentId: string
): Promise<LessonMetadata> => {
  const query = `
    INSERT INTO lessons (teacher_id, title, content_id, is_published, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING id, teacher_id as "teacherId", title, content_id as "contentId", 
              is_published as "isPublished", created_at as "createdAt"
  `;

  const result = await postgresDb.query<LessonMetadata>(query, [
    teacherId,
    title,
    contentId,
    false,
  ]);

  return result.rows[0];
};

/**
 * Get lesson metadata from PostgreSQL by ID
 */
export const getLessonById = async (
  lessonId: string
): Promise<LessonMetadata | null> => {
  const query = `
    SELECT id, teacher_id as "teacherId", title, content_id as "contentId",
           is_published as "isPublished", created_at as "createdAt"
    FROM lessons
    WHERE id = $1
  `;

  const result = await postgresDb.query<LessonMetadata>(query, [lessonId]);
  return result.rows[0] || null;
};

/**
 * Get lesson with full content
 */
export const getLessonWithContent = async (
  lessonId: string
): Promise<LessonWithContent | null> => {
  // Get metadata from PostgreSQL
  const metadata = await getLessonById(lessonId);
  if (!metadata) {
    return null;
  }

  // Get content from MongoDB if contentId exists
  if (metadata.contentId) {
    const content = await getContentFromMongo(metadata.contentId);
    if (content) {
      return {
        ...metadata,
        content: content.html,
        plainText: content.plainText,
        fileMetadata: content.metadata,
      };
    }
  }

  return metadata;
};

/**
 * List lessons for a teacher
 */
export const listLessons = async (
  options: ListLessonsOptions
): Promise<{ lessons: LessonMetadata[]; total: number }> => {
  const {
    teacherId,
    isPublished,
    limit = 20,
    offset = 0,
    sortBy = 'created_at',
    sortOrder = 'DESC',
  } = options;

  // Build dynamic query
  const conditions: string[] = ['teacher_id = $1'];
  const params: any[] = [teacherId];
  let paramIndex = 2;

  if (isPublished !== undefined) {
    conditions.push(`is_published = $${paramIndex}`);
    params.push(isPublished);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');
  
  // Validate sort column to prevent SQL injection
  const validSortColumns = ['created_at', 'title'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  // Count query
  const countQuery = `SELECT COUNT(*) FROM lessons WHERE ${whereClause}`;
  const countResult = await postgresDb.query<{ count: string }>(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  // Data query
  const dataQuery = `
    SELECT id, teacher_id as "teacherId", title, content_id as "contentId",
           is_published as "isPublished", created_at as "createdAt"
    FROM lessons
    WHERE ${whereClause}
    ORDER BY ${sortColumn} ${order}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataResult = await postgresDb.query<LessonMetadata>(dataQuery, [
    ...params,
    limit,
    offset,
  ]);

  return {
    lessons: dataResult.rows,
    total,
  };
};

/**
 * Update lesson metadata
 */
export const updateLesson = async (
  lessonId: string,
  updates: Partial<Pick<LessonMetadata, 'title' | 'isPublished'>>
): Promise<LessonMetadata | null> => {
  const setClauses: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    setClauses.push(`title = $${paramIndex}`);
    params.push(updates.title);
    paramIndex++;
  }

  if (updates.isPublished !== undefined) {
    setClauses.push(`is_published = $${paramIndex}`);
    params.push(updates.isPublished);
    paramIndex++;
  }

  if (setClauses.length === 0) {
    return getLessonById(lessonId);
  }

  params.push(lessonId);

  const query = `
    UPDATE lessons
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, teacher_id as "teacherId", title, content_id as "contentId",
              is_published as "isPublished", created_at as "createdAt"
  `;

  const result = await postgresDb.query<LessonMetadata>(query, params);
  return result.rows[0] || null;
};

/**
 * Delete lesson (both MongoDB content and PostgreSQL metadata)
 */
export const deleteLesson = async (lessonId: string): Promise<boolean> => {
  // Get lesson first to get contentId
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    return false;
  }

  // Delete content from MongoDB if exists
  if (lesson.contentId) {
    await deleteContentFromMongo(lesson.contentId);
  }

  // Delete from PostgreSQL
  const query = 'DELETE FROM lessons WHERE id = $1';
  const result = await postgresDb.query(query, [lessonId]);

  return (result.rowCount ?? 0) > 0;
};

/**
 * Check if user owns a lesson
 */
export const isLessonOwner = async (
  lessonId: string,
  teacherId: string
): Promise<boolean> => {
  const lesson = await getLessonById(lessonId);
  return lesson?.teacherId === teacherId;
};

/**
 * Get teacher ID from user ID
 * Teachers table has a user_id that maps to the auth user
 */
export const getTeacherIdByUserId = async (
  userId: string
): Promise<string | null> => {
  const query = `
    SELECT id FROM teachers WHERE user_id = $1
  `;
  
  const result = await postgresDb.query<{ id: string }>(query, [userId]);
  return result.rows[0]?.id || null;
};

