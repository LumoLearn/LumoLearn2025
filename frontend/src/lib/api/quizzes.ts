import { apiClient } from './client';
import type {
  Quiz,
  CreateQuizRequest,
  CreateQuizResponse,
  GetQuizResponse,
  QuizzesListResponse,
  UpdateQuizRequest,
  QuizFilters,
  QuizSubmissionRequest,
  QuizSubmissionResponse,
} from '@/lib/types/quiz';

const CONTENT_SERVICE_URL = process.env.NEXT_PUBLIC_CONTENT_API_URL || 'http://localhost:3002';

/**
 * Quiz API Service
 * Handles all quiz-related API calls to the Content Service
 */
export const quizzesApi = {
  /**
   * Create a new quiz
   * @param title - Quiz title
   * @param questions - Array of quiz questions
   * @param lessonId - Optional lesson ID to associate with
   * @param metadata - Optional metadata (difficulty, generatedBy, etc.)
   * @returns Promise with created quiz
   */
  async createQuiz(request: CreateQuizRequest): Promise<CreateQuizResponse> {
    const response = await apiClient.post<CreateQuizResponse>(
      `${CONTENT_SERVICE_URL}/api/quizzes`,
      request
    );

    return response.data;
  },

  /**
   * Get all quizzes for the current teacher
   * @param filters - Optional filters (lessonId, status, pagination, sorting)
   * @returns Promise with array of quizzes
   */
  async getQuizzes(filters?: QuizFilters): Promise<QuizzesListResponse> {
    const params = new URLSearchParams();

    if (filters?.lessonId) params.append('lessonId', filters.lessonId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get<QuizzesListResponse>(
      `${CONTENT_SERVICE_URL}/api/quizzes${params.toString() ? `?${params.toString()}` : ''}`
    );

    return response.data;
  },

  /**
   * Get a single quiz by ID with questions
   * @param id - Quiz ID
   * @param includeAnswers - Whether to include correct answers (default: true for teachers)
   * @returns Promise with quiz including questions
   */
  async getQuizById(id: string, includeAnswers: boolean = true): Promise<Quiz> {
    const response = await apiClient.get<GetQuizResponse>(
      `${CONTENT_SERVICE_URL}/api/quizzes/${id}?includeAnswers=${includeAnswers}`
    );

    return response.data.quiz;
  },

  /**
   * Update quiz
   * @param id - Quiz ID
   * @param updates - Fields to update (title, questions, lessonId, metadata)
   * @returns Promise with updated quiz
   */
  async updateQuiz(id: string, updates: UpdateQuizRequest): Promise<Quiz> {
    const response = await apiClient.put<GetQuizResponse>(
      `${CONTENT_SERVICE_URL}/api/quizzes/${id}`,
      updates
    );

    return response.data.quiz;
  },

  /**
   * Delete a quiz
   * @param id - Quiz ID
   * @returns Promise with success status
   */
  async deleteQuiz(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `${CONTENT_SERVICE_URL}/api/quizzes/${id}`
    );

    return response.data;
  },

  /**
   * Publish a quiz (make it available to students)
   * @param id - Quiz ID
   * @returns Promise with updated quiz
   */
  async publishQuiz(id: string): Promise<Quiz> {
    const response = await apiClient.post<{ success: boolean; message: string; quiz: Quiz }>(
      `${CONTENT_SERVICE_URL}/api/quizzes/${id}/publish`
    );

    return response.data.quiz;
  },

  /**
   * Unpublish a quiz (make it unavailable to students)
   * @param id - Quiz ID
   * @returns Promise with updated quiz
   */
  async unpublishQuiz(id: string): Promise<Quiz> {
    const response = await apiClient.post<{ success: boolean; message: string; quiz: Quiz }>(
      `${CONTENT_SERVICE_URL}/api/quizzes/${id}/unpublish`
    );

    return response.data.quiz;
  },

  /**
   * Get all published quizzes (for students)
   * @param filters - Optional filters (lessonId, pagination)
   * @returns Promise with array of published quizzes
   */
  async getPublishedQuizzes(filters?: Pick<QuizFilters, 'lessonId' | 'limit' | 'offset'>): Promise<QuizzesListResponse> {
    const params = new URLSearchParams();

    if (filters?.lessonId) params.append('lessonId', filters.lessonId);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const response = await apiClient.get<QuizzesListResponse>(
      `${CONTENT_SERVICE_URL}/api/quizzes/published${params.toString() ? `?${params.toString()}` : ''}`
    );

    return response.data;
  },

  /**
   * Submit quiz answers (for students)
   * @param quizId - Quiz ID
   * @param answers - Object mapping question indices to selected answers
   * @returns Promise with score and detailed results
   */
  async submitQuiz(quizId: string, answers: Record<string, string>): Promise<QuizSubmissionResponse> {
    const response = await apiClient.post<QuizSubmissionResponse>(
      `${CONTENT_SERVICE_URL}/api/quizzes/${quizId}/submit`,
      { answers }
    );

    return response.data;
  },
};
