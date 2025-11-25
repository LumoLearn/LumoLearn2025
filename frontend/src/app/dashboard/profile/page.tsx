'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { userService } from '@/lib/api/user';
import { useAuthStore } from '@/store/auth.store';
import type { UserProfile } from '@/lib/types/user';
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

// Validation schema for profile update
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getProfile();
      setProfile(data);

      // Set form default values
      reset({
        firstName: data.profile.firstName || '',
        lastName: data.profile.lastName || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await userService.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (response.success) {
        // Update local profile state
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                profile: response.profile,
              }
            : null
        );

        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (profile) {
      reset({
        firstName: profile.profile.firstName || '',
        lastName: profile.profile.lastName || '',
      });
    }
    setIsEditing(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="ml-3 text-muted-foreground">Loading profile...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={fetchProfile}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      {/* Back to Dashboard Button */}
      <Button
        variant="ghost"
        onClick={() => router.push(`/dashboard/${user?.role}`)}
        className="mb-4"
      >
        ← Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Profile</CardTitle>
          <CardDescription>
            View and manage your profile information
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Success Message */}
            {successMessage && (
              <div
                className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400"
                role="alert"
                aria-live="polite"
              >
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                className="rounded-md bg-destructive/15 p-4 text-sm text-destructive"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted cursor-not-allowed"
                aria-readonly="true"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Role (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                type="text"
                value={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
                disabled
                className="bg-muted cursor-not-allowed"
                aria-readonly="true"
              />
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" required>
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                disabled={!isEditing}
                error={errors.firstName?.message}
                aria-required="true"
                className={!isEditing ? 'bg-muted cursor-not-allowed' : ''}
                {...register('firstName')}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" required>
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                disabled={!isEditing}
                error={errors.lastName?.message}
                aria-required="true"
                className={!isEditing ? 'bg-muted cursor-not-allowed' : ''}
                {...register('lastName')}
              />
            </div>

            {/* Role-specific information display */}
            {profile?.student && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="mb-2 font-semibold">Student Information</h3>
                <p className="text-sm text-muted-foreground">
                  Accessibility settings are configured.
                </p>
              </div>
            )}

            {profile?.teacher && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="mb-2 font-semibold">Teacher Information</h3>
                <p className="text-sm text-muted-foreground">
                  You have access to lesson and quiz management features.
                </p>
              </div>
            )}

            {profile?.parent && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="mb-2 font-semibold">Parent Information</h3>
                <p className="text-sm text-muted-foreground">
                  Linked children: {profile.parent.childrenCount}
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end space-x-3">
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                aria-label="Edit profile"
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  aria-label="Cancel editing"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || !isDirty}
                  aria-busy={isSaving}
                  aria-label="Save profile changes"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
