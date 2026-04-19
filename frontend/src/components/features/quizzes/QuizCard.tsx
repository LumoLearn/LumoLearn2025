'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  Calendar,
  Download as DownloadIcon,
  HelpCircle,
  Link as LinkIcon,
  Loader2,
  Sparkles,
  Trash2,
  Upload as UploadIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

import type { Quiz } from '@/lib/types/quiz';
import { quizzesApi } from '@/lib/api/quizzes';

interface QuizCardProps {
  quiz: Quiz;
  lessonTitle?: string;
  onUpdate?: () => void;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

const DIFFICULTY_LABELS: Record<'easy' | 'medium' | 'hard', string> = {
  easy: 'Lako',
  medium: 'Srednje',
  hard: 'Teško',
};

export function QuizCard({ quiz, lessonTitle, onUpdate }: QuizCardProps) {
  const router = useRouter();

  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isPublished = quiz.status === 'published';
  const numQuestions = quiz.quizMetadata?.numQuestions;
  const difficulty = quiz.quizMetadata?.difficulty;
  const isAiGenerated = quiz.quizMetadata?.generatedBy === 'ai';

  const handleTogglePublish = async () => {
    setIsPublishing(true);
    try {
      if (isPublished) {
        await quizzesApi.unpublishQuiz(quiz.id);
        toast.success('Kviz povučen sa objavljivanja');
      } else {
        await quizzesApi.publishQuiz(quiz.id);
        toast.success('Kviz objavljen');
      }
      onUpdate?.();
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        (isPublished
          ? 'Povlačenje kviza nije uspelo'
          : 'Objavljivanje kviza nije uspelo');
      toast.error(msg);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await quizzesApi.deleteQuiz(quiz.id);
      toast.success('Kviz obrisan');
      setShowDeleteDialog(false);
      onUpdate?.();
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Brisanje kviza nije uspelo';
      toast.error(msg);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const isBusy = isPublishing || isDeleting;

  return (
    <>
      <Card className="group h-full transition-all hover:border-primary/40 hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Brain className="size-6" />
            </div>
            {isPublished ? (
              <Badge variant="success" className="gap-1.5">
                <span className="size-1.5 rounded-full bg-current" />
                Objavljeno
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1.5">
                <span className="size-1.5 rounded-full bg-muted-foreground" />
                Nacrt
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
              {quiz.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {numQuestions !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <HelpCircle className="size-3.5" />
                  {numQuestions}{' '}
                  {numQuestions === 1 ? 'pitanje' : 'pitanja'}
                </span>
              )}
              {difficulty && (
                <span className="inline-flex items-center gap-1">
                  <span className="size-1 rounded-full bg-muted-foreground" />
                  {DIFFICULTY_LABELS[difficulty]}
                </span>
              )}
              {isAiGenerated && (
                <span className="inline-flex items-center gap-1 text-primary">
                  <Sparkles className="size-3.5" />
                  AI
                </span>
              )}
            </div>
          </div>

          {quiz.lessonId && lessonTitle && (
            <Link
              href={`/dashboard/teacher/lessons/${quiz.lessonId}`}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <LinkIcon className="size-3.5 shrink-0" />
              <span className="truncate">{lessonTitle}</span>
            </Link>
          )}

          <div className="flex-1" />

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            {formatDate(quiz.createdAt)}
          </div>

          <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/teacher/quizzes/${quiz.id}/edit`)}
              className="sm:flex-1"
              disabled={isBusy}
            >
              Uredi
              <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant={isPublished ? 'secondary' : 'default'}
                size="sm"
                onClick={handleTogglePublish}
                disabled={isBusy}
                className="flex-1 sm:flex-initial"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-1 size-4 animate-spin" />
                    {isPublished ? 'Povlačim...' : 'Objavljujem...'}
                  </>
                ) : isPublished ? (
                  <>
                    <DownloadIcon className="mr-1 size-4" />
                    Povuci
                  </>
                ) : (
                  <>
                    <UploadIcon className="mr-1 size-4" />
                    Objavi
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isBusy}
                aria-label="Obriši kviz"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obriši kviz</AlertDialogTitle>
            <AlertDialogDescription>
              Da li si siguran da želiš da obrišeš kviz „{quiz.title}"? Ova
              akcija se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
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
    </>
  );
}
