import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'error';
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        variant === 'default' && 'border-dashed',
        variant === 'error' && 'border-destructive/50',
        className
      )}
    >
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div
          className={cn(
            'flex size-14 items-center justify-center rounded-full',
            variant === 'default' && 'bg-muted text-muted-foreground',
            variant === 'error' && 'bg-destructive/10 text-destructive'
          )}
        >
          <Icon className="size-6" />
        </div>
        <div className="space-y-1 max-w-md">
          <h3
            className={cn(
              'text-lg font-semibold',
              variant === 'error' && 'text-destructive'
            )}
          >
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="mt-2">{action}</div>}
      </CardContent>
    </Card>
  );
}
