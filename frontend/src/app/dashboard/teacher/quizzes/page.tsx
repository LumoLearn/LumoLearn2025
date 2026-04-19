'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { AlertCircle, Brain, Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QuizCard } from '@/components/features/quizzes/QuizCard';
import { PageHeader } from '@/components/dashboard/page-header';
import { SearchInput } from '@/components/dashboard/search-input';
import { EmptyState } from '@/components/dashboard/empty-state';

import { quizzesApi } from '@/lib/api/quizzes';
import { lessonsApi } from '@/lib/api/lessons';
import type { Quiz } from '@/lib/types/quiz';
import type { Lesson } from '@/lib/types/lesson';

type QuizFilter = 'all' | 'published' | 'draft';

const FILTER_OPTIONS: Array<{ value: QuizFilter; label: string }> = [
  { value: 'all', label: 'Svi' },
  { value: 'published', label: 'Objavljeni' },
  { value: 'draft', label: 'Nacrti' },
];

export default function TeacherQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<QuizFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [quizzesResponse, lessonsResponse] = await Promise.all([
        quizzesApi.getQuizzes({ sortBy: 'created_at', sortOrder: 'DESC' }),
        lessonsApi.getLessons().catch(() => ({ lessons: [] as Lesson[] })),
      ]);
      setQuizzes(quizzesResponse.quizzes);
      setLessons(lessonsResponse.lessons || []);
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Učitavanje kvizova nije uspelo';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const lessonTitleById = useMemo(() => {
    const map = new Map<string, string>();
    lessons.forEach((l) => map.set(l.id, l.title));
    return map;
  }, [lessons]);

  const stats = {
    total: quizzes.length,
    published: quizzes.filter((q) => q.status === 'published').length,
    draft: quizzes.filter((q) => q.status === 'draft').length,
  };

  const byFilter =
    activeFilter === 'all'
      ? quizzes
      : quizzes.filter((q) => q.status === activeFilter);

  const filteredQuizzes = searchQuery.trim()
    ? byFilter.filter((q) =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : byFilter;

  const emptyTitles: Record<QuizFilter, string> = {
    all: 'Još nema kreiranih kvizova',
    published: 'Nema objavljenih kvizova',
    draft: 'Nema kvizova u nacrtu',
  };

  const emptyDescriptions: Record<QuizFilter, string> = {
    all: 'Kvizove kreiraš iz pojedinačne lekcije. Otvori lekciju i klikni „Generiši kviz".',
    published: 'Nijedan kviz nije objavljen. Objavi kviz da bi bio dostupan učenicima.',
    draft: 'Svi tvoji kvizovi su objavljeni. Odlično!',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moji kvizovi"
        description="Pregled svih kvizova koje si kreirao iz lekcija."
        action={
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard/teacher/lessons">
              <Plus className="mr-2 size-5" />
              Novi kviz iz lekcije
            </Link>
          </Button>
        }
      />

      {!isLoading && !error && quizzes.length > 0 && (
        <div className="space-y-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Pretraži kvizove..."
          />
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => {
              const isActive = activeFilter === option.value;
              const count =
                option.value === 'all'
                  ? stats.total
                  : option.value === 'published'
                  ? stats.published
                  : stats.draft;

              return (
                <Button
                  key={option.value}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(option.value)}
                  className="gap-2"
                >
                  <span>{option.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isActive
                        ? 'bg-primary-foreground/20'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>
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
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          variant="error"
          icon={AlertCircle}
          title="Učitavanje nije uspelo"
          description={error}
          action={<Button onClick={fetchData}>Pokušaj ponovo</Button>}
        />
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={Brain}
          title={emptyTitles.all}
          description={emptyDescriptions.all}
          action={
            <Button asChild size="lg">
              <Link href="/dashboard/teacher/lessons">
                <Plus className="mr-2 size-5" />
                Otvori lekcije
              </Link>
            </Button>
          }
        />
      ) : filteredQuizzes.length === 0 ? (
        searchQuery ? (
          <EmptyState
            icon={Search}
            title="Nema rezultata"
            description={`Nijedan kviz ne odgovara upitu „${searchQuery}".`}
            action={
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Obriši pretragu
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Brain}
            title={emptyTitles[activeFilter]}
            description={emptyDescriptions[activeFilter]}
            action={
              <Button variant="outline" onClick={() => setActiveFilter('all')}>
                Prikaži sve kvizove
              </Button>
            }
          />
        )
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              lessonTitle={quiz.lessonId ? lessonTitleById.get(quiz.lessonId) : undefined}
              onUpdate={fetchData}
            />
          ))}
        </div>
      )}
    </div>
  );
}
