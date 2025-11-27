import { z } from 'zod';

/**
 * Lesson Validation Schemas
 * Zod schemas for runtime validation and type inference
 */

/**
 * Allowed file types for lesson upload
 */
export const ALLOWED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/pdf', // .pdf
] as const;

/**
 * Allowed file extensions
 */
export const ALLOWED_EXTENSIONS = ['.docx', '.pdf'] as const;

/**
 * Maximum file size in bytes (10MB)
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Maximum file size in MB (for display)
 */
export const MAX_FILE_SIZE_MB = 10;

/**
 * Lesson upload form schema
 */
export const lessonUploadSchema = z.object({
  title: z
    .string()
    .min(3, 'Naslov mora imati najmanje 3 karaktera')
    .max(255, 'Naslov može imati najviše 255 karaktera')
    .trim(),
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size > 0,
      'Morate izabrati fajl'
    )
    .refine(
      (file) => file.size <= MAX_FILE_SIZE_BYTES,
      `Fajl je prevelik. Maksimalna veličina je ${MAX_FILE_SIZE_MB}MB`
    )
    .refine(
      (file) => {
        const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        return ALLOWED_EXTENSIONS.includes(extension as any);
      },
      `Dozvoljeni formati su: ${ALLOWED_EXTENSIONS.join(', ')}`
    ),
});

/**
 * Infer TypeScript type from schema
 */
export type LessonUploadFormData = z.infer<typeof lessonUploadSchema>;

/**
 * Lesson title update schema
 */
export const lessonTitleSchema = z.object({
  title: z
    .string()
    .min(3, 'Naslov mora imati najmanje 3 karaktera')
    .max(255, 'Naslov može imati najviše 255 karaktera')
    .trim(),
});

/**
 * Infer TypeScript type from schema
 */
export type LessonTitleFormData = z.infer<typeof lessonTitleSchema>;

/**
 * File validation utility
 * @param file - File to validate
 * @returns Validation result with error messages
 */
export function validateLessonFile(file: File | null): {
  isValid: boolean;
  error?: string;
} {
  if (!file) {
    return {
      isValid: false,
      error: 'Morate izabrati fajl',
    };
  }

  // Check file size
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'Fajl je prazan',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `Fajl je prevelik (${sizeMB}MB). Maksimalna veličina je ${MAX_FILE_SIZE_MB}MB`,
    };
  }

  // Check file extension
  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  if (!ALLOWED_EXTENSIONS.includes(extension as any)) {
    return {
      isValid: false,
      error: `Nepodržan format fajla. Dozvoljeni formati su: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  return { isValid: true };
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file type icon based on extension
 * @param fileName - File name with extension
 * @returns Icon identifier
 */
export function getFileTypeIcon(fileName: string): 'docx' | 'pdf' | 'unknown' {
  const extension = `.${fileName.split('.').pop()?.toLowerCase()}`;
  if (extension === '.docx') return 'docx';
  if (extension === '.pdf') return 'pdf';
  return 'unknown';
}
