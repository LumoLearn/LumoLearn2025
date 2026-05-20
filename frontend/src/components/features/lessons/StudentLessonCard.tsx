'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Calendar } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import type { Lesson } from '@/lib/types/lesson';

interface StudentLessonCardProps {
  lesson: Lesson;
}

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

export function StudentLessonCard({ lesson }: StudentLessonCardProps) {
  return (
    <Link
      href={`/dashboard/student/lessons/${lesson.id}`}
      className="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="h-full transition-all hover:border-primary/40 hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-4 p-6">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="size-6" />
          </div>

          <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
            {lesson.title}
          </h3>

          <div className="flex-1" />

          <div className="flex items-center justify-between gap-2 border-t pt-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              {formatDate(lesson.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Otvori
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
