'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Search, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StudentLessonCard } from '@/components/features/lessons/StudentLessonCard';
import { PageHeader } from '@/components/dashboard/page-header';
import { SearchInput } from '@/components/dashboard/search-input';
import { EmptyState } from '@/components/dashboard/empty-state';

import { lessonsApi } from '@/lib/api/lessons';
import type { Lesson } from '@/lib/types/lesson';

export default function StudentLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await lessonsApi.getPublishedLessons();
        setLessons(response.lessons || []);
      } catch (err: any) {
        const msg =
          err.response?.data?.error ||
          err.message ||
          'Učitavanje lekcija nije uspelo';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const filteredLessons = searchQuery.trim()
    ? lessons.filter((lesson) =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : lessons;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moje lekcije"
        description="Pregledaj i započni lekcije koje su ti dostupne."
      />

      {!isLoading && !error && lessons.length > 0 && (
        <div className="space-y-2">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Pretraži lekcije..."
          />
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              Pronađeno{' '}
              {filteredLessons.length}{' '}
              {filteredLessons.length === 1 ? 'lekcija' : 'lekcija'}
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          variant="error"
          icon={AlertCircle}
          title="Učitavanje nije uspelo"
          description={error}
          action={
            <Button onClick={() => window.location.reload()}>
              Pokušaj ponovo
            </Button>
          }
        />
      ) : lessons.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Još nema dostupnih lekcija"
          description="Trenutno nije objavljena nijedna lekcija. Proveri kasnije."
        />
      ) : filteredLessons.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nema rezultata"
          description={`Nijedna lekcija ne odgovara upitu "${searchQuery}".`}
          action={
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Obriši pretragu
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLessons.map((lesson) => (
            <StudentLessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}
