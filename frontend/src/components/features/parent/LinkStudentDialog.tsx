'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LinkStudentDialogProps {
  onSuccess: () => void;
  onLinkStudent: (studentId: string) => Promise<void>;
}

export function LinkStudentDialog({ onSuccess, onLinkStudent }: LinkStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId.trim()) {
      setError('Please enter a student ID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await onLinkStudent(studentId.trim());

      // Success - close dialog and refresh
      setOpen(false);
      setStudentId('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to link student');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
      if (!newOpen) {
        // Reset form when closing
        setStudentId('');
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>+ Link Student</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Link a Student</DialogTitle>
            <DialogDescription>
              Enter the student&apos;s ID to connect them to your parent account.
              You can find the student ID from their profile or settings page.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={isLoading}
                className="col-span-3"
              />
              <p className="text-xs text-muted-foreground">
                The student ID is a unique identifier (UUID format)
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Linking...' : 'Link Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
