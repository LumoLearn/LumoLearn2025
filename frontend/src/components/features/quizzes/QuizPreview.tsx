'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { QuizQuestion } from '@/lib/types/quiz';

interface QuizPreviewProps {
  questions: QuizQuestion[];
  difficulty?: 'easy' | 'medium' | 'hard';
  showAnswers?: boolean;
}

/**
 * Quiz Preview Component
 *
 * Displays a preview of generated quiz questions with options.
 * Used by teachers to review AI-generated quizzes before saving.
 */
export function QuizPreview({ questions, difficulty, showAnswers = true }: QuizPreviewProps) {
  if (!questions || questions.length === 0) {
    return null;
  }

  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Generisana pitanja</h3>
          <Badge variant="outline">{questions.length} pitanja</Badge>
        </div>
        {difficulty && (
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty === 'easy' && 'Lako'}
            {difficulty === 'medium' && 'Srednje'}
            {difficulty === 'hard' && 'Teško'}
          </Badge>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                {index + 1}. {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isCorrect = showAnswers && option === question.correctAnswer;
                  return (
                    <div
                      key={optionIndex}
                      className={`flex items-start gap-3 rounded-md border p-3 transition-colors ${
                        isCorrect
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900'
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                          isCorrect
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {String.fromCharCode(65 + optionIndex)}
                      </div>
                      <p className="flex-1 text-sm leading-relaxed">{option}</p>
                      {isCorrect && (
                        <Badge className="bg-green-500 text-white">Tačan odgovor</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
