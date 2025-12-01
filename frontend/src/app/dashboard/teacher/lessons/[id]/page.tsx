'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Trash2, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LessonViewer } from '@/components/features/lessons/LessonViewer';

import { lessonsApi } from '@/lib/api/lessons';
import type { Lesson } from '@/lib/types/lesson';

/**
 * Teacher Lesson Viewer Page
 *
 * Allows teachers to:
 * - View their lesson content
 * - See lesson metadata
 * - Publish/unpublish lessons
 * - Navigate back to lessons list
 */
export default function TeacherLessonViewPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Fetch lesson on mount
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('[Teacher Lesson View] Fetching lesson:', lessonId);
        const data = await lessonsApi.getLessonById(lessonId);
        console.log('[Teacher Lesson View] Lesson data:', data);

        setLesson(data);
      } catch (err: any) {
        console.error('[Teacher Lesson View] Error fetching lesson:', err);
        const errorMsg =
          err.response?.data?.error ||
          err.message ||
          'Failed to load lesson';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  // Handle publish/unpublish toggle
  const handleTogglePublish = async () => {
    if (!lesson) return;

    try {
      setIsPublishing(true);
      setError(null);

      console.log(
        `[Teacher Lesson View] ${lesson.isPublished ? 'Unpublishing' : 'Publishing'} lesson:`,
        lesson.id
      );

      const updatedLesson = lesson.isPublished
        ? await lessonsApi.unpublishLesson(lesson.id)
        : await lessonsApi.publishLesson(lesson.id);

      console.log('[Teacher Lesson View] Updated lesson (metadata only):', updatedLesson);

      // Refetch lesson with full content
      // The publish/unpublish endpoint returns metadata only, not content
      const fullLesson = await lessonsApi.getLessonById(lesson.id);
      console.log('[Teacher Lesson View] Refetched full lesson with content:', fullLesson);

      setLesson(fullLesson);
    } catch (err: any) {
      console.error('[Teacher Lesson View] Error toggling publish status:', err);
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Failed to update lesson status';
      setError(errorMsg);
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.push('/dashboard/teacher/lessons');
  };

  // Handle navigate to quiz generator
  const handleGenerateQuiz = () => {
    router.push(`/dashboard/teacher/lessons/${lessonId}/quiz`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading lesson...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <Card className="border-destructive">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Failed to Load Lesson</h3>
                <p className="text-sm text-muted-foreground max-w-md">{error}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Lessons
                </Button>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not found state
  if (!lesson) {
    return (
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-muted p-3">
                <Trash2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Lesson Not Found</h3>
                <p className="text-sm text-muted-foreground">
                  The lesson you're looking for doesn't exist or has been deleted.
                </p>
              </div>
              <Button variant="outline" onClick={handleBack} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Lessons
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      {/* Header with actions */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lessons
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateQuiz}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Quiz with AI
          </Button>
          <Button
            variant={lesson.isPublished ? 'outline' : 'default'}
            onClick={handleTogglePublish}
            disabled={isPublishing}
            aria-busy={isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {lesson.isPublished ? 'Unpublishing...' : 'Publishing...'}
              </>
            ) : (
              <>
                {lesson.isPublished ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Publish
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Card className="mb-6 border-destructive bg-destructive/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 text-sm text-destructive">
              <Trash2 className="h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lesson content */}
      <LessonViewer lesson={lesson} showMetadata={true} />
    </div>
  );
}
