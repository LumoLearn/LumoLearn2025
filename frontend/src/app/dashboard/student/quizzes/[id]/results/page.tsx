'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, Trophy, BarChart3, Clock, Brain } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import type { QuizSubmissionResponse, QuizQuestionResult } from '@/lib/types/quiz';

/**
 * Quiz Results Page Component (FE-012)
 *
 * Displays quiz results after submission:
 * - Overall score and percentage
 * - Detailed question-by-question results
 * - Correct/incorrect answers highlighted
 * - Visual feedback with icons and colors
 * - Navigation back to quizzes list or retake option
 *
 * Features:
 * - Dynamic results rendering
 * - Score visualization
 * - Detailed answer breakdown
 * - Responsive design
 * - Accessibility friendly
 */
function QuizResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<QuizSubmissionResponse | null>(null);

  useEffect(() => {
    // Get results from URL query params (passed from take page)
    const data = searchParams.get('data');
    console.log('[Quiz Results] Raw data from URL:', data);

    if (data) {
      try {
        const parsedResults = JSON.parse(decodeURIComponent(data));
        console.log('[Quiz Results] Parsed results:', parsedResults);
        console.log('[Quiz Results] Has results array:', !!parsedResults.results);
        console.log('[Quiz Results] Results array:', parsedResults.results);
        setResults(parsedResults);
      } catch (err) {
        console.error('[Quiz Results] Error parsing results:', err);
      }
    }
  }, [searchParams]);

  /**
   * Navigate back to quizzes list
   */
  const handleBackToQuizzes = () => {
    router.push('/dashboard/student/quizzes');
  };

  /**
   * Get score color based on percentage
   */
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  /**
   * Get score badge variant
   */
  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  /**
   * If no results, show error state
   */
  if (!results) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-muted p-3">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No Results Available</h3>
                <p className="text-sm text-muted-foreground">
                  Unable to load quiz results. Please try taking the quiz again.
                </p>
              </div>
              <Button variant="outline" onClick={handleBackToQuizzes} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { score, totalQuestions, percentage, results: questionResults } = results;

  // Additional validation for questionResults
  if (!questionResults || !Array.isArray(questionResults) || questionResults.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-muted p-3">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Incomplete Results</h3>
                <p className="text-sm text-muted-foreground">
                  Results data is incomplete. Please try taking the quiz again.
                </p>
              </div>
              <Button variant="outline" onClick={handleBackToQuizzes} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button variant="outline" onClick={handleBackToQuizzes} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>

        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Results</h1>
        </div>
      </div>

      {/* Score Summary Card */}
      <Card className="mb-8 border-2">
        <CardHeader>
          <CardTitle>Your Score</CardTitle>
          <CardDescription>Great job completing the quiz!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Score */}
            <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
              <div className={`text-5xl font-bold ${getScoreColor(percentage)}`}>
                {score}/{totalQuestions}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Questions Correct</p>
            </div>

            {/* Percentage */}
            <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
              <div className={`text-5xl font-bold ${getScoreColor(percentage)}`}>
                {percentage.toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">Success Rate</p>
            </div>

            {/* Grade Badge */}
            <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
              <Badge variant={getScoreBadgeVariant(percentage)} className="text-lg px-4 py-2">
                {percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : 'Keep Trying'}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">Performance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Message */}
      <Card className="mb-6 border-dashed bg-muted/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3 text-sm">
            <Brain className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">
                {percentage >= 80
                  ? 'Outstanding work! You have a strong understanding of the material.'
                  : percentage >= 60
                  ? 'Good effort! Review the questions you missed to improve further.'
                  : 'Keep practicing! Review the material and try again when ready.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Question Breakdown</h2>
        <p className="text-muted-foreground">
          Review your answers and see the correct solutions
        </p>
      </div>

      {/* Question Results */}
      <div className="space-y-6">
        {questionResults.map((result, index) => {
          const isCorrect = result.isCorrect;

          return (
            <Card
              key={index}
              className={`border-2 ${
                isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                        isCorrect
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <CardTitle className="text-lg">{result.question}</CardTitle>
                  </div>
                  {isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Show all options with indicators */}
                  {result.options.map((option, optionIndex) => {
                    const isUserAnswer = result.userAnswer === option;
                    const isCorrectAnswer = result.correctAnswer === option;

                    return (
                      <div
                        key={optionIndex}
                        className={`
                          flex items-start gap-3 p-3 rounded-lg border
                          ${
                            isCorrectAnswer
                              ? 'border-green-300 bg-green-100'
                              : isUserAnswer && !isCorrect
                              ? 'border-red-300 bg-red-100'
                              : 'border-border bg-background'
                          }
                        `}
                      >
                        {isCorrectAnswer && (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        )}
                        {isUserAnswer && !isCorrect && (
                          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        {!isCorrectAnswer && !isUserAnswer && (
                          <div className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{option}</p>
                          {isCorrectAnswer && (
                            <p className="text-xs text-green-700 mt-1">Correct Answer</p>
                          )}
                          {isUserAnswer && !isCorrect && (
                            <p className="text-xs text-red-700 mt-1">Your Answer</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions Footer */}
      <Card className="mt-8">
        <CardFooter className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            variant="outline"
            onClick={handleBackToQuizzes}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Button>
          <Button
            onClick={() => router.push('/dashboard/student/lessons')}
            className="w-full sm:w-auto"
          >
            Continue Learning
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Main component with Suspense wrapper
 */
export default function QuizResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <Card>
            <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
              <BarChart3 className="h-8 w-8 animate-pulse text-primary" />
              <p className="text-muted-foreground">Loading results...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <QuizResultsContent />
    </Suspense>
  );
}
