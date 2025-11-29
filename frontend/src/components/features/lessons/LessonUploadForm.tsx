'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Upload, FileText, File as FileIcon, X, CheckCircle2, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { lessonsApi } from '@/lib/api/lessons';
import { lessonUploadSchema, type LessonUploadFormData, formatFileSize, getFileTypeIcon } from '@/lib/schemas/lesson';
import {
  handleFileSelection,
  createFileInputClickHandler,
  preventDefaultDrag,
  isFileDropped,
  validateFile,
} from '@/lib/utils/file-upload';

/**
 * Constants
 */
const REDIRECT_DELAY_MS = 1500;

/**
 * LessonUploadForm Component
 *
 * A comprehensive form for uploading lesson files (Word/PDF) with:
 * - Drag-and-drop support
 * - File type and size validation
 * - Real-time upload progress tracking
 * - Error handling
 * - Success feedback
 */
export function LessonUploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragCounterRef = useRef(0);

  // Component state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form handling with react-hook-form and zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LessonUploadFormData>({
    resolver: zodResolver(lessonUploadSchema),
    mode: 'onChange',
  });

  const titleValue = watch('title');

  /**
   * Handle file selection from input or drag-and-drop
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    const file = handleFileSelection(event);

    if (!file) {
      return;
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setFileError(validation.error || 'Invalid file');
      setSelectedFile(null);
      return;
    }

    // File is valid
    setSelectedFile(file);
    setFileError(null);
    setValue('file', file, { shouldValidate: true });

    // Auto-fill title if empty
    if (!titleValue) {
      const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      setValue('title', fileNameWithoutExtension);
    }
  };

  /**
   * Handle drag enter event
   */
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    preventDefaultDrag(event);
    dragCounterRef.current += 1;
    if (isFileDropped(event)) {
      setIsDragging(true);
    }
  };

  /**
   * Handle drag over event
   */
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    preventDefaultDrag(event);
  };

  /**
   * Handle drag leave event
   */
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    preventDefaultDrag(event);
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  /**
   * Handle file drop event
   */
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    preventDefaultDrag(event);
    dragCounterRef.current = 0;
    setIsDragging(false);
    handleFileChange(event);
  };

  /**
   * Remove selected file
   */
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    setValue('file', null as any);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Cleanup on component unmount
   */
  useEffect(() => {
    return () => {
      // Clear redirect timeout if component unmounts
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: LessonUploadFormData) => {
    if (!selectedFile) {
      setFileError('You must select a file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Upload lesson with real-time progress tracking
      await lessonsApi.uploadLesson(
        selectedFile,
        data.title,
        (progressEvent) => {
          setUploadProgress(progressEvent.percentage);
        }
      );

      // Set to 100% on completion
      setUploadProgress(100);

      // Show success state
      setUploadSuccess(true);

      // Redirect after success with cleanup tracking
      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/dashboard/teacher/lessons');
      }, REDIRECT_DELAY_MS);
    } catch (error: any) {
      setUploadError(
        error.response?.data?.error ||
        error.message ||
        'An error occurred while uploading the lesson'
      );
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Get file type icon component
   */
  const getFileIcon = () => {
    if (!selectedFile) return <FileIcon className="w-8 h-8" />;

    const fileType = getFileTypeIcon(selectedFile.name);
    if (fileType === 'pdf') {
      return <FileIcon className="w-8 h-8 text-red-500" />;
    }
    return <FileText className="w-8 h-8 text-blue-500" />;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload New Lesson</CardTitle>
        <CardDescription>
          Upload a Word (.docx) or PDF file with lesson content
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Lesson File *</Label>

            {/* Drag and Drop Zone */}
            <div
              onClick={createFileInputClickHandler(fileInputRef)}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-8
                transition-all duration-200 cursor-pointer
                ${isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }
                ${selectedFile ? 'bg-accent/30' : ''}
                ${fileError ? 'border-destructive bg-destructive/5' : ''}
              `}
            >
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept=".docx,.pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />

              <div className="flex flex-col items-center justify-center space-y-4">
                {/* Upload Icon or File Icon */}
                {!selectedFile ? (
                  <Upload className="w-12 h-12 text-muted-foreground" />
                ) : (
                  getFileIcon()
                )}

                {/* Upload Text or File Info */}
                {!selectedFile ? (
                  <>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        Click or drag file here
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported formats: .docx, .pdf (max 10MB)
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="w-full text-center space-y-2">
                    <p className="text-sm font-medium truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>

                    {/* Remove File Button */}
                    {!isUploading && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        className="mt-2"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove file
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Dragging Overlay */}
              {isDragging && (
                <div className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center">
                  <p className="text-sm font-medium text-primary">
                    Drop file here...
                  </p>
                </div>
              )}
            </div>

            {/* File Error */}
            {fileError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>{fileError}</span>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Lesson Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter lesson title..."
              {...register('title')}
              disabled={isUploading}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadSuccess && (
            <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Lesson uploaded successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-sm text-destructive">{uploadError}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isUploading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isUploading || !selectedFile || uploadSuccess}
            >
              {isUploading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Lesson
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
