'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Settings, Loader2, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LessonViewer } from '@/components/features/lessons/LessonViewer';

import { lessonsApi } from '@/lib/api/lessons';
import { studentService } from '@/lib/api/student';
import { useAuthStore } from '@/store/auth.store';
import type { Lesson } from '@/lib/types/lesson';
import type { AccessibilitySettings } from '@/lib/types/accessibility';
import { DEFAULT_SETTINGS } from '@/lib/types/accessibility';

/**
 * Student Lesson Viewer Page
 *
 * Allows students to:
 * - View published lesson content
 * - See content with their accessibility settings applied
 * - Navigate to accessibility settings
 * - Navigate back to lessons list
 */
export default function StudentLessonViewPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;
  const { user } = useAuthStore();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch accessibility settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) {
        setIsLoadingSettings(false);
        return;
      }

      try {
        setIsLoadingSettings(true);
        console.log('[Student Lesson View] Fetching accessibility settings for user:', user.id);

        const settings = await studentService.getAccessibilitySettings(user.id);
        console.log('[Student Lesson View] Accessibility settings:', settings);

        setAccessibilitySettings(settings);
      } catch (err: any) {
        console.error('[Student Lesson View] Error fetching accessibility settings:', err);
        // Fallback to default settings on error
        setAccessibilitySettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [user?.id]);

  // Fetch lesson on mount
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('[Student Lesson View] Fetching lesson:', lessonId);
        const data = await lessonsApi.getLessonById(lessonId);
        console.log('[Student Lesson View] Lesson data:', data);

        // Check if lesson is published
        if (!data.isPublished) {
          setError('This lesson is not published yet.');
          setLesson(null);
          return;
        }

        setLesson(data);
      } catch (err: any) {
        console.error('[Student Lesson View] Error fetching lesson:', err);
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

  // Handle back navigation
  const handleBack = () => {
    router.push('/dashboard/student/lessons');
  };

  // Handle settings navigation
  const handleGoToSettings = () => {
    router.push('/dashboard/student/settings');
  };

  // Combined loading state (wait for both lesson and settings)
  const isFullyLoaded = !isLoading && !isLoadingSettings;

  // Loading state
  if (!isFullyLoaded) {
    return (
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              {isLoading ? 'Loading lesson...' : 'Loading accessibility settings...'}
            </p>
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
                <AlertCircle className="h-6 w-6 text-destructive" />
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
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Lesson Not Found</h3>
                <p className="text-sm text-muted-foreground">
                  The lesson you're looking for doesn't exist or is not published yet.
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
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lessons
        </Button>

        <Button variant="outline" onClick={handleGoToSettings}>
          <Settings className="mr-2 h-4 w-4" />
          Accessibility Settings
        </Button>
      </div>

      {/* Lesson content with accessibility settings */}
      <LessonViewer
        lesson={lesson}
        accessibilitySettings={accessibilitySettings}
        showMetadata={true}
      />

      {/* Help text for accessibility */}
      <Card className="mt-6 border-dashed bg-muted/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3 text-sm">
            <Settings className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Customize Your Reading Experience</p>
              <p className="text-muted-foreground">
                Visit the{' '}
                <button
                  onClick={handleGoToSettings}
                  className="underline hover:text-foreground transition-colors"
                >
                  Accessibility Settings
                </button>{' '}
                page to adjust font size, spacing, and colors to your preference.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
