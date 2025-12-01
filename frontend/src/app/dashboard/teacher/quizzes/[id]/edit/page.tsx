'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Loader2,
  Save,
  AlertCircle,
  Plus,
  Eye,
  EyeOff,
  CheckCircle,
  Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { QuestionEditor } from '@/components/features/quizzes/QuestionEditor';
import { QuizPreview } from '@/components/features/quizzes/QuizPreview';

import { quizzesApi } from '@/lib/api/quizzes';
import type { Quiz, QuizQuestion } from '@/lib/types/quiz';
import {
  quizEditSchema,
  type QuizEditFormData,
  createEmptyQuestion,
  validateQuizForPublish,
  STANDARD_OPTIONS,
} from '@/lib/schemas/quiz';

/**
 * Quiz Editor Page (Teacher)
 *
 * Task FE-010: Quiz Editor UI
 * Allows teachers to:
 * - Edit AI-generated or manual quizzes
 * - Add, edit, delete questions
 * - Select correct answers
 * - Save draft or publish quiz
 * - Preview quiz before publishing
 */
export default function QuizEditorPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  // Quiz state
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
  const [quizError, setQuizError] = useState<string | null>(null);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [publishValidationErrors, setPublishValidationErrors] = useState<string[]>([]);

  // Form setup with react-hook-form + zod
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

  // Field array for managing questions
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  // Watch all form values for preview
  const formValues = watch();

  // Fetch quiz on mount
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoadingQuiz(true);
        setQuizError(null);

        console.log('[Quiz Editor] Fetching quiz:', quizId);
        const data = await quizzesApi.getQuizById(quizId, true);
        console.log('[Quiz Editor] Quiz loaded:', data.title);

        setQuiz(data);

        // Initialize form with quiz data
        reset({
          title: data.title,
          questions: data.questions && data.questions.length > 0
            ? data.questions
            : [createEmptyQuestion()],
          metadata: data.quizMetadata || {},
        });
      } catch (err: any) {
        console.error('[Quiz Editor] Error fetching quiz:', err);
        const errorMsg =
          err.response?.data?.error ||
          err.message ||
          'Nije moguće učitati kviz';
        setQuizError(errorMsg);
      } finally {
        setIsLoadingQuiz(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId, reset]);

  // Handle save draft
  const onSaveDraft = async (data: QuizEditFormData) => {
    try {
      setIsSaving(true);
      setSaveError(null);

      console.log('[Quiz Editor] Saving draft:', data.title);

      await quizzesApi.updateQuiz(quizId, {
        title: data.title,
        questions: data.questions,
        metadata: data.metadata,
      });

      console.log('[Quiz Editor] Draft saved successfully');

      // Update local state
      if (quiz) {
        setQuiz({
          ...quiz,
          title: data.title,
          questions: data.questions,
          quizMetadata: data.metadata,
        });
      }

      // Reset form dirty state
      reset(data);

      // Show success message (you could add a toast notification here)
      alert('Kviz je uspešno sačuvan!');
    } catch (err: any) {
      console.error('[Quiz Editor] Error saving draft:', err);
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Greška prilikom čuvanja kviza';
      setSaveError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle publish (with validation)
  const handlePublishClick = () => {
    const validation = validateQuizForPublish(formValues);

    if (!validation.isValid) {
      setPublishValidationErrors(validation.errors);
      setShowPublishDialog(true);
      return;
    }

    // If valid, proceed with publish
    setPublishValidationErrors([]);
    setShowPublishDialog(true);
  };

  const handlePublishConfirm = async () => {
    if (publishValidationErrors.length > 0) {
      return; // Don't publish if there are validation errors
    }

    try {
      setIsPublishing(true);
      setPublishError(null);

      console.log('[Quiz Editor] Publishing quiz:', quizId);

      // First save the current state
      await quizzesApi.updateQuiz(quizId, {
        title: formValues.title,
        questions: formValues.questions,
        metadata: formValues.metadata,
      });

      // Then publish
      await quizzesApi.publishQuiz(quizId);

      console.log('[Quiz Editor] Quiz published successfully');

      // Update local state
      if (quiz) {
        setQuiz({
          ...quiz,
          status: 'published',
          title: formValues.title,
          questions: formValues.questions,
          quizMetadata: formValues.metadata,
        });
      }

      // Reset form dirty state
      reset(formValues);

      // Close dialog
      setShowPublishDialog(false);

      // Show success and redirect
      alert('Kviz je uspešno objavljen!');
      router.push(`/dashboard/teacher/lessons/${quiz?.lessonId || ''}`);
    } catch (err: any) {
      console.error('[Quiz Editor] Error publishing quiz:', err);
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Greška prilikom objavljivanja kviza';
      setPublishError(errorMsg);
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle unpublish
  const handleUnpublish = async () => {
    if (!quiz || quiz.status !== 'published') return;

    const confirmed = window.confirm('Da li ste sigurni da želite da uklonite kviz sa objavljenih?');
    if (!confirmed) return;

    try {
      setIsPublishing(true);
      setPublishError(null);

      console.log('[Quiz Editor] Unpublishing quiz:', quizId);

      await quizzesApi.unpublishQuiz(quizId);

      console.log('[Quiz Editor] Quiz unpublished successfully');

      // Update local state
      setQuiz({
        ...quiz,
        status: 'draft',
      });

      alert('Kviz je uklonjen sa objavljenih.');
    } catch (err: any) {
      console.error('[Quiz Editor] Error unpublishing quiz:', err);
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Greška prilikom uklanjanja kviza';
      setPublishError(errorMsg);
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle add question
  const handleAddQuestion = () => {
    append(createEmptyQuestion());
  };

  // Handle delete question
  const handleDeleteQuestion = (index: number) => {
    if (fields.length <= 1) {
      alert('Kviz mora imati najmanje jedno pitanje.');
      return;
    }

    const confirmed = window.confirm('Da li ste sigurni da želite da obrišete ovo pitanje?');
    if (confirmed) {
      remove(index);
    }
  };

  // Handle correct answer change
  const handleCorrectAnswerChange = (questionIndex: number, answer: string) => {
    setValue(`questions.${questionIndex}.correctAnswer`, answer, { shouldValidate: true });
  };

  // Loading state
  if (isLoadingQuiz) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Učitavanje kviza...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (quizError || !quiz) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-900 dark:text-red-200">Greška</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-800 dark:text-red-300">
              {quizError || 'Kviz nije pronađen'}
            </p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Nazad
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nazad
          </Button>
          <h1 className="text-3xl font-bold">Edituj kviz</h1>
          <div className="mt-1">
            {quiz.status === 'published' ? (
              <Badge className="bg-green-500">Objavljen</Badge>
            ) : (
              <Badge variant="outline">Draft</Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
          >
            {showPreview ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Sakrij pregled
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Pregledaj
              </>
            )}
          </Button>

          {quiz.status === 'published' ? (
            <Button
              onClick={handleUnpublish}
              variant="outline"
              disabled={isPublishing}
            >
              {isPublishing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Ukloni objavu
            </Button>
          ) : (
            <Button
              onClick={handlePublishClick}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Objavi
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Editor Form */}
        <div className={showPreview ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <form onSubmit={handleSubmit(onSaveDraft)} className="space-y-6">
            {/* Quiz Title */}
            <Card>
              <CardHeader>
                <CardTitle>Osnovne informacije</CardTitle>
                <CardDescription>
                  Naziv kviza i metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Naziv kviza</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Unesite naziv kviza..."
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                {quiz.quizMetadata?.difficulty && (
                  <div className="space-y-2">
                    <Label>Težina</Label>
                    <Badge variant="outline">
                      {quiz.quizMetadata.difficulty === 'easy' && 'Lako'}
                      {quiz.quizMetadata.difficulty === 'medium' && 'Srednje'}
                      {quiz.quizMetadata.difficulty === 'hard' && 'Teško'}
                    </Badge>
                  </div>
                )}

                {quiz.quizMetadata?.generatedBy === 'ai' && (
                  <p className="text-xs text-muted-foreground">
                    🤖 Ovaj kviz je generisan pomoću AI-a
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Pitanja ({fields.length})
                </h2>
                <Button
                  type="button"
                  onClick={handleAddQuestion}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj pitanje
                </Button>
              </div>

              {errors.questions && typeof errors.questions.message === 'string' && (
                <p className="text-sm text-red-500">{errors.questions.message}</p>
              )}

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <QuestionEditor
                    key={field.id}
                    index={index}
                    register={register}
                    errors={errors}
                    onDelete={handleDeleteQuestion}
                    numOptions={STANDARD_OPTIONS}
                    correctAnswer={watch(`questions.${index}.correctAnswer`) || ''}
                    onCorrectAnswerChange={handleCorrectAnswerChange}
                    isDeletable={fields.length > 1}
                  />
                ))}
              </div>
            </div>

            {/* Save Errors */}
            {saveError && (
              <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-800 dark:text-red-300">{saveError}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSaving || !isDirty}
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Čuvanje...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sačuvaj izmene
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pregled</CardTitle>
                  <CardDescription>
                    Kako će kviz izgledati studentima
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuizPreview
                    questions={formValues.questions.filter(
                      q => q.question && q.options && q.options.length > 0
                    )}
                    difficulty={formValues.metadata?.difficulty}
                    showAnswers={true}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Publish Confirmation Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {publishValidationErrors.length > 0
                ? 'Kviz nije spreman za objavljivanje'
                : 'Objavi kviz'}
            </DialogTitle>
            <DialogDescription>
              {publishValidationErrors.length > 0 ? (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Molimo ispravite sledeće greške pre objavljivanja:
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-red-600 dark:text-red-400">
                    {publishValidationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                'Da li ste sigurni da želite da objavite ovaj kviz? Nakon objavljivanja, studenti će moći da pristupe kvizu.'
              )}
            </DialogDescription>
          </DialogHeader>

          {publishError && (
            <div className="rounded-md bg-red-50 p-3 dark:bg-red-950/30">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-800 dark:text-red-300">{publishError}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setShowPublishDialog(false)}
              variant="outline"
            >
              {publishValidationErrors.length > 0 ? 'Zatvori' : 'Otkaži'}
            </Button>
            {publishValidationErrors.length === 0 && (
              <Button
                onClick={handlePublishConfirm}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Objavi
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
