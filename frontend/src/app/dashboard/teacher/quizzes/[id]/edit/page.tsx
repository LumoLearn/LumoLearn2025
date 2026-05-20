'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  ArrowLeft,
  Loader2,
  Save,
  AlertCircle,
  Plus,
  Eye,
  EyeOff,
  CheckCircle,
  Sparkles,
  Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { PageHeader } from '@/components/dashboard/page-header';

import { QuestionEditor } from '@/components/features/quizzes/QuestionEditor';
import { QuizPreview } from '@/components/features/quizzes/QuizPreview';

import { quizzesApi } from '@/lib/api/quizzes';
import type { Quiz } from '@/lib/types/quiz';
import {
  quizEditSchema,
  type QuizEditFormData,
  createEmptyQuestion,
  validateQuizForPublish,
  STANDARD_OPTIONS,
} from '@/lib/schemas/quiz';

const difficultyLabel = (d?: string) => {
  if (d === 'easy') return 'Lako';
  if (d === 'medium') return 'Srednje';
  if (d === 'hard') return 'Teško';
  return null;
};

export default function QuizEditorPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
  const [quizError, setQuizError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishValidationErrors, setPublishValidationErrors] = useState<string[]>([]);

  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [deleteQuestionIndex, setDeleteQuestionIndex] = useState<number | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<QuizEditFormData>({
    resolver: zodResolver(quizEditSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      questions: [createEmptyQuestion()],
      metadata: {},
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'questions',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    move(oldIndex, newIndex);
  };

  const formValues = watch();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoadingQuiz(true);
        setQuizError(null);

        const data = await quizzesApi.getQuizById(quizId, true);
        setQuiz(data);

        reset({
          title: data.title,
          questions: data.questions && data.questions.length > 0
            ? data.questions
            : [createEmptyQuestion()],
          metadata: data.quizMetadata || {},
        });
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error ||
          err.message ||
          'Nije moguće učitati kviz';
        setQuizError(errorMsg);
      } finally {
        setIsLoadingQuiz(false);
      }
    };

    if (quizId) fetchQuiz();
  }, [quizId, reset]);

  const onSaveDraft = async (data: QuizEditFormData) => {
    try {
      setIsSaving(true);

      await quizzesApi.updateQuiz(quizId, {
        title: data.title,
        questions: data.questions,
        metadata: data.metadata,
      });

      if (quiz) {
        setQuiz({
          ...quiz,
          title: data.title,
          questions: data.questions,
          quizMetadata: data.metadata,
        });
      }

      reset(data);
      toast.success('Kviz je uspešno sačuvan');
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Greška prilikom čuvanja kviza';
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishClick = () => {
    const validation = validateQuizForPublish(formValues);
    setPublishValidationErrors(validation.isValid ? [] : validation.errors);
    setPublishDialogOpen(true);
  };

  const handlePublishConfirm = async () => {
    if (publishValidationErrors.length > 0) return;

    try {
      setIsPublishing(true);

      await quizzesApi.updateQuiz(quizId, {
        title: formValues.title,
        questions: formValues.questions,
        metadata: formValues.metadata,
      });
      await quizzesApi.publishQuiz(quizId);

      if (quiz) {
        setQuiz({
          ...quiz,
          status: 'published',
          title: formValues.title,
          questions: formValues.questions,
          quizMetadata: formValues.metadata,
        });
      }

      reset(formValues);
      setPublishDialogOpen(false);
      toast.success('Kviz je uspešno objavljen');
      router.push(`/dashboard/teacher/lessons/${quiz?.lessonId || ''}`);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Greška prilikom objavljivanja kviza';
      toast.error(errorMsg);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublishConfirm = async () => {
    if (!quiz || quiz.status !== 'published') return;

    try {
      setIsPublishing(true);
      await quizzesApi.unpublishQuiz(quizId);

      setQuiz({ ...quiz, status: 'draft' });
      setUnpublishDialogOpen(false);
      toast.success('Kviz je uklonjen sa objavljenih');
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Greška prilikom uklanjanja kviza';
      toast.error(errorMsg);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAddQuestion = () => {
    append(createEmptyQuestion());
  };

  const handleDeleteQuestionRequest = (index: number) => {
    if (fields.length <= 1) {
      toast.error('Kviz mora imati najmanje jedno pitanje');
      return;
    }
    setDeleteQuestionIndex(index);
  };

  const handleDeleteQuestionConfirm = () => {
    if (deleteQuestionIndex !== null) {
      remove(deleteQuestionIndex);
      setDeleteQuestionIndex(null);
    }
  };

  const handleCorrectAnswerChange = (questionIndex: number, answer: string) => {
    setValue(`questions.${questionIndex}.correctAnswer`, answer, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  if (isLoadingQuiz) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Učitavanje kviza...</p>
        </div>
      </div>
    );
  }

  if (quizError || !quiz) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
          <Link href="/dashboard/teacher/lessons">
            <ArrowLeft className="mr-2 size-4" />
            Nazad na lekcije
          </Link>
        </Button>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="size-5 text-destructive" />
              <CardTitle>Greška</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {quizError || 'Kviz nije pronađen'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const difficulty = difficultyLabel(quiz.quizMetadata?.difficulty);
  const isAiGenerated = quiz.quizMetadata?.generatedBy === 'ai';

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
        <Link href={`/dashboard/teacher/lessons/${quiz.lessonId || ''}`}>
          <ArrowLeft className="mr-2 size-4" />
          Nazad na lekciju
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Uredi kviz"
          description="Izmeni pitanja, odgovore i objavi kviz učenicima."
        />

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
          >
            {showPreview ? (
              <>
                <EyeOff className="mr-2 size-4" />
                Sakrij pregled
              </>
            ) : (
              <>
                <Eye className="mr-2 size-4" />
                Pregledaj
              </>
            )}
          </Button>

          {quiz.status === 'published' ? (
            <Button
              onClick={() => setUnpublishDialogOpen(true)}
              variant="outline"
              disabled={isPublishing}
            >
              <Upload className="mr-2 size-4" />
              Povuci objavu
            </Button>
          ) : (
            <Button
              onClick={handlePublishClick}
              disabled={isPublishing}
            >
              <CheckCircle className="mr-2 size-4" />
              Objavi
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={quiz.status === 'published' ? 'success' : 'secondary'}>
          {quiz.status === 'published' ? 'Objavljeno' : 'Nacrt'}
        </Badge>
        {difficulty && <Badge variant="outline">{difficulty}</Badge>}
        {isAiGenerated && (
          <Badge variant="outline" className="gap-1">
            <Sparkles className="size-3" />
            Generisano pomoću AI-a
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className={showPreview ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <form onSubmit={handleSubmit(onSaveDraft)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Osnovne informacije</CardTitle>
                <CardDescription>Naslov kviza koji učenici vide.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Naslov kviza <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="npr. Provera znanja iz ćelijske biologije"
                    aria-invalid={errors.title ? 'true' : 'false'}
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Pitanja <span className="text-muted-foreground">({fields.length})</span>
                </h2>
                <Button
                  type="button"
                  onClick={handleAddQuestion}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="mr-2 size-4" />
                  Dodaj pitanje
                </Button>
              </div>

              {errors.questions && typeof errors.questions.message === 'string' && (
                <p className="text-sm text-destructive">{errors.questions.message}</p>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <QuestionEditor
                        key={field.id}
                        id={field.id}
                        index={index}
                        register={register}
                        errors={errors}
                        onDelete={handleDeleteQuestionRequest}
                        numOptions={STANDARD_OPTIONS}
                        correctAnswer={watch(`questions.${index}.correctAnswer`) || ''}
                        onCorrectAnswerChange={handleCorrectAnswerChange}
                        isDeletable={fields.length > 1}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <div className="flex justify-end border-t pt-6">
              <Button type="submit" disabled={isSaving || !isDirty} size="lg">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Čuvanje...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    Sačuvaj izmene
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {showPreview && (
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Pregled</CardTitle>
                <CardDescription>Kako će kviz izgledati učenicima.</CardDescription>
              </CardHeader>
              <CardContent>
                <QuizPreview
                  questions={formValues.questions.filter(
                    (q) => q.question && q.options && q.options.length > 0
                  )}
                  difficulty={formValues.metadata?.difficulty}
                  showAnswers={true}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {publishValidationErrors.length > 0
                ? 'Kviz nije spreman za objavljivanje'
                : 'Objavi kviz?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {publishValidationErrors.length > 0 ? (
                <>
                  Pre objavljivanja, ispravi sledeće greške:
                </>
              ) : (
                'Nakon objavljivanja, učenici će moći da pristupe kvizu.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {publishValidationErrors.length > 0 && (
            <ul className="list-inside list-disc space-y-1 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {publishValidationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>
              {publishValidationErrors.length > 0 ? 'Zatvori' : 'Otkaži'}
            </AlertDialogCancel>
            {publishValidationErrors.length === 0 && (
              <AlertDialogAction onClick={handlePublishConfirm} disabled={isPublishing}>
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Objavljivanje...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 size-4" />
                    Objavi
                  </>
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={unpublishDialogOpen} onOpenChange={setUnpublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Povući objavu?</AlertDialogTitle>
            <AlertDialogDescription>
              Kviz će biti sakriven od učenika dok ga ponovo ne objaviš.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>Otkaži</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnpublishConfirm} disabled={isPublishing}>
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Uklanjanje...
                </>
              ) : (
                'Povuci objavu'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteQuestionIndex !== null}
        onOpenChange={(open) => !open && setDeleteQuestionIndex(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati pitanje?</AlertDialogTitle>
            <AlertDialogDescription>
              Ovo će ukloniti pitanje i sve njegove odgovore. Akcija se ne može poništiti dok ne sačuvaš izmene.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuestionConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
