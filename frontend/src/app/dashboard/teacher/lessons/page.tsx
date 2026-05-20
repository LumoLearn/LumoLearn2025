'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AlertCircle, FileText, Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LessonCard } from '@/components/features/lessons/LessonCard';
import { PageHeader } from '@/components/dashboard/page-header';
import { SearchInput } from '@/components/dashboard/search-input';
import { EmptyState } from '@/components/dashboard/empty-state';

import { lessonsApi } from '@/lib/api/lessons';
import type { Lesson } from '@/lib/types/lesson';

type LessonFilter = 'all' | 'published' | 'unpublished';

const FILTER_OPTIONS: Array<{ value: LessonFilter; label: string }> = [
  { value: 'all', label: 'Sve' },
  { value: 'published', label: 'Objavljene' },
  { value: 'unpublished', label: 'Neobjavljene' },
];

export default function TeacherLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<LessonFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await lessonsApi.getLessons();
      setLessons(response.lessons);
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Učitavanje lekcija nije uspelo';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const stats = {
    total: lessons.length,
    published: lessons.filter((l) => l.isPublished).length,
    unpublished: lessons.filter((l) => !l.isPublished).length,
  };

  const byFilter =
    activeFilter === 'all'
      ? lessons
      : activeFilter === 'published'
      ? lessons.filter((l) => l.isPublished)
      : lessons.filter((l) => !l.isPublished);

  const filteredLessons = searchQuery.trim()
    ? byFilter.filter((l) =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : byFilter;

  const emptyTitles: Record<LessonFilter, string> = {
    all: 'Još nema kreiranih lekcija',
    published: 'Nema objavljenih lekcija',
    unpublished: 'Nema neobjavljenih lekcija',
  };

  const emptyDescriptions: Record<LessonFilter, string> = {
    all: 'Započni kreiranjem prve lekcije. Otpremi Word ili PDF dokument i podeli znanje sa učenicima.',
    published: 'Nemaš objavljenih lekcija. Objavi lekciju da bi bila dostupna učenicima.',
    unpublished: 'Sve tvoje lekcije su objavljene. Odlično!',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moje lekcije"
        description="Upravljaj svojim lekcijama i sadržajem."
        action={
          <Button asChild size="lg">
            <Link href="/dashboard/teacher/lessons/upload">
              <Plus className="mr-2 size-5" />
              Nova lekcija
            </Link>
          </Button>
        }
      />

      {!isLoading && !error && lessons.length > 0 && (
        <div className="space-y-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Pretraži lekcije..."
          />
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => {
              const isActive = activeFilter === option.value;
              const count =
                option.value === 'all'
                  ? stats.total
                  : option.value === 'published'
                  ? stats.published
                  : stats.unpublished;

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
              Pronađeno {filteredLessons.length}{' '}
              {filteredLessons.length === 1 ? 'lekcija' : 'lekcija'}
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
          action={<Button onClick={fetchLessons}>Pokušaj ponovo</Button>}
        />
      ) : lessons.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={emptyTitles.all}
          description={emptyDescriptions.all}
          action={
            <Button asChild size="lg">
              <Link href="/dashboard/teacher/lessons/upload">
                <Plus className="mr-2 size-5" />
                Kreiraj prvu lekciju
              </Link>
            </Button>
          }
        />
      ) : filteredLessons.length === 0 ? (
        searchQuery ? (
          <EmptyState
            icon={Search}
            title="Nema rezultata"
            description={`Nijedna lekcija ne odgovara upitu „${searchQuery}".`}
            action={
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Obriši pretragu
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={FileText}
            title={emptyTitles[activeFilter]}
            description={emptyDescriptions[activeFilter]}
            action={
              <Button variant="outline" onClick={() => setActiveFilter('all')}>
                Prikaži sve lekcije
              </Button>
            }
          />
        )
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onUpdate={fetchLessons}
            />
          ))}
        </div>
      )}
    </div>
  );
}
