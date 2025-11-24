'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to appropriate dashboard based on role
      router.push(`/dashboard/${user.role}`);
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-2xl text-center px-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome to LumoLearn
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          An inclusive learning environment designed for children with special
          needs. Supporting visually impaired students and children with
          dyslexia through accessible education.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button
            size="lg"
            onClick={() => router.push('/login')}
            className="px-8"
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/register')}
            className="px-8"
          >
            Register
          </Button>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold">For Students</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Personalized learning with accessibility features
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold">For Teachers</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create and manage inclusive lessons
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold">For Parents</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Monitor your child&apos;s progress
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
