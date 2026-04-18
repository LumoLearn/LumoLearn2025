'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Edit,
  Eye,
  EyeOff,
  FileQuestion,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { LessonViewer } from '@/components/features/lessons/LessonViewer';
import { EmptyState } from '@/components/dashboard/empty-state';

import { lessonsApi } from '@/lib/api/lessons';
import { quizzesApi } from '@/lib/api/quizzes';
import type { Lesson } from '@/lib/types/lesson';
import type { Quiz } from '@/lib/types/quiz';

export default function TeacherLessonViewPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [quizzesError, setQuizzesError] = useState<string | null>(null);

  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await lessonsApi.getLessonById(lessonId);
        setLesson(data);
      } catch (err: any) {
        const msg =
          err.response?.data?.error ||
          err.message ||
          'Učitavanje lekcije nije uspelo';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    if (lessonId) fetchLesson();
  }, [lessonId]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoadingQuizzes(true);
        setQuizzesError(null);
        const data = await quizzesApi.getQuizzes({ lessonId });
        setQuizzes(data.quizzes || []);
      } catch (err: any) {
        const msg =
          err.response?.data?.error ||
          err.message ||
          'Učitavanje kvizova nije uspelo';
        setQuizzesError(msg);
      } finally {
        setIsLoadingQuizzes(false);
      }
    };

    if (lessonId) fetchQuizzes();
  }, [lessonId]);

  const handleTogglePublish = async () => {
    if (!lesson) return;
    try {
      setIsPublishing(true);
      if (lesson.isPublished) {
        await lessonsApi.unpublishLesson(lesson.id);
        toast.success('Lekcija povučena');
      } else {
        await lessonsApi.publishLesson(lesson.id);
        toast.success('Lekcija objavljena');
      }
      const fullLesson = await lessonsApi.getLessonById(lesson.id);
      setLesson(fullLesson);
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Ažuriranje statusa nije uspelo';
      toast.error(msg);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;
    setIsDeletingQuiz(true);
    try {
      await quizzesApi.deleteQuiz(quizToDelete.id);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizToDelete.id));
      toast.success('Kviz obrisan');
      setQuizToDelete(null);
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Brisanje kviza nije uspelo';
      toast.error(msg);
    } finally {
      setIsDeletingQuiz(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        variant="error"
        icon={AlertCircle}
        title="Učitavanje nije uspelo"
        description={error}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/teacher/lessons">
                <ArrowLeft className="mr-2 size-4" />
                Nazad
              </Link>
            </Button>
            <Button onClick={() => window.location.reload()}>
              Pokušaj ponovo
            </Button>
          </div>
        }
      />
    );
  }

  if (!lesson) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Lekcija nije pronađena"
        description="Lekcija koju tražiš ne postoji ili je obrisana."
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/teacher/lessons">
              <ArrowLeft className="mr-2 size-4" />
              Nazad na lekcije
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
          <Link href="/dashboard/teacher/lessons">
            <ArrowLeft className="mr-2 size-4" />
            Nazad na lekcije
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/teacher/lessons/${lessonId}/quiz`}>
              <Sparkles className="mr-2 size-4" />
              Generiši kviz sa AI
            </Link>
          </Button>
          <Button
            variant={lesson.isPublished ? 'outline' : 'default'}
            onClick={handleTogglePublish}
            disabled={isPublishing}
            aria-busy={isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {lesson.isPublished ? 'Povlačim...' : 'Objavljujem...'}
              </>
            ) : lesson.isPublished ? (
              <>
                <EyeOff className="mr-2 size-4" />
                Povuci
              </>
            ) : (
              <>
                <Eye className="mr-2 size-4" />
                Objavi
              </>
            )}
          </Button>
        </div>
      </div>

      <LessonViewer lesson={lesson} showMetadata={true} />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Kvizovi za ovu lekciju</CardTitle>
              <CardDescription>
                Pregledaj i uredi kvizove vezane za ovu lekciju.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="w-fit">
              <Link href={`/dashboard/teacher/lessons/${lessonId}/quiz`}>
                <Plus className="mr-2 size-4" />
                Novi kviz
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingQuizzes ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : quizzesError ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <AlertCircle className="size-6 text-destructive" />
              <p className="text-sm text-destructive">{quizzesError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Pokušaj ponovo
              </Button>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <FileQuestion className="size-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold">Nema kvizova</h3>
                <p className="text-sm text-muted-foreground">
                  Još uvek nisi kreirao/la kviz za ovu lekciju.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/teacher/lessons/${lessonId}/quiz`}>
                  <Sparkles className="mr-2 size-4" />
                  Generiši kviz sa AI
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate font-semibold">{quiz.title}</h4>
                      {quiz.status === 'published' ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle className="size-3" />
                          Objavljen
                        </Badge>
                      ) : (
                        <Badge variant="outline">Radna verzija</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {quiz.questions && (
                        <span>{quiz.questions.length} pitanja</span>
                      )}
                      {quiz.quizMetadata?.difficulty && (
                        <Badge variant="outline" className="text-xs">
                          {quiz.quizMetadata.difficulty === 'easy' && 'Lako'}
                          {quiz.quizMetadata.difficulty === 'medium' && 'Srednje'}
                          {quiz.quizMetadata.difficulty === 'hard' && 'Teško'}
                        </Badge>
                      )}
                      {quiz.quizMetadata?.generatedBy === 'ai' && (
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="size-3" />
                          AI generisano
                        </span>
                      )}
                      <span>
                        {new Date(quiz.createdAt).toLocaleDateString('sr-RS', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/teacher/quizzes/${quiz.id}/edit`)
                      }
                    >
                      <Edit className="mr-1 size-4" />
                      Uredi
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuizToDelete(quiz)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Obriši kviz"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={quizToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setQuizToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obriši kviz</AlertDialogTitle>
            <AlertDialogDescription>
              Da li si siguran da želiš da obrišeš kviz
              {quizToDelete ? ` „${quizToDelete.title}"` : ''}? Ova akcija se ne
              može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingQuiz}>
              Otkaži
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteQuiz}
              disabled={isDeletingQuiz}
            >
              {isDeletingQuiz ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Brišem...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 size-4" />
                  Obriši
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
