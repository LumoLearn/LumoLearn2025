'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Settings,
  TrendingUp,
} from 'lucide-react';

import { useAuthStore } from '@/store/auth.store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { lessonsApi } from '@/lib/api/lessons';
import { quizzesApi } from '@/lib/api/quizzes';
import parentService from '@/lib/api/parent';
import { StatCard } from '@/components/dashboard/stat-card';

function getFirstName(user: { email?: string; firstName?: string | null } | null): string {
  if (!user) return 'učeniku';
  if (user.firstName) return user.firstName;
  if (user.email) return user.email.split('@')[0];
  return 'učeniku';
}

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [lessonsCount, setLessonsCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const lessonsResponse = await lessonsApi.getPublishedLessons();
      setLessonsCount(lessonsResponse.lessons?.length || 0);

      const quizzesResponse = await quizzesApi.getPublishedQuizzes();
      setQuizzesCount(quizzesResponse.quizzes?.length || 0);

      try {
        const progress = await parentService.getStudentProgress(user.id);
        setCompletionRate(Math.round(progress.completionRate) || 0);
      } catch {
        setCompletionRate(0);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const firstName = getFirstName(user as any);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Zdravo, {firstName}!
        </h2>
        <p className="mt-1 text-muted-foreground">
          Pregled tvog učenja — lekcije, kvizovi i napredak.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Moje lekcije"
          value={lessonsCount}
          description="Dostupne lekcije"
          icon={BookOpen}
          accent="primary"
          isLoading={isLoading}
          href="/dashboard/student/lessons"
        />
        <StatCard
          label="Kvizovi"
          value={quizzesCount}
          description="Dostupni kvizovi"
          icon={Brain}
          accent="info"
          isLoading={isLoading}
          href="/dashboard/student/quizzes"
        />
        <StatCard
          label="Napredak"
          value={`${completionRate}%`}
          description="Ukupna uspešnost"
          icon={TrendingUp}
          accent="success"
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="group transition-colors hover:border-primary/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="size-5" />
              </div>
              <CardTitle>Nastavi sa učenjem</CardTitle>
            </div>
            <CardDescription>
              Otvori lekcije i nastavi tamo gde si stao.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/dashboard/student/lessons">
                Pogledaj lekcije
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group transition-colors hover:border-primary/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[color:var(--info)]/10 text-[color:var(--info)]">
                <Brain className="size-5" />
              </div>
              <CardTitle>Reši kviz</CardTitle>
            </div>
            <CardDescription>
              Proveri znanje i osvoji bodove.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/dashboard/student/quizzes">
                Pogledaj kvizove
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Settings className="size-5" />
            </div>
            <div>
              <CardTitle>Podešavanja pristupačnosti</CardTitle>
              <CardDescription>
                Prilagodi iskustvo učenja svojim potrebama.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              'Veličina fonta',
              'Razmak između redova',
              'Razmak između slova',
              'Teme boja',
              'Fontovi za disleksiju',
            ].map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-md border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/dashboard/student/settings">
              Otvori podešavanja
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
