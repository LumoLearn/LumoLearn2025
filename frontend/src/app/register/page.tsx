'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth, setError, setLoading, isLoading } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setApiError(null);

      const { confirmPassword, ...registerData } = data;
      const response = await authService.register(registerData);

      if (response.success && response.token && response.user) {
        setAuth(response.user, response.token);

        // Redirect based on role
        switch (response.user.role) {
          case 'student':
            router.push('/dashboard/student');
            break;
          case 'teacher':
            router.push('/dashboard/teacher');
            break;
          case 'parent':
            router.push('/dashboard/parent');
            break;
          default:
            router.push('/dashboard');
        }
      } else {
        setApiError(response.error || 'Registration failed');
      }
    } catch (error: any) {
      setApiError(error.message || 'An error occurred during registration');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Join LumoLearn and start your learning journey
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {apiError && (
              <div
                className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
                role="alert"
                aria-live="assertive"
              >
                {apiError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" required>
                  First Name
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  error={errors.firstName?.message}
                  aria-required="true"
                  {...register('firstName')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" required>
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
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
                placeholder="your.email@example.com"
                error={errors.email?.message}
                aria-required="true"
                {...register('email')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" required>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                error={errors.password?.message}
                aria-required="true"
                {...register('password')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" required>
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                aria-required="true"
                {...register('confirmPassword')}
              />
            </div>

            <div className="space-y-2">
              <Label required>I am a...</Label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="student"
                    {...register('role')}
                    className="h-4 w-4"
                  />
                  <span>Student</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="teacher"
                    {...register('role')}
                    className="h-4 w-4"
                  />
                  <span>Teacher</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="parent"
                    {...register('role')}
                    className="h-4 w-4"
                  />
                  <span>Parent</span>
                </label>
              </div>
              {errors.role && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.role.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <a
                href="/login"
                className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                Sign in here
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
