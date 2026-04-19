'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function Error({
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
    <div className="relative flex min-h-screen flex-col bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-destructive/10 via-destructive/5 to-transparent"
      />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-8" />
        </div>
        <p className="text-sm font-semibold tracking-wider text-destructive uppercase">
          Greška
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Nešto je pošlo po zlu
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          Došlo je do neočekivane greške. Pokušaj ponovo ili se vrati na
          početnu stranicu.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            ID greške: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={reset}>
            <RotateCcw className="mr-2 size-4" />
            Pokušaj ponovo
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 size-4" />
              Nazad na početnu
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
