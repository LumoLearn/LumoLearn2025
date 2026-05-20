import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProgressStatsProps {
  title: string;
  value: string | number;
  description: string;
  valueClassName?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: 'primary' | 'success' | 'warning' | 'info' | 'destructive';
}

const ACCENT_CLASSES: Record<NonNullable<ProgressStatsProps['accent']>, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-[color:var(--success)]/10 text-[color:var(--success)]',
  warning: 'bg-[color:var(--warning)]/10 text-[color:var(--warning)]',
  info: 'bg-[color:var(--info)]/10 text-[color:var(--info)]',
  destructive: 'bg-destructive/10 text-destructive',
};

export function ProgressStats({
  title,
  value,
  description,
  valueClassName,
  icon: Icon,
  accent = 'primary',
}: ProgressStatsProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start gap-4 p-6">
        {Icon && (
          <div
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-lg',
              ACCENT_CLASSES[accent]
            )}
          >
            <Icon className="size-5" />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn('text-2xl font-bold tracking-tight sm:text-3xl', valueClassName)}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
