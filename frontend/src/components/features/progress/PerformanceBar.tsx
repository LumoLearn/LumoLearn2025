import { Badge } from '@/components/ui/badge';

interface PerformanceBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
  variant: 'success' | 'default' | 'warning' | 'destructive';
}

export function PerformanceBar({
  label,
  count,
  total,
  color,
  variant,
}: PerformanceBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <Badge variant={variant}>{count}</Badge>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
