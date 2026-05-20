import { apiClient } from './client';
import type { Lesson, LessonUploadRequest, LessonUploadResponse, LessonsListResponse } from '@/lib/types/lesson';

const CONTENT_SERVICE_URL = process.env.NEXT_PUBLIC_CONTENT_API_URL || 'http://localhost:3002';

/**
 * Lesson API Service
 * Handles all lesson-related API calls to the Content Service
 */
export const lessonsApi = {
  /**
   * Upload a new lesson file (Word or PDF)
   * @param file - The file to upload (.docx or .pdf)
   * @param title - The lesson title
   * @param onUploadProgress - Optional callback for upload progress updates
   * @returns Promise with lesson data including ID and content ID
   */
  async uploadLesson(
    file: File,
    title: string,
    onUploadProgress?: (progressEvent: { loaded: number; total: number; percentage: number }) => void
  ): Promise<LessonUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    const response = await apiClient.post<LessonUploadResponse>(
      `${CONTENT_SERVICE_URL}/api/lessons/upload`,
      formData,
      {
        onUploadProgress: onUploadProgress
          ? (progressEvent) => {
              const total = progressEvent.total || 0;
              const loaded = progressEvent.loaded || 0;
              const percentage = total > 0 ? Math.round((loaded * 100) / total) : 0;
              onUploadProgress({ loaded, total, percentage });
            }
          : undefined,
      }
    );

    return response.data;
  },

  /**
   * Get all lessons for the current teacher
   * @param filters - Optional filters (isPublished)
   * @returns Promise with array of lessons
   */
  async getLessons(filters?: { isPublished?: boolean }): Promise<LessonsListResponse> {
    const params = new URLSearchParams();
    if (filters?.isPublished !== undefined) {
      params.append('isPublished', String(filters.isPublished));
    }

    const response = await apiClient.get<LessonsListResponse>(
      `${CONTENT_SERVICE_URL}/api/lessons${params.toString() ? `?${params.toString()}` : ''}`
    );

    return response.data;
  },

  /**
   * Get a single lesson by ID with full content
   * @param id - Lesson ID
   * @returns Promise with lesson including HTML content
   */
  async getLessonById(id: string): Promise<Lesson> {
    const response = await apiClient.get<{ success: boolean; lesson: Lesson }>(
      `${CONTENT_SERVICE_URL}/api/lessons/${id}`
    );

    return response.data.lesson;
  },

  /**
   * Update lesson title
   * @param id - Lesson ID
   * @param title - New lesson title
   * @returns Promise with updated lesson
   */
  async updateLesson(id: string, title: string): Promise<Lesson> {
    const response = await apiClient.put<{ success: boolean; lesson: Lesson }>(
      `${CONTENT_SERVICE_URL}/api/lessons/${id}`,
      { title }
    );

    return response.data.lesson;
  },

  /**
   * Delete a lesson
   * @param id - Lesson ID
   * @returns Promise with success status
   */
  async deleteLesson(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `${CONTENT_SERVICE_URL}/api/lessons/${id}`
    );

    return response.data;
  },

  /**
   * Publish a lesson (make it available to students)
   * @param id - Lesson ID
   * @returns Promise with updated lesson
   */
  async publishLesson(id: string): Promise<Lesson> {
    const response = await apiClient.put<{ success: boolean; lesson: Lesson }>(
      `${CONTENT_SERVICE_URL}/api/lessons/${id}/publish`
    );

    return response.data.lesson;
  },

  /**
   * Unpublish a lesson (make it unavailable to students)
   * @param id - Lesson ID
   * @returns Promise with updated lesson
   */
  async unpublishLesson(id: string): Promise<Lesson> {
    const response = await apiClient.put<{ success: boolean; lesson: Lesson }>(
      `${CONTENT_SERVICE_URL}/api/lessons/${id}/unpublish`
    );

    return response.data.lesson;
  },

  /**
   * Get all published lessons (for students)
   * @returns Promise with array of published lessons
   */
  async getPublishedLessons(): Promise<LessonsListResponse> {
    const response = await apiClient.get<LessonsListResponse>(
      `${CONTENT_SERVICE_URL}/api/lessons/published`
    );

    return response.data;
  },
};
