'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/dashboard/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import { cn } from '@/lib/utils';

import { quizzesApi } from '@/lib/api/quizzes';
import type { Quiz, QuizQuestion } from '@/lib/types/quiz';

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

export default function QuizTakePage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await quizzesApi.getQuizById(quizId, false);

        if (data.status !== 'published') {
          setError('Ovaj kviz još nije objavljen.');
          setQuiz(null);
          return;
        }

        if (!data.questions || data.questions.length === 0) {
          setError('Ovaj kviz nema pitanja.');
          setQuiz(null);
          return;
        }

        setQuiz(data);
        setQuestions(data.questions);
      } catch (err: any) {
        const msg =
          err.response?.data?.error ||
          err.message ||
          'Učitavanje kviza nije uspelo';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    if (quizId) fetchQuiz();
  }, [quizId]);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [`question${questionIndex}`]: answer,
    }));
  };

  const isAllAnswered = questions.every(
    (_, index) => selectedAnswers[`question${index}`]
  );

  const handleSubmitClick = () => {
    if (!isAllAnswered) {
      toast.error('Molimo te da odgovoriš na sva pitanja pre predaje.');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = async () => {
    try {
      setIsSubmitting(true);
      setShowConfirmation(false);

      const result = await quizzesApi.submitQuiz(quizId, selectedAnswers);
      router.push(
        `/dashboard/student/quizzes/${quizId}/results?data=${encodeURIComponent(
          JSON.stringify(result)
        )}`
      );
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Predaja kviza nije uspela';
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    if (Object.keys(selectedAnswers).length > 0) {
      setShowLeaveDialog(true);
    } else {
      router.push('/dashboard/student/quizzes');
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = questions.length;
  const progressPercentage =
    totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            Učitavanje kviza...
          </p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
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
          icon={AlertCircle}
          title="Kviz nije dostupan"
          description={error || 'Kviz koji tražiš ne postoji ili nije objavljen.'}
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

  const difficulty = quiz.quizMetadata?.difficulty;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBackClick}
        className="-ml-3 w-fit"
      >
        <ArrowLeft className="mr-2 size-4" />
        Nazad na kvizove
      </Button>

      <PageHeader
        title={quiz.title}
        description={
          quiz.lessonId ? 'Kviz uz lekciju' : 'Samostalan kviz'
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {difficulty && (
              <Badge variant={getDifficultyVariant(difficulty)}>
                {DIFFICULTY_LABELS[difficulty] ?? difficulty}
              </Badge>
            )}
            <div className="flex size-10 items-center justify-center rounded-lg bg-[color:var(--info)]/10 text-[color:var(--info)]">
              <Brain className="size-5" />
            </div>
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Napredak</span>
            <span className="text-muted-foreground tabular-nums">
              {answeredCount} / {totalCount} odgovoreno
            </span>
          </div>
          <Progress value={progressPercentage} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {questions.map((question, index) => {
          const optionKey = `question${index}`;
          const isAnswered = Boolean(selectedAnswers[optionKey]);

          return (
            <Card key={index}>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                      isAnswered
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                    )}
                  >
                    {index + 1}
                  </div>
                  <h3 className="flex-1 text-base font-semibold leading-snug sm:text-lg">
                    {question.question}
                  </h3>
                  {isAnswered && (
                    <CheckCircle2 className="size-5 shrink-0 text-[color:var(--success)]" />
                  )}
                </div>

                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = selectedAnswers[optionKey] === option;
                    return (
                      <label
                        key={optionIndex}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors sm:p-4',
                          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-accent/40'
                        )}
                      >
                        <input
                          type="radio"
                          name={optionKey}
                          value={option}
                          checked={isSelected}
                          onChange={() => handleAnswerSelect(index, option)}
                          className="mt-0.5 size-4 shrink-0 accent-primary"
                        />
                        <span className="flex-1 text-sm leading-relaxed sm:text-base">
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="sticky bottom-4 z-10 shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              {isAllAnswered ? (
                <span className="inline-flex items-center gap-2 font-medium text-[color:var(--success)]">
                  <CheckCircle2 className="size-4" />
                  Sva pitanja odgovorena
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {totalCount - answeredCount}{' '}
                  {totalCount - answeredCount === 1
                    ? 'pitanje preostalo'
                    : 'pitanja preostalo'}
                </span>
              )}
            </div>
            <Button
              size="lg"
              onClick={handleSubmitClick}
              disabled={!isAllAnswered || isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Predajem...
                </>
              ) : (
                'Predaj kviz'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Predati kviz?</AlertDialogTitle>
            <AlertDialogDescription>
              Da li si siguran da želiš da predaš odgovore? Nakon predaje nećeš
              moći da ih promeniš.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Predajem...
                </>
              ) : (
                'Predaj'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Napustiti kviz?</AlertDialogTitle>
            <AlertDialogDescription>
              Imaš nesačuvane odgovore. Da li si siguran da želiš da napustiš kviz?
              Odgovori će biti izgubljeni.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ostani</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => router.push('/dashboard/student/quizzes')}
            >
              Napusti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
