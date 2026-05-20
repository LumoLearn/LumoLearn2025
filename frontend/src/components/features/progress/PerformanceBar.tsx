import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type PerformanceVariant = 'success' | 'default' | 'warning' | 'destructive';

interface PerformanceBarProps {
  label: string;
  count: number;
  total: number;
  variant: PerformanceVariant;
}

const BAR_CLASSES: Record<PerformanceVariant, string> = {
  success: 'bg-[color:var(--success)]',
  default: 'bg-[color:var(--info)]',
  warning: 'bg-[color:var(--warning)]',
  destructive: 'bg-destructive',
};

export function PerformanceBar({
  label,
  count,
  total,
  variant,
}: PerformanceBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="truncate font-medium">{label}</span>
        <Badge
          variant={variant === 'default' ? 'secondary' : variant}
          className="shrink-0"
        >
          {count}
        </Badge>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-2 rounded-full transition-all', BAR_CLASSES[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
