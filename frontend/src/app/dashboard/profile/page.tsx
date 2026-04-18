'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  AlertCircle,
  BookOpen,
  Check,
  Copy,
  GraduationCap,
  Mail,
  Pencil,
  Shield,
  Users,
  X,
} from 'lucide-react';

import { userService } from '@/lib/api/user';
import type { UserProfile } from '@/lib/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Ime je obavezno')
    .max(50, 'Ime je predugačko'),
  lastName: z
    .string()
    .min(1, 'Prezime je obavezno')
    .max(50, 'Prezime je predugačko'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ROLE_LABELS: Record<string, string> = {
  student: 'Učenik',
  teacher: 'Nastavnik',
  parent: 'Roditelj',
};

function getRoleIcon(role: string | undefined) {
  if (role === 'teacher') return GraduationCap;
  if (role === 'student') return BookOpen;
  if (role === 'parent') return Users;
  return Shield;
}

function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null
): string {
  const f = firstName?.trim()?.[0];
  const l = lastName?.trim()?.[0];
  if (f && l) return `${f}${l}`.toUpperCase();
  if (f) return f.toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return '?';
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getProfile();
      setProfile(data);
      reset({
        firstName: data.profile.firstName || '',
        lastName: data.profile.lastName || '',
      });
    } catch (err: any) {
      setError(err.message || 'Nije uspelo učitavanje profila');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await userService.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (response.success) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                profile: response.profile,
              }
            : null
        );
        toast.success('Profil je uspešno ažuriran');
        setIsEditing(false);
      }
    } catch (err: any) {
      const msg = err.message || 'Nije uspelo ažuriranje profila';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      reset({
        firstName: profile.profile.firstName || '',
        lastName: profile.profile.lastName || '',
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const handleCopyId = async () => {
    if (!profile) return;
    await navigator.clipboard.writeText(profile.id);
    setCopied(true);
    toast.success('Učenički ID kopiran');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-destructive" />
            <CardTitle className="text-destructive">Greška</CardTitle>
          </div>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchProfile}>Pokušaj ponovo</Button>
        </CardContent>
      </Card>
    );
  }

  if (!profile) return null;

  const role = profile.role;
  const RoleIcon = getRoleIcon(role);
  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Avatar className="size-20 rounded-xl">
              <AvatarFallback className="rounded-xl bg-primary text-primary-foreground text-2xl font-semibold">
                {getInitials(
                  profile.profile.firstName,
                  profile.profile.lastName,
                  profile.email
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-1">
              <h2 className="text-2xl font-bold tracking-tight truncate">
                {profile.profile.firstName || profile.profile.lastName
                  ? `${profile.profile.firstName ?? ''} ${profile.profile.lastName ?? ''}`.trim()
                  : 'Nepotpun profil'}
              </h2>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </p>
              <div className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium">
                <RoleIcon className="size-3.5" />
                <span>{roleLabel}</span>
              </div>
            </div>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                aria-label="Izmeni profil"
              >
                <Pencil className="mr-2 size-4" />
                Izmeni
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lične informacije</CardTitle>
          <CardDescription>
            Ažurirajte vaše osnovne podatke.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-5">
            {error && (
              <div
                className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" required={isEditing}>
                  Ime
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Unesite ime"
                  disabled={!isEditing}
                  error={errors.firstName?.message}
                  aria-required="true"
                  {...register('firstName')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" required={isEditing}>
                  Prezime
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Unesite prezime"
                  disabled={!isEditing}
                  error={errors.lastName?.message}
                  aria-required="true"
                  {...register('lastName')}
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  aria-readonly="true"
                />
                <p className="text-xs text-muted-foreground">
                  Email se ne može promeniti.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Uloga</Label>
                <Input
                  id="role"
                  type="text"
                  value={roleLabel}
                  disabled
                  aria-readonly="true"
                />
                <p className="text-xs text-muted-foreground">
                  Uloga se ne može promeniti.
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="mr-2 size-4" />
                  Otkaži
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || !isDirty}
                  aria-busy={isSaving}
                >
                  <Check className="mr-2 size-4" />
                  {isSaving ? 'Čuvanje...' : 'Sačuvaj izmene'}
                </Button>
              </div>
            )}
          </CardContent>
        </form>
      </Card>

      {profile.student && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              <CardTitle>Informacije o učeniku</CardTitle>
            </div>
            <CardDescription>
              Podelite ID sa roditeljem da biste povezali naloge.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="studentId">Učenički ID</Label>
            <div className="flex gap-2">
              <Input
                id="studentId"
                type="text"
                value={profile.id}
                disabled
                className="font-mono text-xs"
                aria-readonly="true"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyId}
                aria-label="Kopiraj učenički ID"
              >
                {copied ? (
                  <Check className="size-4 text-primary" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {profile.teacher && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" />
              <CardTitle>Informacije o nastavniku</CardTitle>
            </div>
            <CardDescription>
              Imate pristup alatima za upravljanje lekcijama i kvizovima.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {profile.parent && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              <CardTitle>Informacije o roditelju</CardTitle>
            </div>
            <CardDescription>
              Povezana deca:{' '}
              <span className="font-semibold text-foreground">
                {profile.parent.childrenCount}
              </span>
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
