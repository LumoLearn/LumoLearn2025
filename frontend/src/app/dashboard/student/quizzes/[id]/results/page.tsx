'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Loader2,
  Trophy,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/dashboard/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import { cn } from '@/lib/utils';

import type { QuizSubmissionResponse } from '@/lib/types/quiz';

function getScoreTone(percentage: number): {
  text: string;
  bg: string;
  badge: 'success' | 'warning' | 'destructive';
  label: string;
  message: string;
} {
  if (percentage >= 80) {
    return {
      text: 'text-[color:var(--success)]',
      bg: 'bg-[color:var(--success)]/10',
      badge: 'success',
      label: 'Odlično',
      message: 'Odličan rad! Savladao si gradivo.',
    };
  }
  if (percentage >= 60) {
    return {
      text: 'text-[color:var(--warning)]',
      bg: 'bg-[color:var(--warning)]/10',
      badge: 'warning',
      label: 'Dobro',
      message: 'Dobar trud! Pregledaj pitanja koja si promašio da napreduješ.',
    };
  }
  return {
    text: 'text-destructive',
    bg: 'bg-destructive/10',
    badge: 'destructive',
    label: 'Nastavi da vežbaš',
    message: 'Ne odustaj! Pregledaj gradivo i pokušaj ponovo.',
  };
}

function QuizResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<QuizSubmissionResponse | null>(null);
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    const data = searchParams.get('data');
    if (!data) {
      setParseError(true);
      return;
    }
    try {
      const parsed = JSON.parse(decodeURIComponent(data));
      setResults(parsed);
    } catch {
      setParseError(true);
    }
  }, [searchParams]);

  if (parseError) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
          <Link href="/dashboard/student/quizzes">
            <ArrowLeft className="mr-2 size-4" />
            Nazad na kvizove
          </Link>
        </Button>
        <EmptyState
          variant="error"
          icon={BarChart3}
          title="Rezultati nisu dostupni"
          description="Nije moguće učitati rezultate kviza. Pokušaj ponovo da uradiš kviz."
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/student/quizzes">
                <ArrowLeft className="mr-2 size-4" />
                Nazad na kvizove
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            Učitavanje rezultata...
          </p>
        </div>
      </div>
    );
  }

  const {
    score,
    totalQuestions,
    percentage,
    results: questionResults,
  } = results;

  if (!questionResults || !Array.isArray(questionResults) || questionResults.length === 0) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
          <Link href="/dashboard/student/quizzes">
            <ArrowLeft className="mr-2 size-4" />
            Nazad na kvizove
          </Link>
        </Button>
        <EmptyState
          variant="error"
          icon={BarChart3}
          title="Nepotpuni rezultati"
          description="Podaci o rezultatima su nepotpuni. Pokušaj ponovo da uradiš kviz."
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/student/quizzes">
                <ArrowLeft className="mr-2 size-4" />
                Nazad na kvizove
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const tone = getScoreTone(percentage);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
        <Link href="/dashboard/student/quizzes">
          <ArrowLeft className="mr-2 size-4" />
          Nazad na kvizove
        </Link>
      </Button>

      <PageHeader
        title="Rezultati kviza"
        description="Pregled tvog uspeha i detaljan prikaz odgovora."
        action={
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Trophy className="size-5" />
          </div>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div
              className={cn(
                'flex flex-col items-center justify-center rounded-lg p-4 text-center sm:p-6',
                tone.bg
              )}
            >
              <div className={cn('text-4xl font-bold sm:text-5xl', tone.text)}>
                {score}/{totalQuestions}
              </div>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                Tačnih odgovora
              </p>
            </div>

            <div
              className={cn(
                'flex flex-col items-center justify-center rounded-lg p-4 text-center sm:p-6',
                tone.bg
              )}
            >
              <div className={cn('text-4xl font-bold sm:text-5xl', tone.text)}>
                {percentage.toFixed(0)}%
              </div>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                Uspešnost
              </p>
            </div>

            <div
              className={cn(
                'flex flex-col items-center justify-center rounded-lg p-4 text-center sm:p-6',
                tone.bg
              )}
            >
              <Badge variant={tone.badge} className="px-3 py-1 text-sm">
                {tone.label}
              </Badge>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                Ocena
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed bg-muted/30">
        <CardContent className="flex items-start gap-3 p-4 text-sm">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Brain className="size-4" />
          </div>
          <p className="flex-1 font-medium">{tone.message}</p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold sm:text-2xl">Pregled odgovora</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pogledaj svoje odgovore i tačna rešenja.
        </p>
      </div>

      <div className="space-y-4">
        {questionResults.map((result, index) => {
          const isCorrect = result.isCorrect;

          return (
            <Card
              key={index}
              className={cn(
                isCorrect
                  ? 'border-[color:var(--success)]/30 bg-[color:var(--success)]/5'
                  : 'border-destructive/30 bg-destructive/5'
              )}
            >
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                      isCorrect
                        ? 'bg-[color:var(--success)]/15 text-[color:var(--success)]'
                        : 'bg-destructive/15 text-destructive'
                    )}
                  >
                    {index + 1}
                  </div>
                  <h3 className="flex-1 text-base font-semibold leading-snug sm:text-lg">
                    {result.question}
                  </h3>
                  {isCorrect ? (
                    <CheckCircle2 className="size-6 shrink-0 text-[color:var(--success)]" />
                  ) : (
                    <XCircle className="size-6 shrink-0 text-destructive" />
                  )}
                </div>

                <div className="space-y-2">
                  {result.options.map((option, optionIndex) => {
                    const isUserAnswer = result.userAnswer === option;
                    const isCorrectAnswer = result.correctAnswer === option;

                    return (
                      <div
                        key={optionIndex}
                        className={cn(
                          'flex items-start gap-3 rounded-lg border p-3',
                          isCorrectAnswer
                            ? 'border-[color:var(--success)]/40 bg-[color:var(--success)]/10'
                            : isUserAnswer && !isCorrect
                            ? 'border-destructive/40 bg-destructive/10'
                            : 'border-border bg-background'
                        )}
                      >
                        {isCorrectAnswer ? (
                          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[color:var(--success)]" />
                        ) : isUserAnswer && !isCorrect ? (
                          <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                        ) : (
                          <span className="mt-0.5 size-5 shrink-0" />
                        )}
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium sm:text-base">
                            {option}
                          </p>
                          {isCorrectAnswer && (
                            <p className="text-xs text-[color:var(--success)]">
                              Tačan odgovor
                            </p>
                          )}
                          {isUserAnswer && !isCorrect && (
                            <p className="text-xs text-destructive">
                              Tvoj odgovor
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard/student/quizzes">
            <ArrowLeft className="mr-2 size-4" />
            Nazad na kvizove
          </Link>
        </Button>
        <Button onClick={() => router.push('/dashboard/student/lessons')}>
          <BookOpen className="mr-2 size-4" />
          Nastavi sa učenjem
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}

export default function QuizResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto size-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Učitavanje rezultata...
            </p>
          </div>
        </div>
      }
    >
      <QuizResultsContent />
    </Suspense>
  );
}
