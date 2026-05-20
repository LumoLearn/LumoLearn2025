'use client';

import { CheckCircle2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/lib/types/quiz';

interface QuizPreviewProps {
  questions: QuizQuestion[];
  difficulty?: 'easy' | 'medium' | 'hard';
  showAnswers?: boolean;
}

const DIFFICULTY_CONFIG: Record<
  NonNullable<QuizPreviewProps['difficulty']>,
  { label: string; variant: 'success' | 'warning' | 'destructive' }
> = {
  easy: { label: 'Lako', variant: 'success' },
  medium: { label: 'Srednje', variant: 'warning' },
  hard: { label: 'Teško', variant: 'destructive' },
};

export function QuizPreview({
  questions,
  difficulty,
  showAnswers = true,
}: QuizPreviewProps) {
  if (!questions || questions.length === 0) {
    return null;
  }

  const diffConfig = difficulty ? DIFFICULTY_CONFIG[difficulty] : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Generisana pitanja</h3>
          <Badge variant="outline">{questions.length} pitanja</Badge>
        </div>
        {diffConfig && (
          <Badge variant={diffConfig.variant}>{diffConfig.label}</Badge>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium leading-relaxed">
                {index + 1}. {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isCorrect =
                    showAnswers && option === question.correctAnswer;
                  return (
                    <div
                      key={optionIndex}
                      className={cn(
                        'flex items-start gap-3 rounded-md border p-3 transition-colors',
                        isCorrect
                          ? 'border-[color:var(--success)]/60 bg-[color:var(--success)]/10'
                          : 'border-border bg-muted/40'
                      )}
                    >
                      <div
                        className={cn(
                          'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                          isCorrect
                            ? 'bg-[color:var(--success)] text-white'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {String.fromCharCode(65 + optionIndex)}
                      </div>
                      <p className="flex-1 text-sm leading-relaxed">{option}</p>
                      {isCorrect && (
                        <Badge variant="success" className="gap-1 shrink-0">
                          <CheckCircle2 className="size-3" />
                          Tačan
                        </Badge>
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
