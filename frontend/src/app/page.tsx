'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  GraduationCap,
  Heart,
  Sparkles,
  Users,
} from 'lucide-react';

import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(`/dashboard/${user.role}`);
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"
      />

      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <span className="text-lg font-semibold">LumoLearn</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">Prijava</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Registracija</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Heart className="size-4 text-primary" />
              <span>Inkluzivno učenje za svako dete</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Učenje bez{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                prepreka
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground md:text-xl">
              LumoLearn je obrazovna platforma posvećena deci sa posebnim
              potrebama. Podržavamo slabovide učenike i decu sa disleksijom kroz
              pristupačno i prilagodljivo učenje.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/register">Započni besplatno</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/login">Već imam nalog</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-20 md:px-6 md:pb-28 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Rešenje za ceo obrazovni tim
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Jedna platforma, tri perspektive — prilagođena svakoj ulozi.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FeatureCard
              icon={BookOpen}
              title="Za učenike"
              description="Personalizovano učenje sa opcijama pristupačnosti — prilagodljiv font, boje i fontovi za disleksiju."
            />
            <FeatureCard
              icon={GraduationCap}
              title="Za nastavnike"
              description="Kreirajte i upravljajte inkluzivnim lekcijama i kvizovima. AI pomaže u pravljenju sadržaja."
            />
            <FeatureCard
              icon={Users}
              title="Za roditelje"
              description="Pratite napredak vašeg deteta u realnom vremenu i budite uključeni u proces učenja."
            />
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row md:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} LumoLearn. Sva prava zadržana.</p>
          <p>Napravljeno sa pažnjom za inkluzivno obrazovanje.</p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative rounded-xl border bg-card p-6 transition-colors hover:border-primary/40 hover:bg-accent/30">
      <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-6" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
