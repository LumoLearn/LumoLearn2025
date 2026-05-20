'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Brain,
  CheckCircle2,
  HelpCircle,
  Search,
  Sparkles,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth.store';
import { PageHeader } from '@/components/dashboard/page-header';
import { SearchInput } from '@/components/dashboard/search-input';
import { EmptyState } from '@/components/dashboard/empty-state';

import { quizzesApi } from '@/lib/api/quizzes';
import parentService from '@/lib/api/parent';
import type { Quiz } from '@/lib/types/quiz';

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Lako',
  medium: 'Srednje',
  hard: 'Teško',
};

function getDifficultyVariant(
  difficulty?: string
): 'success' | 'warning' | 'destructive' | 'outline' {
  switch (difficulty) {
    case 'easy':
      return 'success';
    case 'medium':
      return 'warning';
    case 'hard':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function StudentQuizzesPage() {
  const { user } = useAuthStore();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [completedQuizIds, setCompletedQuizIds] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await quizzesApi.getPublishedQuizzes();
        setQuizzes(response.quizzes || []);

        if (user) {
          try {
            const progress = await parentService.getStudentProgress(user.id);
            setCompletedQuizIds(
              new Set(progress.recentAttempts.map((a) => a.quizId))
            );
          } catch {
            // No progress yet
          }
        }
      } catch (err: any) {
        const msg =
          err.response?.data?.error ||
          err.message ||
          'Učitavanje kvizova nije uspelo';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, [user]);

  const filteredQuizzes = searchQuery.trim()
    ? quizzes.filter((quiz) =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quizzes;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moji kvizovi"
        description="Proveri znanje kroz interaktivne kvizove."
      />

      {!isLoading && !error && quizzes.length > 0 && (
        <div className="space-y-2">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Pretraži kvizove..."
          />
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              Pronađeno {filteredQuizzes.length}{' '}
              {filteredQuizzes.length === 1 ? 'kviz' : 'kvizova'}
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          variant="error"
          icon={AlertCircle}
          title="Učitavanje nije uspelo"
          description={error}
          action={
            <Button onClick={() => window.location.reload()}>
              Pokušaj ponovo
            </Button>
          }
        />
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="Još nema dostupnih kvizova"
          description="Trenutno nije objavljen nijedan kviz. Proveri kasnije."
        />
      ) : filteredQuizzes.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nema rezultata"
          description={`Nijedan kviz ne odgovara upitu "${searchQuery}".`}
          action={
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Obriši pretragu
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              isCompleted={completedQuizIds.has(quiz.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface QuizCardProps {
  quiz: Quiz;
  isCompleted: boolean;
}

function QuizCard({ quiz, isCompleted }: QuizCardProps) {
  const difficulty = quiz.quizMetadata?.difficulty;
  const numQuestions = quiz.quizMetadata?.numQuestions;
  const isAI = quiz.quizMetadata?.generatedBy === 'ai';

  return (
    <Link
      href={`/dashboard/student/quizzes/${quiz.id}/take`}
      className="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="h-full transition-all hover:border-primary/40 hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex size-12 items-center justify-center rounded-lg bg-[color:var(--info)]/10 text-[color:var(--info)]">
              <Brain className="size-6" />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {isCompleted && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="size-3" />
                  Rešen
                </Badge>
              )}
              {difficulty && (
                <Badge variant={getDifficultyVariant(difficulty)}>
                  {DIFFICULTY_LABELS[difficulty] ?? difficulty}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
              {quiz.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {quiz.lessonId ? 'Kviz uz lekciju' : 'Samostalan kviz'}
            </p>
          </div>

          <div className="flex-1" />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {numQuestions !== undefined && (
              <span className="inline-flex items-center gap-1.5">
                <HelpCircle className="size-3.5" />
                {numQuestions}{' '}
                {numQuestions === 1 ? 'pitanje' : 'pitanja'}
              </span>
            )}
            {isAI && (
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                AI generisano
              </span>
            )}
          </div>

          <div className="border-t pt-4">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              {isCompleted ? 'Pokušaj ponovo' : 'Započni kviz'}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
