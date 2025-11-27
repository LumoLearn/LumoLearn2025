/**
 * Lesson Type Definitions
 * Type-safe interfaces for lesson-related data
 */

/**
 * Lesson metadata stored in PostgreSQL
 */
export interface Lesson {
  id: string;
  teacherId: string;
  title: string;
  contentId: string; // MongoDB ObjectId reference
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  // Populated content when fetching single lesson
  content?: string; // HTML content from MongoDB
  plainText?: string; // Plain text version
  metadata?: LessonFileMetadata;
}

/**
 * File metadata from upload
 */
export interface LessonFileMetadata {
  fileType: 'docx' | 'pdf';
  fileName: string;
  fileSize: number;
  originalName?: string;
}

/**
 * Request payload for lesson upload
 */
export interface LessonUploadRequest {
  file: File;
  title: string;
}

/**
 * Response from lesson upload
 */
export interface LessonUploadResponse {
  success: boolean;
  lesson: Lesson;
  message?: string;
}

/**
 * Response from get lessons list
 */
export interface LessonsListResponse {
  success: boolean;
  lessons: Lesson[];
}

/**
 * Lesson list filters
 */
export interface LessonFilters {
  isPublished?: boolean;
  searchQuery?: string;
}

/**
 * Upload progress state
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * File validation error types
 */
export type FileValidationError =
  | 'INVALID_TYPE'
  | 'FILE_TOO_LARGE'
  | 'NO_FILE'
  | 'UPLOAD_FAILED'
  | 'NETWORK_ERROR';

/**
 * File validation result
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: FileValidationError;
  errorMessage?: string;
}
