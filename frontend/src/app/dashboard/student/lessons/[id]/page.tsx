'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LessonViewer } from '@/components/features/lessons/LessonViewer';
import { EmptyState } from '@/components/dashboard/empty-state';

import { lessonsApi } from '@/lib/api/lessons';
import { studentService } from '@/lib/api/student';
import { useAuthStore } from '@/store/auth.store';
import type { Lesson } from '@/lib/types/lesson';
import type { AccessibilitySettings } from '@/lib/types/accessibility';
import { DEFAULT_SETTINGS } from '@/lib/types/accessibility';

export default function StudentLessonViewPage() {
  const params = useParams();
  const lessonId = params.id as string;
  const { user } = useAuthStore();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [accessibilitySettings, setAccessibilitySettings] =
    useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) {
        setIsLoadingSettings(false);
        return;
      }
      try {
        setIsLoadingSettings(true);
        const settings = await studentService.getAccessibilitySettings(user.id);
        setAccessibilitySettings(settings);
      } catch {
        setAccessibilitySettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchSettings();
  }, [user?.id]);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await lessonsApi.getLessonById(lessonId);
        if (!data.isPublished) {
          setError('Ova lekcija još nije objavljena.');
          setLesson(null);
          return;
        }
        setLesson(data);
      } catch (err: any) {
        const msg =
          err.response?.data?.error ||
          err.message ||
          'Učitavanje lekcije nije uspelo';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    if (lessonId) fetchLesson();
  }, [lessonId]);

  const isFullyLoaded = !isLoading && !isLoadingSettings;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
          <Link href="/dashboard/student/lessons">
            <ArrowLeft className="mr-2 size-4" />
            Nazad na lekcije
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/student/settings">
            <Settings className="mr-2 size-4" />
            Pristupačnost
          </Link>
        </Button>
      </div>

      {!isFullyLoaded ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <EmptyState
          variant="error"
          icon={AlertCircle}
          title="Učitavanje nije uspelo"
          description={error}
          action={
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/student/lessons">
                  <ArrowLeft className="mr-2 size-4" />
                  Nazad
                </Link>
              </Button>
              <Button onClick={() => window.location.reload()}>
                Pokušaj ponovo
              </Button>
            </div>
          }
        />
      ) : !lesson ? (
        <EmptyState
          icon={AlertCircle}
          title="Lekcija nije pronađena"
          description="Lekcija koju tražiš ne postoji ili još nije objavljena."
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/student/lessons">
                <ArrowLeft className="mr-2 size-4" />
                Nazad na lekcije
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <LessonViewer
            lesson={lesson}
            accessibilitySettings={accessibilitySettings}
            showMetadata={true}
          />
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex items-start gap-3 p-4 text-sm">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Settings className="size-4" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium">Prilagodi iskustvo čitanja</p>
                <p className="text-muted-foreground">
                  Na stranici{' '}
                  <Link
                    href="/dashboard/student/settings"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Podešavanja pristupačnosti
                  </Link>{' '}
                  možeš da promeniš veličinu fonta, razmake i boje.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
