import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProgressStatsProps {
  title: string;
  value: string | number;
  description: string;
  valueClassName?: string;
}

export function ProgressStats({
  title,
  value,
  description,
  valueClassName = '',
}: ProgressStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${valueClassName}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
