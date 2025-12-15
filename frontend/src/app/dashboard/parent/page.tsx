'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import parentService from '@/lib/api/parent';
import type { Child } from '@/lib/types/parent';
import type { StudentProgress } from '@/lib/types/progress';
import { LinkStudentDialog } from '@/components/features/parent/LinkStudentDialog';

interface ChildWithProgress extends Child {
  progress?: StudentProgress;
}

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [children, setChildren] = useState<ChildWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChildrenData();
  }, []);

  const loadChildrenData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch children
      const childrenData = await parentService.getChildren();

      // Fetch progress for each child
      const childrenWithProgress = await Promise.all(
        childrenData.map(async (child) => {
          try {
            const progress = await parentService.getStudentProgress(child.id);
            return { ...child, progress };
          } catch (err) {
            // If progress fetch fails for a child, continue without it
            console.error(`Failed to load progress for child ${child.id}:`, err);
            return child;
          }
        })
      );

      setChildren(childrenWithProgress);
    } catch (err: any) {
      setError(err.message || 'Failed to load children data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkStudent = async (studentId: string) => {
    await parentService.linkStudent(studentId);
  };

  const getFullName = (child: Child) => {
    if (child.firstName && child.lastName) {
      return `${child.firstName} ${child.lastName}`;
    }
    return child.firstName || child.lastName || child.email;
  };

  const getTotalQuizzes = () => {
    return children.reduce((sum, child) => sum + (child.progress?.totalAttempts || 0), 0);
  };

  const getAverageScore = () => {
    const childrenWithProgress = children.filter(c => c.progress);
    if (childrenWithProgress.length === 0) return 0;

    const totalAvg = childrenWithProgress.reduce((sum, child) =>
      sum + (child.progress?.averageScore || 0), 0
    );
    return Math.round(totalAvg / childrenWithProgress.length);
  };

  const getTrendBadgeVariant = (trend: string) => {
    switch (trend) {
      case 'improving': return 'success';
      case 'declining': return 'destructive';
      case 'stable': return 'secondary';
      default: return 'outline';
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈 Improving';
      case 'declining': return '📉 Needs Attention';
      case 'stable': return '➡️ Stable';
      default: return '📊 Insufficient Data';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, Parent!
          </h2>
          <p className="text-muted-foreground">
            Monitor your child&apos;s learning progress and activities.
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, Parent!
          </h2>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              onClick={loadChildrenData}
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, Parent!
        </h2>
        <p className="text-muted-foreground">
          Monitor your child&apos;s learning progress and activities.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Children</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{children.length}</p>
            <p className="text-xs text-muted-foreground">
              Connected students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{getTotalQuizzes()}</p>
            <p className="text-xs text-muted-foreground">
              Quizzes completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{getAverageScore()}%</p>
            <p className="text-xs text-muted-foreground">
              Across all children
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Children Progress Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold tracking-tight">
            Children&apos;s Progress
          </h3>
          <LinkStudentDialog
            onSuccess={loadChildrenData}
            onLinkStudent={handleLinkStudent}
          />
        </div>

        {children.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                No children linked yet.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Click the &quot;Link Student&quot; button above to connect with your children.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {children.map((child) => (
              <Card key={child.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        {getFullName(child)}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {child.email}
                      </CardDescription>
                    </div>
                    {child.progress && (
                      <Badge variant={getTrendBadgeVariant(child.progress.trend)}>
                        {getTrendLabel(child.progress.trend)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {child.progress ? (
                    <>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold">
                            {child.progress.totalAttempts}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Quizzes
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {Math.round(child.progress.averageScore)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Avg Score
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {child.progress.totalQuizzes}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Unique
                          </p>
                        </div>
                      </div>

                      {child.progress.recentAttempts.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Recent Activity</p>
                          <div className="space-y-1">
                            {child.progress.recentAttempts.slice(0, 3).map((attempt) => (
                              <div
                                key={attempt.id}
                                className="flex justify-between items-center text-xs border-l-2 border-primary/20 pl-2 py-1"
                              >
                                <span className="text-muted-foreground truncate flex-1">
                                  {attempt.quizTitle}
                                </span>
                                <Badge
                                  variant={attempt.percentage >= 70 ? 'success' : attempt.percentage >= 50 ? 'warning' : 'destructive'}
                                  className="ml-2"
                                >
                                  {Math.round(attempt.percentage)}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        className="w-full"
                        onClick={() => router.push(`/dashboard/parent/children/${child.id}/progress`)}
                      >
                        View Detailed Progress
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No quiz activity yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Student hasn&apos;t completed any quizzes
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
