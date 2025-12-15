'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import parentService from '@/lib/api/parent';
import type { Child } from '@/lib/types/parent';
import type { StudentProgress } from '@/lib/types/progress';
import {
  ProgressStats,
  PerformanceDistribution,
  QuizAttemptCard,
  TrendBadge,
} from '@/components/features/progress';

export default function ChildProgressPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [child, setChild] = useState<Child | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgressData();
  }, [studentId]);

  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch children to get child info
      const children = await parentService.getChildren();
      const currentChild = children.find(c => c.id === studentId);

      if (!currentChild) {
        setError('Child not found');
        return;
      }

      setChild(currentChild);

      // Fetch progress
      const progressData = await parentService.getStudentProgress(studentId);
      setProgress(progressData);
    } catch (err: any) {
      setError(err.message || 'Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  };

  const getFullName = (child: Child) => {
    if (child.firstName && child.lastName) {
      return `${child.firstName} ${child.lastName}`;
    }
    return child.firstName || child.lastName || child.email;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 70) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Loading...</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading progress data...</div>
        </div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error || 'Child not found'}</p>
            <Button
              variant="outline"
              onClick={loadProgressData}
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            {getFullName(child)}&apos;s Progress
          </h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              No quiz activity yet.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {getFullName(child)} hasn&apos;t completed any quizzes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">
            {getFullName(child)}&apos;s Progress
          </h2>
          <p className="text-muted-foreground text-sm">{child.email}</p>
        </div>
        <TrendBadge trend={progress.trend} className="text-base px-4 py-2" />
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ProgressStats
          title="Total Quizzes"
          value={progress.totalAttempts}
          description={`${progress.totalQuizzes} unique quizzes`}
        />
        <ProgressStats
          title="Average Score"
          value={`${Math.round(progress.averageScore)}%`}
          description="Overall performance"
          valueClassName={getPerformanceColor(progress.averageScore)}
        />
        <ProgressStats
          title="Best Score"
          value={progress.bestPerformance ? `${Math.round(progress.bestPerformance.percentage)}%` : 'N/A'}
          description={progress.bestPerformance?.quizTitle || 'No data'}
          valueClassName="text-green-600 dark:text-green-400"
        />
        <ProgressStats
          title="Completion Rate"
          value={`${Math.round(progress.completionRate)}%`}
          description="Of available quizzes"
        />
      </div>

      {/* Performance Distribution */}
      <PerformanceDistribution
        distribution={progress.performanceDistribution}
        totalAttempts={progress.totalAttempts}
      />

      {/* Recent Quiz Attempts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Quiz Attempts</CardTitle>
          <CardDescription>
            Latest {progress.recentAttempts.length} quiz submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {progress.recentAttempts.length > 0 ? (
            <div className="space-y-3">
              {progress.recentAttempts.map((attempt) => (
                <QuizAttemptCard key={attempt.id} attempt={attempt} showDate={true} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent quiz attempts
            </p>
          )}
        </CardContent>
      </Card>

      {/* Best and Worst Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">
              Best Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progress.bestPerformance ? (
              <div className="space-y-2">
                <p className="font-medium">{progress.bestPerformance.quizTitle}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Score: {progress.bestPerformance.score}/{progress.bestPerformance.totalQuestions}
                  </span>
                  <Badge variant="success" className="text-base">
                    {Math.round(progress.bestPerformance.percentage)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(progress.bestPerformance.submittedAt)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              Needs Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progress.worstPerformance ? (
              <div className="space-y-2">
                <p className="font-medium">{progress.worstPerformance.quizTitle}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Score: {progress.worstPerformance.score}/{progress.worstPerformance.totalQuestions}
                  </span>
                  <Badge variant="destructive" className="text-base">
                    {Math.round(progress.worstPerformance.percentage)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(progress.worstPerformance.submittedAt)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
