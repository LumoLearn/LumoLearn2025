'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BarChart3,
  Brain,
  CheckCircle2,
  Loader2,
  Target,
  TrendingUp,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/dashboard/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';

import parentService from '@/lib/api/parent';
import type { Child } from '@/lib/types/parent';
import type { StudentProgress } from '@/lib/types/progress';
import {
  ProgressStats,
  PerformanceDistribution,
  QuizAttemptCard,
  TrendBadge,
} from '@/components/features/progress';

function getFullName(child: Child) {
  if (child.firstName && child.lastName) {
    return `${child.firstName} ${child.lastName}`;
  }
  return child.firstName || child.lastName || child.email;
}

function getScoreTone(percentage: number): string {
  if (percentage >= 90) return 'text-[color:var(--success)]';
  if (percentage >= 70) return 'text-[color:var(--info)]';
  if (percentage >= 50) return 'text-[color:var(--warning)]';
  return 'text-destructive';
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('sr-RS', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChildProgressPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [child, setChild] = useState<Child | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgressData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const children = await parentService.getChildren();
      const currentChild = children.find((c) => c.id === studentId);

      if (!currentChild) {
        setError('Dete nije pronađeno.');
        return;
      }

      setChild(currentChild);

      const progressData = await parentService.getStudentProgress(studentId);
      setProgress(progressData);
    } catch (err: any) {
      setError(err.message || 'Učitavanje napretka nije uspelo');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
          <Link href="/dashboard/parent">
            <ArrowLeft className="mr-2 size-4" />
            Nazad na dashboard
          </Link>
        </Button>
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto size-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Učitavanje napretka...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
          <Link href="/dashboard/parent">
            <ArrowLeft className="mr-2 size-4" />
            Nazad na dashboard
          </Link>
        </Button>
        <EmptyState
          variant="error"
          icon={AlertCircle}
          title="Učitavanje nije uspelo"
          description={error || 'Dete nije pronađeno.'}
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" asChild>
                <Link href="/dashboard/parent">
                  <ArrowLeft className="mr-2 size-4" />
                  Nazad
                </Link>
              </Button>
              <Button onClick={loadProgressData}>Pokušaj ponovo</Button>
            </div>
          }
        />
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
          <Link href="/dashboard/parent">
            <ArrowLeft className="mr-2 size-4" />
            Nazad na dashboard
          </Link>
        </Button>
        <PageHeader
          title={`Napredak — ${getFullName(child)}`}
          description={child.email}
        />
        <EmptyState
          icon={Brain}
          title="Još nema aktivnosti"
          description={`${getFullName(child)} još nije rešio/la nijedan kviz.`}
        />
      </div>
    );
  }

  const fullName = getFullName(child);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
        <Link href="/dashboard/parent">
          <ArrowLeft className="mr-2 size-4" />
          Nazad na dashboard
        </Link>
      </Button>

      <PageHeader
        title={`Napredak — ${fullName}`}
        description={child.email}
        action={<TrendBadge trend={progress.trend} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProgressStats
          title="Ukupno kvizova"
          value={progress.totalAttempts}
          description={`${progress.totalQuizzes} jedinstvenih kvizova`}
          icon={Brain}
          accent="primary"
        />
        <ProgressStats
          title="Prosečan rezultat"
          value={`${Math.round(progress.averageScore)}%`}
          description="Ukupna uspešnost"
          icon={TrendingUp}
          accent="info"
          valueClassName={getScoreTone(progress.averageScore)}
        />
        <ProgressStats
          title="Najbolji rezultat"
          value={
            progress.bestPerformance
              ? `${Math.round(progress.bestPerformance.percentage)}%`
              : '—'
          }
          description={progress.bestPerformance?.quizTitle || 'Nema podataka'}
          icon={Award}
          accent="success"
        />
        <ProgressStats
          title="Stopa završetka"
          value={`${Math.round(progress.completionRate)}%`}
          description="Od dostupnih kvizova"
          icon={Target}
          accent="warning"
        />
      </div>

      <PerformanceDistribution
        distribution={progress.performanceDistribution}
        totalAttempts={progress.totalAttempts}
      />

      <Card>
        <CardHeader>
          <CardTitle>Skorašnji pokušaji</CardTitle>
          <CardDescription>
            Poslednjih {progress.recentAttempts.length}{' '}
            {progress.recentAttempts.length === 1
              ? 'predat kviz'
              : 'predatih kvizova'}
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          {progress.recentAttempts.length > 0 ? (
            <div className="space-y-3">
              {progress.recentAttempts.map((attempt) => (
                <QuizAttemptCard
                  key={attempt.id}
                  attempt={attempt}
                  showDate={true}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <BarChart3 className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nema skorašnjih pokušaja.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-[color:var(--success)]/30 bg-[color:var(--success)]/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-[color:var(--success)]" />
              <CardTitle className="text-[color:var(--success)]">
                Najbolji rezultat
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {progress.bestPerformance ? (
              <div className="space-y-2">
                <p className="font-medium">{progress.bestPerformance.quizTitle}</p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground tabular-nums">
                    Rezultat: {progress.bestPerformance.score}/
                    {progress.bestPerformance.totalQuestions}
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
              <p className="text-sm text-muted-foreground">Nema podataka</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="size-5 text-destructive" />
              <CardTitle className="text-destructive">
                Treba poboljšanja
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {progress.worstPerformance ? (
              <div className="space-y-2">
                <p className="font-medium">{progress.worstPerformance.quizTitle}</p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground tabular-nums">
                    Rezultat: {progress.worstPerformance.score}/
                    {progress.worstPerformance.totalQuestions}
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
              <p className="text-sm text-muted-foreground">Nema podataka</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
