'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter, FileText, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LessonCard } from '@/components/features/lessons/LessonCard';

import { lessonsApi } from '@/lib/api/lessons';
import type { Lesson } from '@/lib/types/lesson';

/**
 * Filter options for lessons
 */
type LessonFilter = 'all' | 'published' | 'unpublished';

/**
 * Filter configuration
 */
const FILTER_OPTIONS: Array<{
  value: LessonFilter;
  label: string;
  description: string;
}> = [
  { value: 'all', label: 'All', description: 'Show all lessons' },
  { value: 'published', label: 'Published', description: 'Show only published lessons' },
  { value: 'unpublished', label: 'Unpublished', description: 'Show only unpublished lessons' },
];

/**
 * Teacher Lessons List Page
 *
 * Displays a list of all lessons for the current teacher with:
 * - Filter by publish status
 * - Grid layout with lesson cards
 * - Loading and empty states
 * - Create new lesson button
 */
export default function TeacherLessonsPage() {
  const router = useRouter();

  // State
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<LessonFilter>('all');

  /**
   * Fetch lessons from API
   */
  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await lessonsApi.getLessons();
      setLessons(response.lessons);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Error loading lessons'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Apply filter to lessons
   */
  const applyFilter = useCallback(() => {
    if (activeFilter === 'all') {
      setFilteredLessons(lessons);
    } else if (activeFilter === 'published') {
      setFilteredLessons(lessons.filter(lesson => lesson.isPublished));
    } else if (activeFilter === 'unpublished') {
      setFilteredLessons(lessons.filter(lesson => !lesson.isPublished));
    }
  }, [lessons, activeFilter]);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  /**
   * Apply filter when lessons or activeFilter changes
   */
  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  /**
   * Handle filter change
   */
  const handleFilterChange = (filter: LessonFilter) => {
    setActiveFilter(filter);
  };

  /**
   * Handle lesson update (after publish/unpublish/delete)
   */
  const handleLessonUpdate = () => {
    fetchLessons();
  };

  /**
   * Navigate to upload page
   */
  const handleCreateLesson = () => {
    router.push('/dashboard/teacher/lessons/upload');
  };

  /**
   * Get filter statistics
   */
  const getFilterStats = () => {
    const total = lessons.length;
    const published = lessons.filter(l => l.isPublished).length;
    const unpublished = total - published;

    return { total, published, unpublished };
  };

  const stats = getFilterStats();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Lessons</h1>
          <p className="text-muted-foreground mt-1">
            Manage your lessons and content
          </p>
        </div>
        <Button onClick={handleCreateLesson} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          New Lesson
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filter:</span>
        </div>
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
                onClick={() => handleFilterChange(option.value)}
                className="flex items-center gap-2"
                title={option.description}
              >
                <span>{option.label}</span>
                <span
                  className={`
                    px-2 py-0.5 rounded-full text-xs font-semibold
                    ${isActive ? 'bg-primary-foreground/20' : 'bg-secondary'}
                  `}
                >
                  {count}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading lessons...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 p-6">
            <AlertCircle className="w-8 h-8 text-destructive flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">
                Error loading
              </h3>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLessons}
                className="mt-3"
              >
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredLessons.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {activeFilter === 'all' && 'No lessons created'}
              {activeFilter === 'published' && 'No published lessons'}
              {activeFilter === 'unpublished' && 'No unpublished lessons'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {activeFilter === 'all' &&
                'Start by creating your first lesson. Upload a Word or PDF document and share knowledge with students.'}
              {activeFilter === 'published' &&
                'You have no published lessons. Publish a lesson to make it available to students.'}
              {activeFilter === 'unpublished' &&
                'All your lessons are published. Great job!'}
            </p>
            {activeFilter === 'all' ? (
              <Button onClick={handleCreateLesson} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create First Lesson
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => handleFilterChange('all')}
              >
                Show all lessons
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lessons Grid */}
      {!isLoading && !error && filteredLessons.length > 0 && (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredLessons.length} of {stats.total} lessons
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onUpdate={handleLessonUpdate}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
