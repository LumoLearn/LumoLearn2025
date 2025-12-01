'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Sparkles, Loader2, Save, RotateCcw, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuizPreview } from '@/components/features/quizzes/QuizPreview';

import { lessonsApi } from '@/lib/api/lessons';
import { aiApi } from '@/lib/api/ai';
import { quizzesApi } from '@/lib/api/quizzes';
import type { Lesson } from '@/lib/types/lesson';
import type { QuizQuestion } from '@/lib/types/quiz';

/**
 * Quiz Generator Page (Teacher)
 *
 * Task FE-009: Quiz Generator UI
 * Allows teachers to:
 * - Generate quizzes from lesson content using AI (Gemini)
 * - Configure number of questions and difficulty
 * - Preview generated questions
 * - Save quiz or regenerate
 */
export default function QuizGeneratorPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  // Lesson state
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);
  const [lessonError, setLessonError] = useState<string | null>(null);

  // Form state
  const [quizTitle, setQuizTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[] | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch lesson on mount
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setIsLoadingLesson(true);
        setLessonError(null);

        console.log('[Quiz Generator] Fetching lesson:', lessonId);
        const data = await lessonsApi.getLessonById(lessonId);
        console.log('[Quiz Generator] Lesson loaded:', data.title);

        setLesson(data);
        setQuizTitle(`Kviz za lekciju: ${data.title}`);
      } catch (err: any) {
        console.error('[Quiz Generator] Error fetching lesson:', err);
        const errorMsg =
          err.response?.data?.error ||
          err.message ||
          'Nije moguće učitati lekciju';
        setLessonError(errorMsg);
      } finally {
        setIsLoadingLesson(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  // Handle quiz generation
  const handleGenerateQuiz = async () => {
    if (!lesson || !lesson.content) {
      setGenerationError('Sadržaj lekcije nije dostupan');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationError(null);
      setGeneratedQuestions(null);

      console.log(
        `[Quiz Generator] Generating ${numQuestions} questions with difficulty: ${difficulty}`
      );

      const result = await aiApi.generateQuiz(lesson.content, numQuestions, difficulty);

      if (!result.success || !result.questions || result.questions.length === 0) {
        throw new Error(result.error || 'AI nije generisao pitanja');
      }

      console.log(`[Quiz Generator] Generated ${result.questions.length} questions`);
      setGeneratedQuestions(result.questions);
    } catch (err: any) {
      console.error('[Quiz Generator] Error generating quiz:', err);
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Greška prilikom generisanja kviza. Pokušajte ponovo.';
      setGenerationError(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle save quiz
  const handleSaveQuiz = async () => {
    if (!generatedQuestions || generatedQuestions.length === 0) {
      setSaveError('Nema generisanih pitanja za čuvanje');
      return;
    }

    if (!quizTitle.trim()) {
      setSaveError('Unesite naziv kviza');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      console.log('[Quiz Generator] Saving quiz:', quizTitle);

      const result = await quizzesApi.createQuiz({
        title: quizTitle,
        questions: generatedQuestions,
        lessonId: lessonId,
        metadata: {
          difficulty,
          numQuestions: generatedQuestions.length,
          generatedBy: 'ai',
          generatedAt: new Date().toISOString(),
          aiModel: 'gemini-2.5-flash',
        },
      });

      console.log('[Quiz Generator] Quiz saved successfully:', result.quiz.id);

      // Navigate to quiz editor for immediate editing
      router.push(`/dashboard/teacher/quizzes/${result.quiz.id}/edit`);
    } catch (err: any) {
      console.error('[Quiz Generator] Error saving quiz:', err);
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Greška prilikom čuvanja kviza';
      setSaveError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.push(`/dashboard/teacher/lessons/${lessonId}`);
  };

  // Loading state
  if (isLoadingLesson) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Učitavanje lekcije...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (lessonError || !lesson) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card className="border-destructive">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Greška pri učitavanju lekcije</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {lessonError || 'Lekcija nije pronađena'}
                </p>
              </div>
              <Button variant="outline" onClick={handleBack} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Nazad na lekciju
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Nazad
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Generisanje kviza pomoću AI</h1>
          <p className="text-sm text-muted-foreground">Lekcija: {lesson.title}</p>
        </div>
      </div>

      {/* Generator Form */}
      {!generatedQuestions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Konfiguracija kviza
            </CardTitle>
            <CardDescription>
              Izaberite broj pitanja i nivo težine. AI će generisati pitanja na osnovu sadržaja lekcije.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quiz Title */}
            <div className="space-y-2">
              <Label htmlFor="quizTitle">Naziv kviza</Label>
              <Input
                id="quizTitle"
                type="text"
                placeholder="Unesite naziv kviza"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            {/* Number of Questions */}
            <div className="space-y-2">
              <Label htmlFor="numQuestions">Broj pitanja (1-20)</Label>
              <Input
                id="numQuestions"
                type="number"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 1)}
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground">
                Preporučujemo 5-10 pitanja za deci uzrasta 8-12 godina
              </p>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Nivo težine</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={difficulty === 'easy' ? 'default' : 'outline'}
                  onClick={() => setDifficulty('easy')}
                  disabled={isGenerating}
                  className="w-full"
                >
                  Lako
                </Button>
                <Button
                  type="button"
                  variant={difficulty === 'medium' ? 'default' : 'outline'}
                  onClick={() => setDifficulty('medium')}
                  disabled={isGenerating}
                  className="w-full"
                >
                  Srednje
                </Button>
                <Button
                  type="button"
                  variant={difficulty === 'hard' ? 'default' : 'outline'}
                  onClick={() => setDifficulty('hard')}
                  disabled={isGenerating}
                  className="w-full"
                >
                  Teško
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {generationError && (
              <div className="rounded-md bg-destructive/10 border border-destructive p-4">
                <div className="flex items-start gap-3 text-sm text-destructive">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p>{generationError}</p>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerateQuiz}
              disabled={isGenerating || !lesson.content}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generisanje u toku...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generiši kviz pomoću AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quiz Preview */}
      {generatedQuestions && (
        <div className="space-y-6">
          {/* Title Edit */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Label htmlFor="quizTitleEdit">Naziv kviza</Label>
              <Input
                id="quizTitleEdit"
                type="text"
                placeholder="Unesite naziv kviza"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                disabled={isSaving}
              />
            </CardContent>
          </Card>

          {/* Preview */}
          <QuizPreview questions={generatedQuestions} difficulty={difficulty} showAnswers={true} />

          {/* Save Error */}
          {saveError && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3 text-sm text-destructive">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p>{saveError}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setGeneratedQuestions(null);
                setGenerationError(null);
                setSaveError(null);
              }}
              variant="outline"
              disabled={isSaving}
              className="flex-1"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Generiši ponovo
            </Button>
            <Button
              onClick={handleSaveQuiz}
              disabled={isSaving || !quizTitle.trim()}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Čuvanje...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Sačuvaj kviz
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
