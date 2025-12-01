'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Trash2, Upload as UploadIcon, Download as DownloadIcon, Calendar, FileText } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { Lesson } from '@/lib/types/lesson';
import { lessonsApi } from '@/lib/api/lessons';

/**
 * Props for LessonCard component
 */
interface LessonCardProps {
  lesson: Lesson;
  onUpdate?: () => void;
}

/**
 * LessonCard Component
 *
 * Displays a single lesson with:
 * - Title and metadata (date, status)
 * - Action buttons (View, Publish/Unpublish, Delete)
 * - Confirmation dialogs for destructive actions
 * - Dynamic status badges
 */
export function LessonCard({ lesson, onUpdate }: LessonCardProps) {
  const router = useRouter();

  // State for dialogs and actions
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Format date to readable string
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  /**
   * Handle view lesson - navigate to lesson viewer
   */
  const handleView = () => {
    router.push(`/dashboard/teacher/lessons/${lesson.id}`);
  };

  /**
   * Handle publish/unpublish toggle
   */
  const handleTogglePublish = async () => {
    setIsPublishing(true);
    setError(null);

    try {
      if (lesson.isPublished) {
        await lessonsApi.unpublishLesson(lesson.id);
      } else {
        await lessonsApi.publishLesson(lesson.id);
      }

      // Trigger parent refresh
      onUpdate?.();
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.message ||
        `Error ${lesson.isPublished ? 'unpublishing' : 'publishing'} lesson`
      );
    } finally {
      setIsPublishing(false);
    }
  };

  /**
   * Handle delete lesson with confirmation
   */
  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await lessonsApi.deleteLesson(lesson.id);
      setShowDeleteDialog(false);

      // Trigger parent refresh
      onUpdate?.();
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Error deleting lesson'
      );
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Get status badge variant and text based on publish status
   */
  const getStatusBadge = () => {
    if (lesson.isPublished) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <span className="w-2 h-2 bg-white rounded-full"></span>
          Published
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
        Unpublished
      </Badge>
    );
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 mt-1">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight truncate" title={lesson.title}>
                  {lesson.title}
                </h3>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Created: {formatDate(lesson.createdAt)}</span>
          </div>

          {lesson.metadata && (
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="uppercase">{lesson.metadata.fileType}</span>
              {lesson.metadata.fileSize && (
                <span> • {(lesson.metadata.fileSize / 1024).toFixed(0)} KB</span>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-3 p-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive">
              {error}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-2 pt-3 border-t">
          {/* View Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>

          {/* Publish/Unpublish Button */}
          <Button
            variant={lesson.isPublished ? 'secondary' : 'default'}
            size="sm"
            onClick={handleTogglePublish}
            disabled={isPublishing || isDeleting}
            className="flex-1"
          >
            {isPublishing ? (
              <>
                <div className="w-4 h-4 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {lesson.isPublished ? 'Unpublishing...' : 'Publishing...'}
              </>
            ) : (
              <>
                {lesson.isPublished ? (
                  <>
                    <DownloadIcon className="w-4 h-4 mr-1" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4 mr-1" />
                    Publish
                  </>
                )}
              </>
            )}
          </Button>

          {/* Delete Button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isPublishing || isDeleting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the lesson &quot;{lesson.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
