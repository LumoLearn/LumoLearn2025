import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"
      />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Compass className="size-8" />
        </div>
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">
          Greška 404
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Stranica nije pronađena
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          Izgleda da si pokušao da otvoriš stranicu koja ne postoji ili je
          premeštena.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
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
