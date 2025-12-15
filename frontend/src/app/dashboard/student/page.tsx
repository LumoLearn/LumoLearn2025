'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { lessonsApi } from '@/lib/api/lessons';
import { quizzesApi } from '@/lib/api/quizzes';
import parentService from '@/lib/api/parent';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [lessonsCount, setLessonsCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load published lessons
      const lessonsResponse = await lessonsApi.getPublishedLessons();
      setLessonsCount(lessonsResponse.lessons?.length || 0);

      // Load published quizzes
      const quizzesResponse = await quizzesApi.getPublishedQuizzes();
      setQuizzesCount(quizzesResponse.quizzes?.length || 0);

      // Load student progress to calculate completion rate
      try {
        const progress = await parentService.getStudentProgress(user.id);
        setCompletionRate(Math.round(progress.completionRate) || 0);
      } catch (err) {
        // If no progress yet, keep at 0
        console.log('No progress data yet');
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, Student!
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your learning today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>My Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-2xl font-bold animate-pulse">...</p>
            ) : (
              <p className="text-2xl font-bold">{lessonsCount}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Available lessons to study
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-2xl font-bold animate-pulse">...</p>
            ) : (
              <p className="text-2xl font-bold">{quizzesCount}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Available quizzes to complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-2xl font-bold animate-pulse">...</p>
            ) : (
              <p className="text-2xl font-bold">{completionRate}%</p>
            )}
            <p className="text-xs text-muted-foreground">
              Overall completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Customize your learning experience with personalized accessibility
            settings.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-muted rounded">Font Size</span>
            <span className="px-2 py-1 bg-muted rounded">Line Spacing</span>
            <span className="px-2 py-1 bg-muted rounded">Letter Spacing</span>
            <span className="px-2 py-1 bg-muted rounded">Color Themes</span>
            <span className="px-2 py-1 bg-muted rounded">Dyslexia-Friendly Fonts</span>
          </div>
          <Link href="/dashboard/student/settings">
            <Button className="w-full sm:w-auto">
              Configure Settings
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
