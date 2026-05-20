'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Heart, Sparkles } from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';

type AuthCopy = {
  badgeIcon: React.ComponentType<{ className?: string }>;
  badge: string;
  title: string;
  description: string;
};

const COPY_BY_PATH: Record<string, AuthCopy> = {
  '/login': {
    badgeIcon: Heart,
    badge: 'Dobrodošli nazad',
    title: 'Nastavi svoje putovanje kroz učenje.',
    description:
      'Prijavi se i nastavi sa lekcijama, kvizovima i personalizovanim iskustvom koje smo pripremili za tebe.',
  },
  '/register': {
    badgeIcon: Sparkles,
    badge: 'Pridruži se zajednici',
    title: 'Obrazovanje prilagođeno svakome.',
    description:
      'Registruj se besplatno i otkrij alate koji čine učenje pristupačnim, lakim i prijatnim iskustvom.',
  },
};

function getCopy(pathname: string): AuthCopy {
  return COPY_BY_PATH[pathname] ?? COPY_BY_PATH['/login'];
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const copy = getCopy(pathname);
  const BadgeIcon = copy.badgeIcon;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/70"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-32 size-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -top-32 -right-32 size-96 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative flex h-full flex-col justify-between p-10 text-primary-foreground">
          <Link href="/" className="flex w-fit items-center gap-2">
            <Image
              src="/logo.png"
              alt="LumoLearn"
              width={206}
              height={87}
              className="h-12 w-auto shrink-0"
            />
            <span className="text-lg font-semibold">LumoLearn</span>
          </Link>

          <div
            key={pathname}
            className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-4 motion-safe:duration-500"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm backdrop-blur">
              <BadgeIcon className="size-4" />
              <span>{copy.badge}</span>
            </div>
            <h2 className="text-4xl font-bold leading-tight">{copy.title}</h2>
            <p className="text-lg leading-8 text-primary-foreground/90">
              {copy.description}
            </p>
          </div>

          <p className="text-sm text-primary-foreground/70">
            © {new Date().getFullYear()} LumoLearn
          </p>
        </div>
      </aside>

      <div className="relative flex flex-col">
        <div className="absolute right-4 top-4 flex items-center gap-2 md:right-6 md:top-6">
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-10">
          <div
            key={pathname}
            className="w-full max-w-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 motion-safe:duration-500"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
