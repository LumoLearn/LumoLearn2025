'use client';

import { useState, useEffect } from 'react';
import { Loader2, BookOpen, Search, AlertCircle } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StudentLessonCard } from '@/components/features/lessons/StudentLessonCard';

import { lessonsApi } from '@/lib/api/lessons';
import type { Lesson } from '@/lib/types/lesson';

/**
 * Student Lessons List Page
 *
 * Displays all published lessons for students to view and start.
 * Features:
 * - Fetches published lessons from API
 * - Grid layout with responsive design
 * - Search/filter functionality
 * - Loading, error, and empty states
 * - Dynamic rendering without hardcoding
 */
export default function StudentLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Fetch published lessons on component mount
   */
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('[Student Lessons] Fetching published lessons...');
        const response = await lessonsApi.getPublishedLessons();
        console.log('[Student Lessons] Response:', response);

        const fetchedLessons = response.lessons || [];
        setLessons(fetchedLessons);
        setFilteredLessons(fetchedLessons);
      } catch (err: any) {
        console.error('[Student Lessons] Error fetching lessons:', err);
        const errorMsg =
          err.response?.data?.error ||
          err.message ||
          'Failed to load lessons';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, []);

  /**
   * Filter lessons based on search query
   */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLessons(lessons);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = lessons.filter((lesson) =>
      lesson.title.toLowerCase().includes(query)
    );
    setFilteredLessons(filtered);
  }, [searchQuery, lessons]);

  /**
   * Handle search input change
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">My Lessons</h2>
          <p className="text-muted-foreground">
            Browse and start your learning journey
          </p>
        </div>

        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading lessons...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Error state
   */
  if (error) {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">My Lessons</h2>
          <p className="text-muted-foreground">
            Browse and start your learning journey
          </p>
        </div>

        <Card className="border-destructive">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Failed to Load Lessons</h3>
                <p className="text-sm text-muted-foreground max-w-md">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Empty state (no lessons available)
   */
  if (lessons.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">My Lessons</h2>
          <p className="text-muted-foreground">
            Browse and start your learning journey
          </p>
        </div>

        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-muted p-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No Lessons Available Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  There are no published lessons at the moment. Check back later for new learning materials!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * No search results state
   */
  if (filteredLessons.length === 0 && searchQuery) {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">My Lessons</h2>
          <p className="text-muted-foreground">
            Browse and start your learning journey
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-muted p-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No Lessons Found</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  No lessons match &quot;{searchQuery}&quot;. Try a different search term.
                </p>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
              >
                Clear Search
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Main content - lessons grid
   */
  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">My Lessons</h2>
        <p className="text-muted-foreground">
          Browse and start your learning journey
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-muted-foreground">
            Found {filteredLessons.length} {filteredLessons.length === 1 ? 'lesson' : 'lessons'}
          </p>
        )}
      </div>

      {/* Lessons grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLessons.map((lesson) => (
          <StudentLessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </div>
  );
}
