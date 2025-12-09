'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Brain, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { quizzesApi } from '@/lib/api/quizzes';
import type { Quiz, QuizQuestion } from '@/lib/types/quiz';

/**
 * Quiz Taker Page (FE-012)
 *
 * Allows students to:
 * - View quiz questions (without correct answers)
 * - Select answers using radio buttons
 * - Track progress through questions
 * - Submit quiz for grading
 * - Confirmation dialog before submission
 * - Navigate back to quizzes list
 *
 * Features:
 * - Dynamic question rendering
 * - Progress indicator
 * - Keyboard navigation support
 * - Accessibility friendly
 * - Loading and error states
 * - Answer validation before submission
 */
export default function QuizTakePage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  /**
   * Fetch quiz on component mount
   */
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('[Quiz Taker] Fetching quiz:', quizId);
        // includeAnswers=false so students don't see correct answers
        const data = await quizzesApi.getQuizById(quizId, false);
        console.log('[Quiz Taker] Quiz data:', data);

        if (data.status !== 'published') {
          setError('This quiz is not published yet.');
          setQuiz(null);
          return;
        }

        if (!data.questions || data.questions.length === 0) {
          setError('This quiz has no questions.');
          setQuiz(null);
          return;
        }

        setQuiz(data);
        setQuestions(data.questions);
      } catch (err: any) {
        console.error('[Quiz Taker] Error fetching quiz:', err);
        const errorMsg =
          err.response?.data?.error ||
          err.message ||
          'Failed to load quiz';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  /**
   * Handle answer selection
   */
  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [`question${questionIndex}`]: answer,
    }));
  };

  /**
   * Check if all questions are answered
   */
  const isAllQuestionsAnswered = () => {
    return questions.every((_, index) => selectedAnswers[`question${index}`]);
  };

  /**
   * Handle submit button click (show confirmation)
   */
  const handleSubmitClick = () => {
    if (!isAllQuestionsAnswered()) {
      alert('Please answer all questions before submitting.');
      return;
    }
    setShowConfirmation(true);
  };

  /**
   * Handle confirmed submission
   */
  const handleConfirmedSubmit = async () => {
    try {
      setIsSubmitting(true);
      setShowConfirmation(false);

      console.log('[Quiz Taker] Submitting answers:', selectedAnswers);
      console.log('[Quiz Taker] Number of questions:', questions.length);
      console.log('[Quiz Taker] Number of answers:', Object.keys(selectedAnswers).length);

      const result = await quizzesApi.submitQuiz(quizId, selectedAnswers);
      console.log('[Quiz Taker] Submission result:', result);
      console.log('[Quiz Taker] Result has results array:', !!result.results);
      console.log('[Quiz Taker] Results array length:', result.results?.length);

      // Navigate to results page with result data
      router.push(`/dashboard/student/quizzes/${quizId}/results?data=${encodeURIComponent(JSON.stringify(result))}`);
    } catch (err: any) {
      console.error('[Quiz Taker] Error submitting quiz:', err);
      console.error('[Quiz Taker] Error response:', err.response?.data);
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Failed to submit quiz';
      setError(errorMsg);
      setIsSubmitting(false);
    }
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    if (Object.keys(selectedAnswers).length > 0) {
      if (!confirm('You have unsaved answers. Are you sure you want to leave?')) {
        return;
      }
    }
    router.push('/dashboard/student/quizzes');
  };

  /**
   * Calculate progress
   */
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = questions.length;
  const progressPercentage = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading quiz...</p>
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
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card className="border-destructive">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Failed to Load Quiz</h3>
                <p className="text-sm text-muted-foreground max-w-md">{error}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Quizzes
                </Button>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Not found state
   */
  if (!quiz) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-muted p-3">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Quiz Not Found</h3>
                <p className="text-sm text-muted-foreground">
                  The quiz you're looking for doesn't exist or is not published yet.
                </p>
              </div>
              <Button variant="outline" onClick={handleBack} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Main quiz taker UI
   */
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
            {quiz.quizMetadata?.difficulty && (
              <Badge variant="secondary" className="mt-2">
                {quiz.quizMetadata.difficulty}
              </Badge>
            )}
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Brain className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">
                {answeredCount} / {totalCount} answered
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{question.question}</CardTitle>
                </div>
                {selectedAnswers[`question${index}`] && (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {question.options.map((option, optionIndex) => {
                  const optionKey = `question${index}`;
                  const isSelected = selectedAnswers[optionKey] === option;

                  return (
                    <label
                      key={optionIndex}
                      className={`
                        flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-accent/50'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name={optionKey}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(index, option)}
                        className="mt-0.5 h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="flex-1">{option}</span>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit section */}
      <Card className="mt-8 sticky bottom-4 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {answeredCount === totalCount ? (
                <span className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle className="h-4 w-4" />
                  All questions answered
                </span>
              ) : (
                <span>
                  {totalCount - answeredCount} question{totalCount - answeredCount !== 1 ? 's' : ''} remaining
                </span>
              )}
            </div>
            <Button
              size="lg"
              onClick={handleSubmitClick}
              disabled={!isAllQuestionsAnswered() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Submit Quiz?</CardTitle>
              <CardDescription>
                Are you sure you want to submit your answers? You won't be able to change them after submission.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmedSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Confirm Submit'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
