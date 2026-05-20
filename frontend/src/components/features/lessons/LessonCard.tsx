'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Calendar,
  Download as DownloadIcon,
  FileText,
  Loader2,
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

import type { Lesson } from '@/lib/types/lesson';
import { lessonsApi } from '@/lib/api/lessons';

interface LessonCardProps {
  lesson: Lesson;
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

export function LessonCard({ lesson, onUpdate }: LessonCardProps) {
  const router = useRouter();

  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleTogglePublish = async () => {
    setIsPublishing(true);
    try {
      if (lesson.isPublished) {
        await lessonsApi.unpublishLesson(lesson.id);
        toast.success('Lekcija povučena sa objavljivanja');
      } else {
        await lessonsApi.publishLesson(lesson.id);
        toast.success('Lekcija objavljena');
      }
      onUpdate?.();
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        (lesson.isPublished
          ? 'Povlačenje lekcije nije uspelo'
          : 'Objavljivanje lekcije nije uspelo');
      toast.error(msg);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await lessonsApi.deleteLesson(lesson.id);
      toast.success('Lekcija obrisana');
      setShowDeleteDialog(false);
      onUpdate?.();
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Brisanje lekcije nije uspelo';
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
              <FileText className="size-6" />
            </div>
            {lesson.isPublished ? (
              <Badge variant="success" className="gap-1.5">
                <span className="size-1.5 rounded-full bg-current" />
                Objavljeno
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1.5">
                <span className="size-1.5 rounded-full bg-muted-foreground" />
                Neobjavljeno
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
              {lesson.title}
            </h3>
            {lesson.metadata && (
              <p className="text-xs text-muted-foreground">
                <span className="uppercase">{lesson.metadata.fileType}</span>
                {lesson.metadata.fileSize ? (
                  <span> · {(lesson.metadata.fileSize / 1024).toFixed(0)} KB</span>
                ) : null}
              </p>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            {formatDate(lesson.createdAt)}
          </div>

          <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/teacher/lessons/${lesson.id}`)}
              className="sm:flex-1"
              disabled={isBusy}
            >
              Otvori
              <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant={lesson.isPublished ? 'secondary' : 'default'}
                size="sm"
                onClick={handleTogglePublish}
                disabled={isBusy}
                className="flex-1 sm:flex-initial"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-1 size-4 animate-spin" />
                    {lesson.isPublished ? 'Povlačim...' : 'Objavljujem...'}
                  </>
                ) : lesson.isPublished ? (
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
                aria-label="Obriši lekciju"
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
            <AlertDialogTitle>Obriši lekciju</AlertDialogTitle>
            <AlertDialogDescription>
              Da li si siguran da želiš da obrišeš lekciju „{lesson.title}"? Ova
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

// Ostavljamo default export radi kompatibilnosti sa eventualnim starim import-ima.
export default LessonCard;
