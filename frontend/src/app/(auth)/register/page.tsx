'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Users,
} from 'lucide-react';

import { registerSchema, type RegisterFormData } from '@/lib/schemas/auth';
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
import { cn } from '@/lib/utils';

type Role = 'student' | 'teacher' | 'parent';

const ROLE_OPTIONS: Array<{
  value: Role;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: 'student',
    label: 'Učenik',
    description: 'Učim kroz lekcije i kvizove',
    icon: BookOpen,
  },
  {
    value: 'teacher',
    label: 'Nastavnik',
    description: 'Kreiram lekcije i kvizove',
    icon: GraduationCap,
  },
  {
    value: 'parent',
    label: 'Roditelj',
    description: 'Pratim napredak deteta',
    icon: Users,
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth, setError, setLoading, isLoading } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setApiError(null);

      const { confirmPassword, ...registerData } = data;
      const response = await authService.register(registerData);

      if (response.success && response.token && response.user) {
        setAuth(response.user, response.token);
        router.push(`/dashboard/${response.user.role}`);
      } else {
        setApiError(response.error || 'Registracija nije uspela');
      }
    } catch (error: any) {
      setApiError(error.message || 'Došlo je do greške prilikom registracije');
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
          <CardTitle className="text-2xl font-bold sm:text-3xl">
            Kreiraj nalog
          </CardTitle>
          <CardDescription>
            Pridružite se LumoLearn-u i započnite svoje putovanje.
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" required>
                  Ime
                </Label>
                <Input
                  id="firstName"
                  placeholder="Marko"
                  autoComplete="given-name"
                  error={errors.firstName?.message}
                  aria-required="true"
                  {...register('firstName')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" required>
                  Prezime
                </Label>
                <Input
                  id="lastName"
                  placeholder="Marković"
                  autoComplete="family-name"
                  error={errors.lastName?.message}
                  aria-required="true"
                  {...register('lastName')}
                />
              </div>
            </div>

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
                placeholder="Najmanje 8 karaktera"
                autoComplete="new-password"
                error={errors.password?.message}
                aria-required="true"
                {...register('password')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" required>
                Potvrdi lozinku
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ponovite lozinku"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                aria-required="true"
                {...register('confirmPassword')}
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium leading-none mb-2">
                Ja sam...{' '}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </legend>
              <div className="grid gap-2">
                {ROLE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedRole === option.value;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors',
                        'hover:border-primary/50 hover:bg-accent/40',
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border'
                      )}
                    >
                      <input
                        type="radio"
                        value={option.value}
                        className="sr-only"
                        {...register('role')}
                      />
                      <div
                        className={cn(
                          'flex size-10 shrink-0 items-center justify-center rounded-md',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">
                          {option.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.role && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.role.message}
                </p>
              )}
            </fieldset>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Kreiranje naloga...' : 'Kreiraj nalog'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Već imate nalog?{' '}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Prijavite se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
