'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  FileText,
  Plus,
  Upload,
  Users,
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
import { StatCard } from '@/components/dashboard/stat-card';

interface DashboardStats {
  totalLessons: number;
  publishedLessons: number;
  unpublishedLessons: number;
  totalQuizzes: number;
  totalStudents: number;
}

function getFirstName(user: { email?: string; firstName?: string | null } | null): string {
  if (!user) return 'nastavniče';
  if (user.firstName) return user.firstName;
  if (user.email) return user.email.split('@')[0];
  return 'nastavniče';
}

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalLessons: 0,
    publishedLessons: 0,
    unpublishedLessons: 0,
    totalQuizzes: 0,
    totalStudents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        const allLessonsResponse = await lessonsApi.getLessons();
        const totalLessons = allLessonsResponse.lessons?.length || 0;

        const publishedResponse = await lessonsApi.getLessons({ isPublished: true });
        const publishedLessons = publishedResponse.lessons?.length || 0;

        const unpublishedLessons = totalLessons - publishedLessons;

        let totalQuizzes = 0;
        try {
          const quizzesResponse = await quizzesApi.getQuizzes();
          totalQuizzes = quizzesResponse.quizzes?.length || 0;
        } catch (error) {
          console.error('Failed to fetch quizzes:', error);
        }

        setStats({
          totalLessons,
          publishedLessons,
          unpublishedLessons,
          totalQuizzes,
          totalStudents: 0,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const firstName = getFirstName(user as any);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Zdravo, {firstName}!
          </h2>
          <p className="mt-1 text-muted-foreground">
            Upravljaj lekcijama i prati napredak učenika.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teacher/lessons/upload">
            <Plus className="mr-2 size-4" />
            Nova lekcija
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ukupno lekcija"
          value={stats.totalLessons}
          description="Sve kreirane lekcije"
          icon={FileText}
          accent="primary"
          isLoading={isLoading}
        />
        <StatCard
          label="Objavljene"
          value={stats.publishedLessons}
          description="Aktivne lekcije"
          icon={CheckCircle2}
          accent="success"
          isLoading={isLoading}
        />
        <StatCard
          label="Kvizovi"
          value={stats.totalQuizzes}
          description="Ukupan broj kvizova"
          icon={Brain}
          accent="info"
          isLoading={isLoading}
        />
        <StatCard
          label="Učenici"
          value={stats.totalStudents}
          description="Prijavljeni učenici"
          icon={Users}
          accent="warning"
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brze akcije</CardTitle>
          <CardDescription>
            Najčešće korišćene radnje za efikasan rad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickAction
              href="/dashboard/teacher/lessons/upload"
              icon={Upload}
              title="Upload lekcije"
              description="Dodaj novu lekciju uz AI podršku"
            />
            <QuickAction
              href="/dashboard/teacher/lessons"
              icon={BookOpen}
              title="Sve lekcije"
              description="Pregled i uređivanje postojećih"
            />
          </div>
        </CardContent>
      </Card>

      {stats.unpublishedLessons > 0 && !isLoading && (
        <Card className="border-[color:var(--warning)]/30 bg-[color:var(--warning)]/5">
          <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--warning)]/15 text-[color:var(--warning)]">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="font-medium">
                  {stats.unpublishedLessons}{' '}
                  {stats.unpublishedLessons === 1
                    ? 'neobjavljena lekcija'
                    : 'neobjavljenih lekcija'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Pregledaj i objavi ih da bi bile dostupne učenicima.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/dashboard/teacher/lessons">
                Otvori
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface QuickActionProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function QuickAction({ href, icon: Icon, title, description }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}
