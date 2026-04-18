'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Brain,
  Minus,
  TrendingDown,
  TrendingUp,
  UserPlus,
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import parentService from '@/lib/api/parent';
import type { Child } from '@/lib/types/parent';
import type { StudentProgress } from '@/lib/types/progress';
import { LinkStudentDialog } from '@/components/features/parent/LinkStudentDialog';
import { StatCard } from '@/components/dashboard/stat-card';

interface ChildWithProgress extends Child {
  progress?: StudentProgress;
}

type TrendKey = 'improving' | 'declining' | 'stable' | 'insufficient_data';

const TREND_CONFIG: Record<
  TrendKey,
  {
    label: string;
    variant: 'success' | 'destructive' | 'secondary' | 'outline';
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  improving: { label: 'Napreduje', variant: 'success', icon: TrendingUp },
  declining: { label: 'Treba pažnje', variant: 'destructive', icon: TrendingDown },
  stable: { label: 'Stabilno', variant: 'secondary', icon: Minus },
  insufficient_data: { label: 'Nedovoljno podataka', variant: 'outline', icon: AlertCircle },
};

function getTrendConfig(trend: string | undefined) {
  const key = (trend as TrendKey) ?? 'insufficient_data';
  return TREND_CONFIG[key] ?? TREND_CONFIG.insufficient_data;
}

function getInitials(firstName?: string | null, lastName?: string | null, email?: string): string {
  const f = firstName?.trim()?.[0];
  const l = lastName?.trim()?.[0];
  if (f && l) return `${f}${l}`.toUpperCase();
  if (f) return f.toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return '?';
}

function getFullName(child: Child) {
  if (child.firstName && child.lastName) {
    return `${child.firstName} ${child.lastName}`;
  }
  return child.firstName || child.lastName || child.email;
}

function getParentFirstName(user: { email?: string; firstName?: string | null } | null): string {
  if (!user) return 'roditelju';
  if (user.firstName) return user.firstName;
  if (user.email) return user.email.split('@')[0];
  return 'roditelju';
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

      const childrenData = await parentService.getChildren();

      const childrenWithProgress = await Promise.all(
        childrenData.map(async (child) => {
          try {
            const progress = await parentService.getStudentProgress(child.id);
            return { ...child, progress };
          } catch (err) {
            console.error(`Failed to load progress for child ${child.id}:`, err);
            return child;
          }
        })
      );

      setChildren(childrenWithProgress);
    } catch (err: any) {
      setError(err.message || 'Učitavanje podataka nije uspelo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkStudent = async (studentId: string) => {
    await parentService.linkStudent(studentId);
  };

  const totalQuizzes = children.reduce(
    (sum, child) => sum + (child.progress?.totalAttempts || 0),
    0
  );

  const getAverageScore = () => {
    const withProgress = children.filter((c) => c.progress);
    if (withProgress.length === 0) return 0;
    const total = withProgress.reduce(
      (sum, child) => sum + (child.progress?.averageScore || 0),
      0
    );
    return Math.round(total / withProgress.length);
  };

  const firstName = getParentFirstName(user as any);

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Zdravo, {firstName}!
          </h2>
        </div>
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="size-5 text-destructive" />
              <CardTitle className="text-destructive">Greška</CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={loadChildrenData}>
              Pokušaj ponovo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Zdravo, {firstName}!
          </h2>
          <p className="mt-1 text-muted-foreground">
            Prati napredak i aktivnosti tvoje dece.
          </p>
        </div>
        <LinkStudentDialog
          onSuccess={loadChildrenData}
          onLinkStudent={handleLinkStudent}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Povezana deca"
          value={children.length}
          description="Učenici u tvom nalogu"
          icon={Users}
          accent="primary"
          isLoading={isLoading}
        />
        <StatCard
          label="Rešeni kvizovi"
          value={totalQuizzes}
          description="Ukupno pokušaja"
          icon={Brain}
          accent="info"
          isLoading={isLoading}
        />
        <StatCard
          label="Prosečan rezultat"
          value={`${getAverageScore()}%`}
          description="Kroz svu decu"
          icon={TrendingUp}
          accent="success"
          isLoading={isLoading}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">
            Napredak dece
          </h3>
          <p className="text-sm text-muted-foreground">
            Detaljan pregled aktivnosti po detetu.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        ) : children.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <UserPlus className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Još nema povezane dece</p>
                <p className="text-sm text-muted-foreground">
                  Klikni na dugme iznad da povežeš učenika pomoću njegovog ID-a.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                onViewDetails={() =>
                  router.push(`/dashboard/parent/children/${child.id}/progress`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ChildCardProps {
  child: ChildWithProgress;
  onViewDetails: () => void;
}

function ChildCard({ child, onViewDetails }: ChildCardProps) {
  const trend = getTrendConfig(child.progress?.trend);
  const TrendIcon = trend.icon;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="size-12 rounded-lg">
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold">
              {getInitials(child.firstName, child.lastName, child.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 space-y-1">
            <CardTitle className="truncate text-lg">{getFullName(child)}</CardTitle>
            <CardDescription className="truncate text-xs">
              {child.email}
            </CardDescription>
          </div>
          {child.progress && (
            <Badge variant={trend.variant} className="gap-1 shrink-0">
              <TrendIcon className="size-3" />
              {trend.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {child.progress ? (
          <>
            <div className="grid grid-cols-3 gap-3 rounded-lg border bg-muted/30 p-3 text-center">
              <Stat value={child.progress.totalAttempts} label="Pokušaji" />
              <Stat
                value={`${Math.round(child.progress.averageScore)}%`}
                label="Prosek"
              />
              <Stat value={child.progress.totalQuizzes} label="Kvizovi" />
            </div>

            {child.progress.recentAttempts.length > 0 && (
              <div className="space-y-2">
                <Separator />
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Skorašnja aktivnost</p>
                </div>
                <div className="space-y-1.5">
                  {child.progress.recentAttempts.slice(0, 3).map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between gap-2 rounded-md border-l-2 border-primary/30 bg-muted/20 py-1.5 pl-2.5 pr-2 text-xs"
                    >
                      <span className="truncate text-muted-foreground flex-1">
                        {attempt.quizTitle}
                      </span>
                      <Badge
                        variant={
                          attempt.percentage >= 70
                            ? 'success'
                            : attempt.percentage >= 50
                              ? 'warning'
                              : 'destructive'
                        }
                        className="shrink-0"
                      >
                        {Math.round(attempt.percentage)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full" onClick={onViewDetails}>
              Detaljan pregled
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/20 py-6 text-center">
            <p className="text-sm font-medium">Još nema aktivnosti</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Učenik nije rešio nijedan kviz.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatProps {
  value: string | number;
  label: string;
}

function Stat({ value, label }: StatProps) {
  return (
    <div>
      <p className="text-xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
