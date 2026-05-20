/**
 * Quiz Type Definitions
 * Type-safe interfaces for quiz-related data
 */

/**
 * Single quiz question with options and correct answer
 */
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

/**
 * Quiz metadata stored in MongoDB
 */
export interface QuizMetadata {
  difficulty?: 'easy' | 'medium' | 'hard';
  numQuestions?: number;
  generatedBy?: 'ai' | 'manual';
  generatedAt?: string;
  aiModel?: string;
}

/**
 * Quiz stored in PostgreSQL + MongoDB
 */
export interface Quiz {
  id: string;
  teacherId: string;
  title: string;
  lessonId?: string;
  contentId: string; // MongoDB ObjectId reference
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  // Populated content when fetching single quiz
  questions?: QuizQuestion[];
  quizMetadata?: QuizMetadata;
}

/**
 * Request payload for quiz creation
 */
export interface CreateQuizRequest {
  title: string;
  questions: QuizQuestion[];
  lessonId?: string;
  metadata?: QuizMetadata;
}

/**
 * Request payload for quiz update
 */
export interface UpdateQuizRequest {
  title?: string;
  questions?: QuizQuestion[];
  lessonId?: string;
  metadata?: QuizMetadata;
}

/**
 * Response from quiz creation
 */
export interface CreateQuizResponse {
  success: boolean;
  quiz: Quiz;
  message?: string;
}

/**
 * Response from get quiz by ID
 */
export interface GetQuizResponse {
  success: boolean;
  quiz: Quiz;
}

/**
 * Response from get quizzes list
 */
export interface QuizzesListResponse {
  success: boolean;
  quizzes: Quiz[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Quiz list filters
 */
export interface QuizFilters {
  lessonId?: string;
  status?: 'draft' | 'published';
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'title';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * AI Quiz Generation Request
 */
export interface GenerateQuizRequest {
  lessonContent: string;
  numQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * AI Quiz Generation Response
 */
export interface GenerateQuizResponse {
  success: boolean;
  questions: QuizQuestion[];
  metadata: {
    generated: number;
    requested: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  error?: string;
}

/**
 * Quiz submission request payload
 * Maps question index to selected answer
 */
export interface QuizSubmissionRequest {
  answers: Record<string, string>; // { "question0": "A", "question1": "B", ... }
}

/**
 * Single question result after quiz submission
 */
export interface QuizQuestionResult {
  question: string;
  options: string[];
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

/**
 * Quiz submission response with score and detailed results
 */
export interface QuizSubmissionResponse {
  success: boolean;
  score: number;
  totalQuestions: number;
  percentage: number;
  results: QuizQuestionResult[];
  attemptId?: string;
  submittedAt?: string;
}
