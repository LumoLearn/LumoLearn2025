import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PerformanceBar } from './PerformanceBar';
import type { PerformanceDistribution as PerformanceDistributionType } from '@/lib/types/progress';

interface PerformanceDistributionProps {
  distribution: PerformanceDistributionType;
  totalAttempts: number;
}

export function PerformanceDistribution({
  distribution,
  totalAttempts,
}: PerformanceDistributionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Distribution</CardTitle>
        <CardDescription>
          Breakdown of quiz scores by performance level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <PerformanceBar
            label="Excellent (90-100%)"
            count={distribution.excellent}
            total={totalAttempts}
            color="bg-green-500"
            variant="success"
          />
          <PerformanceBar
            label="Good (70-89%)"
            count={distribution.good}
            total={totalAttempts}
            color="bg-blue-500"
            variant="default"
          />
          <PerformanceBar
            label="Average (50-69%)"
            count={distribution.average}
            total={totalAttempts}
            color="bg-yellow-500"
            variant="warning"
          />
          <PerformanceBar
            label="Needs Work (0-49%)"
            count={distribution.needsWork}
            total={totalAttempts}
            color="bg-red-500"
            variant="destructive"
          />
        </div>
      </CardContent>
    </Card>
  );
}
