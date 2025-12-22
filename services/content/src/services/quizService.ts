import { ObjectId } from 'mongodb';
import { postgresDb } from '../config/postgres';
import { mongoDb } from '../config/database';

/**
 * Quiz Service
 *
 * Handles quiz CRUD operations across MongoDB and PostgreSQL
 * - MongoDB: stores quiz questions and answers
 * - PostgreSQL: stores metadata and relationships
 */

// Collection name for MongoDB
const QUIZZES_COLLECTION = 'quizzes';

/**
 * Quiz metadata stored in PostgreSQL
 */
export interface QuizMetadata {
  id: string;
  lessonId: string | null;
  teacherId: string;
  title: string;
  contentId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Single quiz question
 */
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

/**
 * Quiz content stored in MongoDB
 */
export interface QuizContent {
  _id?: ObjectId;
  questions: QuizQuestion[];
  metadata?: {
    difficulty?: string;
    numQuestions?: number;
    generatedBy?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Complete quiz with content
 */
export interface QuizWithContent extends QuizMetadata {
  questions?: QuizQuestion[];
  quizMetadata?: {
    difficulty?: string;
    numQuestions?: number;
    generatedBy?: string;
  };
}

/**
 * Options for listing quizzes
 */
export interface ListQuizzesOptions {
  teacherId?: string;
  lessonId?: string;
  status?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'title';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Save quiz content to MongoDB
 */
export const saveQuizContentToMongo = async (
  questions: QuizQuestion[],
  metadata?: { difficulty?: string; numQuestions?: number; generatedBy?: string }
): Promise<string> => {
  const db = mongoDb.getDb();
  const collection = db.collection<QuizContent>(QUIZZES_COLLECTION);

  const document: Omit<QuizContent, '_id'> = {
    questions,
    metadata: metadata || {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(document as QuizContent);
  return result.insertedId.toString();
};

/**
 * Get quiz content from MongoDB
 */
export const getQuizContentFromMongo = async (
  contentId: string
): Promise<QuizContent | null> => {
  try {
    const db = mongoDb.getDb();
    const collection = db.collection<QuizContent>(QUIZZES_COLLECTION);

    const document = await collection.findOne({
      _id: new ObjectId(contentId),
    });

    return document;
  } catch (error) {
    console.error('Error fetching quiz content from MongoDB:', error);
    return null;
  }
};

/**
 * Update quiz content in MongoDB
 */
export const updateQuizContentInMongo = async (
  contentId: string,
  questions: QuizQuestion[],
  metadata?: { difficulty?: string; numQuestions?: number; generatedBy?: string }
): Promise<boolean> => {
  try {
    const db = mongoDb.getDb();
    const collection = db.collection<QuizContent>(QUIZZES_COLLECTION);

    const result = await collection.updateOne(
      { _id: new ObjectId(contentId) },
      {
        $set: {
          questions,
          metadata: metadata || {},
          updatedAt: new Date(),
        },
      }
    );

    return result.modifiedCount === 1;
  } catch (error) {
    console.error('Error updating quiz content in MongoDB:', error);
    return false;
  }
};

/**
 * Delete quiz content from MongoDB
 */
export const deleteQuizContentFromMongo = async (
  contentId: string
): Promise<boolean> => {
  try {
    const db = mongoDb.getDb();
    const collection = db.collection<QuizContent>(QUIZZES_COLLECTION);

    const result = await collection.deleteOne({
      _id: new ObjectId(contentId),
    });

    return result.deletedCount === 1;
  } catch (error) {
    console.error('Error deleting quiz content from MongoDB:', error);
    return false;
  }
};

/**
 * Create quiz metadata in PostgreSQL
 */
export const createQuizInPostgres = async (
  teacherId: string,
  title: string,
  contentId: string,
  lessonId?: string
): Promise<QuizMetadata> => {
  const query = `
    INSERT INTO quizzes (teacher_id, title, content_id, lesson_id, status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING id, teacher_id as "teacherId", title, content_id as "contentId",
              lesson_id as "lessonId", status, created_at as "createdAt", updated_at as "updatedAt"
  `;

  const result = await postgresDb.query<QuizMetadata>(query, [
    teacherId,
    title,
    contentId,
    lessonId || null,
    'draft',
  ]);

  return result.rows[0];
};

/**
 * Get quiz metadata from PostgreSQL by ID
 */
export const getQuizById = async (
  quizId: string
): Promise<QuizMetadata | null> => {
  const query = `
    SELECT id, teacher_id as "teacherId", title, content_id as "contentId",
           lesson_id as "lessonId", status, created_at as "createdAt", updated_at as "updatedAt"
    FROM quizzes
    WHERE id = $1
  `;

  const result = await postgresDb.query<QuizMetadata>(query, [quizId]);
  return result.rows[0] || null;
};

/**
 * Get quiz with full content (including questions)
 */
export const getQuizWithContent = async (
  quizId: string,
  includeAnswers: boolean = true
): Promise<QuizWithContent | null> => {
  // Get metadata from PostgreSQL
  const metadata = await getQuizById(quizId);
  if (!metadata) {
    return null;
  }

  // Get content from MongoDB if contentId exists
  if (metadata.contentId) {
    const content = await getQuizContentFromMongo(metadata.contentId);
    if (content) {
      // Remove correct answers if requested (for students taking quiz)
      const questions = includeAnswers
        ? content.questions
        : content.questions.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: '', // Hide correct answer
          }));

      return {
        ...metadata,
        questions,
        quizMetadata: content.metadata,
      };
    }
  }

  return metadata;
};

/**
 * List quizzes
 */
export const listQuizzes = async (
  options: ListQuizzesOptions
): Promise<{ quizzes: QuizMetadata[]; total: number }> => {
  const {
    teacherId,
    lessonId,
    status,
    limit = 20,
    offset = 0,
    sortBy = 'created_at',
    sortOrder = 'DESC',
  } = options;

  // Build dynamic query
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (teacherId) {
    conditions.push(`teacher_id = $${paramIndex}`);
    params.push(teacherId);
    paramIndex++;
  }

  if (lessonId) {
    conditions.push(`lesson_id = $${paramIndex}`);
    params.push(lessonId);
    paramIndex++;
  }

  if (status) {
    conditions.push(`status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Validate sort column to prevent SQL injection
  const validSortColumns = ['created_at', 'updated_at', 'title'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  // Count query
  const countQuery = `SELECT COUNT(*) FROM quizzes ${whereClause}`;
  const countResult = await postgresDb.query<{ count: string }>(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  // Data query
  const dataQuery = `
    SELECT id, teacher_id as "teacherId", title, content_id as "contentId",
           lesson_id as "lessonId", status, created_at as "createdAt", updated_at as "updatedAt"
    FROM quizzes
    ${whereClause}
    ORDER BY ${sortColumn} ${order}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataResult = await postgresDb.query<QuizMetadata>(dataQuery, [
    ...params,
    limit,
    offset,
  ]);

  return {
    quizzes: dataResult.rows,
    total,
  };
};

/**
 * Update quiz metadata in PostgreSQL
 */
export const updateQuizInPostgres = async (
  quizId: string,
  updates: Partial<Pick<QuizMetadata, 'title' | 'status' | 'lessonId'>>
): Promise<QuizMetadata | null> => {
  const setClauses: string[] = ['updated_at = NOW()'];
  const params: any[] = [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    setClauses.push(`title = $${paramIndex}`);
    params.push(updates.title);
    paramIndex++;
  }

  if (updates.status !== undefined) {
    setClauses.push(`status = $${paramIndex}`);
    params.push(updates.status);
    paramIndex++;
  }

  if (updates.lessonId !== undefined) {
    setClauses.push(`lesson_id = $${paramIndex}`);
    params.push(updates.lessonId);
    paramIndex++;
  }

  params.push(quizId);

  const query = `
    UPDATE quizzes
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, teacher_id as "teacherId", title, content_id as "contentId",
              lesson_id as "lessonId", status, created_at as "createdAt", updated_at as "updatedAt"
  `;

  const result = await postgresDb.query<QuizMetadata>(query, params);
  return result.rows[0] || null;
};

/**
 * Delete quiz (both MongoDB content and PostgreSQL metadata)
 */
export const deleteQuiz = async (quizId: string): Promise<boolean> => {
  // Get quiz first to get contentId
  const quiz = await getQuizById(quizId);
  if (!quiz) {
    return false;
  }

  // Delete content from MongoDB if exists
  if (quiz.contentId) {
    await deleteQuizContentFromMongo(quiz.contentId);
  }

  // Delete from PostgreSQL
  const query = 'DELETE FROM quizzes WHERE id = $1';
  const result = await postgresDb.query(query, [quizId]);

  return (result.rowCount ?? 0) > 0;
};

/**
 * Check if user owns a quiz
 */
export const isQuizOwner = async (
  quizId: string,
  teacherId: string
): Promise<boolean> => {
  const quiz = await getQuizById(quizId);
  return quiz?.teacherId === teacherId;
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

/**
 * Get student ID from user ID
 * Students table has a user_id that maps to the auth user
 */
export const getStudentIdByUserId = async (
  userId: string
): Promise<string | null> => {
  const query = `
    SELECT id FROM students WHERE user_id = $1
  `;

  const result = await postgresDb.query<{ id: string }>(query, [userId]);
  return result.rows[0]?.id || null;
};

/**
 * Quiz submission result for a single question
 */
export interface QuestionResult {
  question: string;
  options: string[];
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

/**
 * Quiz submission response
 */
export interface QuizSubmissionResult {
  attemptId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  results: QuestionResult[];
}

/**
 * Submit quiz answers and calculate score
 */
export const submitQuizAnswers = async (
  quizId: string,
  studentId: string,
  answers: Record<string, string>
): Promise<QuizSubmissionResult> => {
  // Get quiz with content including correct answers
  const quiz = await getQuizWithContent(quizId, true);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    throw new Error('Quiz not found or has no questions');
  }

  // Validate quiz is published
  if (quiz.status !== 'published') {
    throw new Error('Quiz is not published yet');
  }

  // Calculate score and prepare results
  const results: QuestionResult[] = [];
  let correctCount = 0;

  quiz.questions.forEach((question, index) => {
    // Try both index formats: question0, question1, etc. (0-based) and question1, question2, etc. (1-based)
    const questionKey0 = `question${index}`;
    const questionKey1 = `question${index + 1}`;
    const userAnswer = answers[questionKey0] || answers[questionKey1] || '';

    // Normalize answers - extract just the letter (A, B, C, D) if full text is provided
    // Support both formats: "B" or "B) Full text answer"
    const normalizedUserAnswer = userAnswer.trim().charAt(0).toUpperCase();
    const normalizedCorrectAnswer = question.correctAnswer.trim().charAt(0).toUpperCase();

    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

    if (isCorrect) {
      correctCount++;
    }

    results.push({
      question: question.question,
      options: question.options,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
    });
  });

  const totalQuestions = quiz.questions.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  // Save quiz attempt to PostgreSQL
  const query = `
    INSERT INTO quiz_attempts (quiz_id, student_id, score, total_questions, answers, submitted_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id, quiz_id as "quizId", student_id as "studentId", score, total_questions as "totalQuestions", answers, submitted_at as "submittedAt"
  `;

  const result = await postgresDb.query<{
    id: string;
    quizId: string;
    studentId: string;
    score: number;
    totalQuestions: number;
    answers: Record<string, string>;
    submittedAt: Date;
  }>(query, [
    quizId,
    studentId,
    correctCount,
    totalQuestions,
    JSON.stringify(answers),
  ]);

  const attempt = result.rows[0];

  return {
    attemptId: attempt.id,
    score: correctCount,
    totalQuestions,
    percentage,
    results,
  };
};
