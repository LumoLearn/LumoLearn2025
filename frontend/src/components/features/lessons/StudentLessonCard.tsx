'use client';

import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import type { Lesson } from '@/lib/types/lesson';

/**
 * StudentLessonCard Component Props
 */
interface StudentLessonCardProps {
  lesson: Lesson;
}

/**
 * Format date to readable string in Serbian locale
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * StudentLessonCard Component
 *
 * Simplified lesson card for student view.
 * Shows lesson title, creation date, and a button to start the lesson.
 */
export function StudentLessonCard({ lesson }: StudentLessonCardProps) {
  const router = useRouter();

  /**
   * Handle "Start Lesson" button click
   */
  const handleStartLesson = () => {
    router.push(`/dashboard/student/lessons/${lesson.id}`);
  };

  return (
    <Card
      className="transition-all duration-200 hover:shadow-md hover:border-primary/50 cursor-pointer"
      onClick={handleStartLesson}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">
              {lesson.title}
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(lesson.createdAt)}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Button className="w-full" onClick={handleStartLesson}>
          <ArrowRight className="mr-2 h-4 w-4" />
          Start Lesson
        </Button>
      </CardFooter>
    </Card>
  );
}
