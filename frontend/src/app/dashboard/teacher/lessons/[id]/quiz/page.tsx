'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Loader2, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/dashboard/page-header';
import { QuizPreview } from '@/components/features/quizzes/QuizPreview';

import { lessonsApi } from '@/lib/api/lessons';
import { aiApi } from '@/lib/api/ai';
import { quizzesApi } from '@/lib/api/quizzes';
import type { Lesson } from '@/lib/types/lesson';
import type { QuizQuestion } from '@/lib/types/quiz';
import { cn } from '@/lib/utils';

const DIFFICULTIES: Array<{ value: 'easy' | 'medium' | 'hard'; label: string; hint: string }> = [
  { value: 'easy', label: 'Lako', hint: 'Prepoznavanje i osnovno razumevanje' },
  { value: 'medium', label: 'Srednje', hint: 'Primena i analiza pojmova' },
  { value: 'hard', label: 'Teško', hint: 'Povezivanje i kritičko razmišljanje' },
];

export default function QuizGeneratorPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);
  const [lessonError, setLessonError] = useState<string | null>(null);

  const [quizTitle, setQuizTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[] | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setIsLoadingLesson(true);
        setLessonError(null);

        const data = await lessonsApi.getLessonById(lessonId);
        setLesson(data);
        setQuizTitle(`Kviz za lekciju: ${data.title}`);
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error ||
          err.message ||
          'Nije moguće učitati lekciju';
        setLessonError(errorMsg);
      } finally {
        setIsLoadingLesson(false);
      }
    };

    if (lessonId) fetchLesson();
  }, [lessonId]);

  const handleGenerateQuiz = async () => {
    if (!lesson || !lesson.content) {
      toast.error('Sadržaj lekcije nije dostupan');
      return;
    }

    try {
      setIsGenerating(true);
      setGeneratedQuestions(null);

      const result = await aiApi.generateQuiz(lesson.content, numQuestions, difficulty);

      if (!result.success || !result.questions || result.questions.length === 0) {
        throw new Error(result.error || 'AI nije generisao pitanja');
      }

      setGeneratedQuestions(result.questions);
      toast.success(`Generisano ${result.questions.length} pitanja`);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Greška prilikom generisanja kviza. Pokušaj ponovo.';
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!generatedQuestions || generatedQuestions.length === 0) {
      toast.error('Nema generisanih pitanja za čuvanje');
      return;
    }

    if (!quizTitle.trim()) {
      toast.error('Unesi naslov kviza');
      return;
    }

    try {
      setIsSaving(true);

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

      toast.success('Kviz je sačuvan');
      router.push(`/dashboard/teacher/quizzes/${result.quiz.id}/edit`);
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

  const handleRegenerate = () => {
    setGeneratedQuestions(null);
  };

  if (isLoadingLesson) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Učitavanje lekcije...</p>
        </div>
      </div>
    );
  }

  if (lessonError || !lesson) {
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
              <CardTitle>Greška pri učitavanju lekcije</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {lessonError || 'Lekcija nije pronađena'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
        <Link href={`/dashboard/teacher/lessons/${lessonId}`}>
          <ArrowLeft className="mr-2 size-4" />
          Nazad na lekciju
        </Link>
      </Button>

      <PageHeader
        title="Generisanje kviza pomoću AI-a"
        description={`Lekcija: ${lesson.title}`}
      />

      {!generatedQuestions ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Konfiguracija kviza
            </CardTitle>
            <CardDescription>
              Izaberi broj pitanja i nivo težine. AI će generisati pitanja na osnovu sadržaja lekcije.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="quizTitle">Naslov kviza</Label>
              <Input
                id="quizTitle"
                type="text"
                placeholder="npr. Kviz za lekciju Biologija"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numQuestions">Broj pitanja</Label>
              <Input
                id="numQuestions"
                type="number"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 1;
                  setNumQuestions(Math.min(20, Math.max(1, v)));
                }}
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground">
                Opseg 1–20. Preporuka: 5–10 pitanja za uzrast 8–12 godina.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Nivo težine</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {DIFFICULTIES.map((d) => {
                  const isActive = difficulty === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDifficulty(d.value)}
                      disabled={isGenerating}
                      className={cn(
                        'flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        isActive
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40 hover:bg-accent/40',
                        isGenerating && 'opacity-60 pointer-events-none'
                      )}
                    >
                      <span className={cn('font-medium', isActive && 'text-primary')}>
                        {d.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{d.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end border-t pt-6">
              <Button
                onClick={handleGenerateQuiz}
                disabled={isGenerating || !lesson.content || !quizTitle.trim()}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Generisanje u toku...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-5" />
                    Generiši kviz pomoću AI-a
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pregled kviza</CardTitle>
              <CardDescription>
                AI je generisao pitanja na osnovu sadržaja lekcije. Nakon čuvanja možeš ih urediti.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quizTitleEdit">Naslov kviza</Label>
                <Input
                  id="quizTitleEdit"
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>

          <QuizPreview questions={generatedQuestions} difficulty={difficulty} showAnswers={true} />

          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-between">
            <Button
              onClick={handleRegenerate}
              variant="outline"
              disabled={isSaving}
            >
              <RotateCcw className="mr-2 size-4" />
              Generiši ponovo
            </Button>
            <Button
              onClick={handleSaveQuiz}
              disabled={isSaving || !quizTitle.trim()}
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Čuvanje...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
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
