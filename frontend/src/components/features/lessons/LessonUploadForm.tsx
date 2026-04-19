'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, FileText, File as FileIcon, X, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

import { lessonsApi } from '@/lib/api/lessons';
import { lessonUploadSchema, type LessonUploadFormData, formatFileSize, getFileTypeIcon } from '@/lib/schemas/lesson';
import {
  handleFileSelection,
  createFileInputClickHandler,
  preventDefaultDrag,
  isFileDropped,
  validateFile,
} from '@/lib/utils/file-upload';
import { cn } from '@/lib/utils';

const REDIRECT_DELAY_MS = 1200;

export function LessonUploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragCounterRef = useRef(0);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    const file = handleFileSelection(event);
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      setFileError(validation.error || 'Neispravan fajl');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setFileError(null);
    setValue('file', file, { shouldValidate: true });

    if (!titleValue) {
      const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      setValue('title', fileNameWithoutExtension);
    }
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    preventDefaultDrag(event);
    dragCounterRef.current += 1;
    if (isFileDropped(event)) setIsDragging(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    preventDefaultDrag(event);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    preventDefaultDrag(event);
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    preventDefaultDrag(event);
    dragCounterRef.current = 0;
    setIsDragging(false);
    handleFileChange(event);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    setValue('file', null as any);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  const onSubmit = async (data: LessonUploadFormData) => {
    if (!selectedFile) {
      setFileError('Morate izabrati fajl');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await lessonsApi.uploadLesson(selectedFile, data.title, (progressEvent) => {
        setUploadProgress(progressEvent.percentage);
      });

      setUploadProgress(100);
      setUploadSuccess(true);
      toast.success('Lekcija je uspešno otpremljena');

      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/dashboard/teacher/lessons');
      }, REDIRECT_DELAY_MS);
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        'Došlo je do greške prilikom otpremanja lekcije';
      toast.error(message);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const renderFileIcon = () => {
    const fileType = selectedFile ? getFileTypeIcon(selectedFile.name) : 'unknown';
    const iconClass = 'size-12';
    if (fileType === 'pdf') {
      return (
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <FileIcon className={cn(iconClass, 'text-destructive')} />
        </div>
      );
    }
    return (
      <div className="flex size-16 items-center justify-center rounded-full bg-info/10">
        <FileText className={cn(iconClass, 'text-info')} />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="file-upload">
          Fajl lekcije <span className="text-destructive">*</span>
        </Label>

        <div
          onClick={!isUploading ? createFileInputClickHandler(fileInputRef) : undefined}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative flex min-h-[280px] items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors',
            !isUploading && 'cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-accent/40',
            selectedFile && !fileError && 'bg-accent/30',
            fileError && 'border-destructive bg-destructive/5',
            isUploading && 'opacity-60 pointer-events-none'
          )}
        >
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".docx,.pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />

          <div className="flex flex-col items-center justify-center gap-4 text-center">
            {!selectedFile ? (
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                <Upload className="size-7 text-primary" />
              </div>
            ) : (
              renderFileIcon()
            )}

            {!selectedFile ? (
              <div className="space-y-1.5">
                <p className="text-base font-medium">Klikni ili prevuci fajl ovde</p>
                <p className="text-sm text-muted-foreground">
                  Podržani formati: .docx, .pdf &nbsp;·&nbsp; maks. 10 MB
                </p>
              </div>
            ) : (
              <div className="w-full space-y-2">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                {!isUploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                  >
                    <X className="mr-1 size-4" />
                    Ukloni fajl
                  </Button>
                )}
              </div>
            )}
          </div>

          {isDragging && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-primary/10">
              <p className="text-sm font-medium text-primary">Otpusti fajl ovde...</p>
            </div>
          )}
        </div>

        {fileError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4" />
            <span>{fileError}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">
          Naslov lekcije <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="npr. Uvod u ćelijsku biologiju"
          {...register('title')}
          disabled={isUploading}
          aria-invalid={errors.title ? 'true' : 'false'}
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {(isUploading || uploadSuccess) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {uploadSuccess ? 'Otpremljeno' : 'Otpremanje...'}
            </span>
            <span className="font-medium tabular-nums">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isUploading}
        >
          Otkaži
        </Button>
        <Button
          type="submit"
          disabled={isUploading || !selectedFile || uploadSuccess}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Otpremanje...
            </>
          ) : (
            <>
              <Upload className="mr-2 size-4" />
              Otpremi lekciju
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
