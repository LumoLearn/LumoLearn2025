'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft } from 'lucide-react';

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
    <>
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
    </>
  );
}
