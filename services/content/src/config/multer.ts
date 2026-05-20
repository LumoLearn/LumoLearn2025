import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Multer Configuration for File Uploads
 *
 * Handles document uploads (.docx, .pdf) with validation and storage
 */

// Configuration from environment
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024; // Convert MB to bytes
const ALLOWED_EXTENSIONS = (process.env.ALLOWED_FILE_TYPES || '.docx,.pdf').split(',');
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// Ensure upload directory exists
const uploadsPath = path.join(process.cwd(), UPLOAD_DIR);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log(`Created uploads directory at: ${uploadsPath}`);
}

/**
 * Storage configuration
 * Uses memory storage for processing files without saving to disk
 */
const storage = multer.memoryStorage();

/**
 * File filter - validates file type
 */
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed.`
      )
    );
  }
};

/**
 * Multer configuration
 */
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Get upload configuration info
 */
export const getUploadConfig = () => ({
  maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024),
  maxFileSizeBytes: MAX_FILE_SIZE,
  allowedExtensions: ALLOWED_EXTENSIONS,
  uploadDir: UPLOAD_DIR,
});

/**
 * Validate file size helper
 */
export const isFileSizeValid = (sizeInBytes: number): boolean => {
  return sizeInBytes <= MAX_FILE_SIZE;
};

/**
 * Validate file extension helper
 */
export const isFileTypeValid = (filename: string): boolean => {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
};
