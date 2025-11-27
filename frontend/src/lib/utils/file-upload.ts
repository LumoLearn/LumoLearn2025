import type { UploadProgress } from '@/lib/types/lesson';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES, validateLessonFile } from '@/lib/schemas/lesson';

/**
 * File Upload Utilities
 * Helper functions for handling file uploads
 */

/**
 * Handle file selection from input or drag-and-drop
 * @param event - File input change event or drag event
 * @returns Selected file or null
 */
export function handleFileSelection(
  event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
): File | null {
  let files: FileList | null = null;

  if ('dataTransfer' in event) {
    // Drag and drop event
    files = event.dataTransfer.files;
  } else {
    // Input change event
    files = event.target.files;
  }

  return files && files.length > 0 ? files[0] : null;
}

/**
 * Create a file input click handler
 * @param inputRef - Reference to hidden file input
 * @returns Click handler function
 */
export function createFileInputClickHandler(
  inputRef: React.RefObject<HTMLInputElement | null>
) {
  return () => {
    inputRef.current?.click();
  };
}

/**
 * Calculate upload progress percentage
 * @param loaded - Bytes loaded
 * @param total - Total bytes
 * @returns Progress object with percentage
 */
export function calculateUploadProgress(
  loaded: number,
  total: number
): UploadProgress {
  const percentage = total > 0 ? Math.round((loaded / total) * 100) : 0;
  return { loaded, total, percentage };
}

/**
 * Validate file and return user-friendly error
 * @param file - File to validate
 * @returns Validation result
 */
export function validateFile(file: File | null): {
  isValid: boolean;
  error?: string;
} {
  return validateLessonFile(file);
}

/**
 * Check if file type is allowed
 * @param file - File to check
 * @returns True if file type is allowed
 */
export function isFileTypeAllowed(file: File): boolean {
  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  return ALLOWED_EXTENSIONS.includes(extension as any);
}

/**
 * Check if file size is within limit
 * @param file - File to check
 * @returns True if file size is within limit
 */
export function isFileSizeAllowed(file: File): boolean {
  return file.size > 0 && file.size <= MAX_FILE_SIZE_BYTES;
}

/**
 * Get file extension from filename
 * @param fileName - File name
 * @returns File extension (e.g., ".docx")
 */
export function getFileExtension(fileName: string): string {
  return `.${fileName.split('.').pop()?.toLowerCase() || ''}`;
}

/**
 * Check if dropped item is a file
 * @param event - Drag event
 * @returns True if item is a file
 */
export function isFileDropped(event: React.DragEvent<HTMLDivElement>): boolean {
  return (
    event.dataTransfer.items &&
    event.dataTransfer.items.length > 0 &&
    event.dataTransfer.items[0].kind === 'file'
  );
}

/**
 * Prevent default drag behavior
 * @param event - Drag event
 */
export function preventDefaultDrag(event: React.DragEvent<HTMLDivElement>): void {
  event.preventDefault();
  event.stopPropagation();
}

/**
 * Create accept attribute value for file input
 * @returns Accept attribute string
 */
export function getAcceptAttribute(): string {
  return ALLOWED_EXTENSIONS.join(',');
}

/**
 * Format upload speed
 * @param bytesPerSecond - Bytes per second
 * @returns Formatted string (e.g., "2.5 MB/s")
 */
export function formatUploadSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return '0 B/s';

  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));

  return `${parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Estimate time remaining for upload
 * @param loaded - Bytes loaded
 * @param total - Total bytes
 * @param bytesPerSecond - Upload speed in bytes per second
 * @returns Time remaining in seconds
 */
export function estimateTimeRemaining(
  loaded: number,
  total: number,
  bytesPerSecond: number
): number {
  if (bytesPerSecond === 0) return 0;
  const remaining = total - loaded;
  return Math.ceil(remaining / bytesPerSecond);
}

/**
 * Format time duration
 * @param seconds - Time in seconds
 * @returns Formatted string (e.g., "2m 30s")
 */
export function formatTimeDuration(seconds: number): string {
  if (seconds < 1) return 'skoro završeno';
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}
