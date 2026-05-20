import { Minus, TrendingDown, TrendingUp, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PerformanceTrend } from '@/lib/types/progress';
import { cn } from '@/lib/utils';

interface TrendBadgeProps {
  trend: PerformanceTrend;
  className?: string;
}

const TREND_CONFIG: Record<
  PerformanceTrend,
  {
    label: string;
    variant: 'success' | 'destructive' | 'secondary' | 'outline';
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  improving: { label: 'Napreduje', variant: 'success', icon: TrendingUp },
  declining: { label: 'Treba pažnje', variant: 'destructive', icon: TrendingDown },
  stable: { label: 'Stabilno', variant: 'secondary', icon: Minus },
  insufficient_data: { label: 'Nedovoljno podataka', variant: 'outline', icon: BarChart3 },
};

export function TrendBadge({ trend, className }: TrendBadgeProps) {
  const config = TREND_CONFIG[trend] ?? TREND_CONFIG.insufficient_data;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn('gap-1.5', className)}>
      <Icon className="size-3.5" />
      {config.label}
    </Badge>
  );
}
