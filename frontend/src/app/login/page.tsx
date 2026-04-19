'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, Heart } from 'lucide-react';
import Image from 'next/image';

import { loginSchema, type LoginFormData } from '@/lib/schemas/auth';
import { authService } from '@/lib/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, setError, setLoading, isLoading } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setApiError(null);

      const response = await authService.login(data);

      if (response.success && response.token && response.user) {
        setAuth(response.user, response.token);
        router.push(`/dashboard/${response.user.role}`);
      } else {
        setApiError(response.error || 'Prijava nije uspela');
      }
    } catch (error: any) {
      setApiError(error.message || 'Došlo je do greške prilikom prijave');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
          <Link href="/" className="flex items-center gap-2 w-fit">
            <Image
              src="/logo.png"
              alt="LumoLearn"
              width={206}
              height={87}
              className="h-10 w-auto shrink-0"
            />
            <span className="text-lg font-semibold">LumoLearn</span>
          </Link>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm backdrop-blur">
              <Heart className="size-4" />
              <span>Dobrodošli nazad</span>
            </div>
            <h2 className="text-4xl font-bold leading-tight">
              Nastavi svoje putovanje kroz učenje.
            </h2>
            <p className="text-lg leading-8 text-primary-foreground/90">
              Prijavi se i nastavi sa lekcijama, kvizovima i personalizovanim
              iskustvom koje smo pripremili za tebe.
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
          <div className="w-full max-w-md">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="mb-4 -ml-3 text-muted-foreground"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 size-4" />
                Nazad na početnu
              </Link>
            </Button>

            <Card>
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl font-bold sm:text-3xl">Prijava</CardTitle>
                <CardDescription>
                  Unesite vaše podatke da biste pristupili nalogu.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <CardContent className="space-y-4">
                  {apiError && (
                    <div
                      className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                      role="alert"
                      aria-live="assertive"
                    >
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      <span>{apiError}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" required>
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ime.prezime@primer.com"
                      autoComplete="email"
                      error={errors.email?.message}
                      aria-required="true"
                      {...register('email')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" required>
                      Lozinka
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Unesite lozinku"
                      autoComplete="current-password"
                      error={errors.password?.message}
                      aria-required="true"
                      {...register('password')}
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                    aria-busy={isLoading}
                  >
                    {isLoading ? 'Prijavljivanje...' : 'Prijavi se'}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Nemate nalog?{' '}
                    <Link
                      href="/register"
                      className="font-medium text-primary underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                    >
                      Registrujte se
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
