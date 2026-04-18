'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: 'primary' | 'success' | 'warning' | 'info';
  isLoading?: boolean;
  className?: string;
}

const ACCENT_CLASSES: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-[color:var(--success)]/10 text-[color:var(--success)]',
  warning: 'bg-[color:var(--warning)]/10 text-[color:var(--warning)]',
  info: 'bg-[color:var(--info)]/10 text-[color:var(--info)]',
};

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  accent = 'primary',
  isLoading,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="flex items-start gap-4 p-6">
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-lg',
            ACCENT_CLASSES[accent]
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
