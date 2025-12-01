import { apiClient } from './client';
import type { GenerateQuizRequest, GenerateQuizResponse } from '@/lib/types/quiz';

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:3003';

/**
 * AI API Service
 * Handles all AI-related API calls to the AI Service (Gemini)
 */
export const aiApi = {
  /**
   * Generate quiz questions from lesson content using AI
   * @param lessonContent - HTML content of the lesson
   * @param numQuestions - Number of questions to generate (1-20)
   * @param difficulty - Difficulty level (easy/medium/hard)
   * @returns Promise with array of generated quiz questions
   */
  async generateQuiz(
    lessonContent: string,
    numQuestions: number = 10,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<GenerateQuizResponse> {
    const requestBody: GenerateQuizRequest = {
      lessonContent,
      numQuestions,
      difficulty,
    };

    const response = await apiClient.post<GenerateQuizResponse>(
      `${AI_SERVICE_URL}/api/ai/generate-quiz`,
      requestBody
    );

    return response.data;
  },

  /**
   * Test AI service connection
   * @returns Promise with connection status
   */
  async testConnection(): Promise<{ success: boolean; message: string; model?: string }> {
    const response = await apiClient.get<{ success: boolean; message: string; model?: string }>(
      `${AI_SERVICE_URL}/api/ai/test`
    );

    return response.data;
  },
};
