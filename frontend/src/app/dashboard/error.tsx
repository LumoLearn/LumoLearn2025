'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-6">
      <EmptyState
        variant="error"
        icon={AlertTriangle}
        title="Nešto je pošlo po zlu"
        description={
          error.digest
            ? `Došlo je do neočekivane greške (ID: ${error.digest}). Pokušaj ponovo ili se vrati na početnu.`
            : 'Došlo je do neočekivane greške. Pokušaj ponovo ili se vrati na početnu.'
        }
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 size-4" />
                Početna
              </Link>
            </Button>
            <Button onClick={reset}>
              <RotateCcw className="mr-2 size-4" />
              Pokušaj ponovo
            </Button>
          </div>
        }
      />
    </div>
  );
}
