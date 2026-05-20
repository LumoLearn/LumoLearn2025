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
        <CardTitle>Raspodela uspeha</CardTitle>
        <CardDescription>
          Rezultati kvizova razvrstani po nivou uspešnosti.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <PerformanceBar
            label="Odlično (90–100%)"
            count={distribution.excellent}
            total={totalAttempts}
            variant="success"
          />
          <PerformanceBar
            label="Dobro (70–89%)"
            count={distribution.good}
            total={totalAttempts}
            variant="default"
          />
          <PerformanceBar
            label="Prosečno (50–69%)"
            count={distribution.average}
            total={totalAttempts}
            variant="warning"
          />
          <PerformanceBar
            label="Treba rada (0–49%)"
            count={distribution.needsWork}
            total={totalAttempts}
            variant="destructive"
          />
        </div>
      </CardContent>
    </Card>
  );
}
