'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, BookOpen, Search, AlertCircle, Brain, Clock, BarChart3 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { quizzesApi } from '@/lib/api/quizzes';
import type { Quiz } from '@/lib/types/quiz';

/**
 * Student Quizzes List Page
 *
 * Displays all published quizzes for students to take.
 * Features:
 * - Fetches published quizzes from API (BE-015)
 * - Grid layout with responsive design
 * - Search/filter functionality
 * - Loading, error, and empty states
 * - Dynamic rendering without hardcoding
 * - Shows quiz metadata (difficulty, number of questions)
 */
export default function StudentQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Fetch published quizzes on component mount
   */
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('[Student Quizzes] Fetching published quizzes...');
        const response = await quizzesApi.getPublishedQuizzes();
        console.log('[Student Quizzes] Response:', response);

        const fetchedQuizzes = response.quizzes || [];
        setQuizzes(fetchedQuizzes);
        setFilteredQuizzes(fetchedQuizzes);
      } catch (err: any) {
        console.error('[Student Quizzes] Error fetching quizzes:', err);
        const errorMsg =
          err.response?.data?.error ||
          err.message ||
          'Failed to load quizzes';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  /**
   * Filter quizzes based on search query
   */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredQuizzes(quizzes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = quizzes.filter((quiz) =>
      quiz.title.toLowerCase().includes(query)
    );
    setFilteredQuizzes(filtered);
  }, [searchQuery, quizzes]);

  /**
   * Handle search input change
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /**
   * Navigate to quiz taking page
   */
  const handleStartQuiz = (quizId: string) => {
    router.push(`/dashboard/student/quizzes/${quizId}/take`);
  };

  /**
   * Get difficulty badge variant
   */
  const getDifficultyVariant = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'hard':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">My Quizzes</h2>
          <p className="text-muted-foreground">
            Test your knowledge with interactive quizzes
          </p>
        </div>

        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading quizzes...</p>
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
          <h2 className="text-3xl font-bold tracking-tight">My Quizzes</h2>
          <p className="text-muted-foreground">
            Test your knowledge with interactive quizzes
          </p>
        </div>

        <Card className="border-destructive">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Failed to Load Quizzes</h3>
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
   * Empty state (no quizzes available)
   */
  if (quizzes.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">My Quizzes</h2>
          <p className="text-muted-foreground">
            Test your knowledge with interactive quizzes
          </p>
        </div>

        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-muted p-4">
                <Brain className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No Quizzes Available Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  There are no published quizzes at the moment. Check back later to test your knowledge!
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
  if (filteredQuizzes.length === 0 && searchQuery) {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">My Quizzes</h2>
          <p className="text-muted-foreground">
            Test your knowledge with interactive quizzes
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search quizzes..."
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
                <h3 className="text-xl font-semibold">No Quizzes Found</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  No quizzes match &quot;{searchQuery}&quot;. Try a different search term.
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
   * Main content - quizzes grid
   */
  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">My Quizzes</h2>
        <p className="text-muted-foreground">
          Test your knowledge with interactive quizzes
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-muted-foreground">
            Found {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'}
          </p>
        )}
      </div>

      {/* Quizzes grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="rounded-full bg-primary/10 p-2">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                {quiz.quizMetadata?.difficulty && (
                  <Badge variant={getDifficultyVariant(quiz.quizMetadata.difficulty)}>
                    {quiz.quizMetadata.difficulty}
                  </Badge>
                )}
              </div>
              <CardTitle className="line-clamp-2">{quiz.title}</CardTitle>
              <CardDescription>
                {quiz.lessonId ? 'Lesson Quiz' : 'Practice Quiz'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                {quiz.quizMetadata?.numQuestions && (
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>{quiz.quizMetadata.numQuestions} questions</span>
                  </div>
                )}
                {quiz.quizMetadata?.generatedBy && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {quiz.quizMetadata.generatedBy === 'ai' ? 'AI Generated' : 'Manual'}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleStartQuiz(quiz.id)}
              >
                Start Quiz
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
