import { Badge } from '@/components/ui/badge';
import type { QuizAttempt } from '@/lib/types/progress';

interface QuizAttemptCardProps {
  attempt: QuizAttempt;
  showDate?: boolean;
}

function getPerformanceBadgeVariant(
  percentage: number
): 'success' | 'warning' | 'destructive' {
  if (percentage >= 70) return 'success';
  if (percentage >= 50) return 'warning';
  return 'destructive';
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('sr-RS', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function QuizAttemptCard({ attempt, showDate = true }: QuizAttemptCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{attempt.quizTitle}</p>
        {showDate && (
          <p className="text-xs text-muted-foreground">
            {formatDate(attempt.submittedAt)}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="text-right">
          <p className="text-sm text-muted-foreground tabular-nums">
            {attempt.score}/{attempt.totalQuestions}
          </p>
          <p className="text-xs text-muted-foreground">tačnih</p>
        </div>
        <Badge
          variant={getPerformanceBadgeVariant(attempt.percentage)}
          className="min-w-[60px] justify-center"
        >
          {Math.round(attempt.percentage)}%
        </Badge>
      </div>
    </div>
  );
}
