import { Badge } from '@/components/ui/badge';
import type { QuizAttempt } from '@/lib/types/progress';

interface QuizAttemptCardProps {
  attempt: QuizAttempt;
  showDate?: boolean;
}

export function QuizAttemptCard({ attempt, showDate = true }: QuizAttemptCardProps) {
  const getPerformanceBadgeVariant = (percentage: number): "success" | "warning" | "destructive" => {
    if (percentage >= 70) return 'success';
    if (percentage >= 50) return 'warning';
    return 'destructive';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{attempt.quizTitle}</p>
        {showDate && (
          <p className="text-xs text-muted-foreground">
            {formatDate(attempt.submittedAt)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4 ml-4">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {attempt.score}/{attempt.totalQuestions}
          </p>
          <p className="text-xs text-muted-foreground">correct</p>
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
