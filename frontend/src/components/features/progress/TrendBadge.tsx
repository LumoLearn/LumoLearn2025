import { Badge } from '@/components/ui/badge';
import type { PerformanceTrend } from '@/lib/types/progress';

interface TrendBadgeProps {
  trend: PerformanceTrend;
  className?: string;
}

export function TrendBadge({ trend, className = '' }: TrendBadgeProps) {
  const getTrendBadgeVariant = (trend: PerformanceTrend) => {
    switch (trend) {
      case 'improving': return 'success';
      case 'declining': return 'destructive';
      case 'stable': return 'secondary';
      default: return 'outline';
    }
  };

  const getTrendLabel = (trend: PerformanceTrend) => {
    switch (trend) {
      case 'improving': return '📈 Improving';
      case 'declining': return '📉 Needs Attention';
      case 'stable': return '➡️ Stable';
      default: return '📊 Insufficient Data';
    }
  };

  return (
    <Badge variant={getTrendBadgeVariant(trend)} className={className}>
      {getTrendLabel(trend)}
    </Badge>
  );
}
