'use client';

import { useState } from 'react';
import { AlertCircle, Loader2, UserPlus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LinkStudentDialogProps {
  onSuccess: () => void;
  onLinkStudent: (studentId: string) => Promise<void>;
}

export function LinkStudentDialog({
  onSuccess,
  onLinkStudent,
}: LinkStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId.trim()) {
      setError('Unesi učenički ID.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await onLinkStudent(studentId.trim());

      setOpen(false);
      setStudentId('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Povezivanje učenika nije uspelo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
      if (!newOpen) {
        setStudentId('');
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 size-4" />
          Poveži učenika
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Poveži učenika</DialogTitle>
            <DialogDescription>
              Unesi ID deteta da bi povezao/la njegov nalog sa svojim. ID se
              nalazi u detetovom profilu.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="studentId" required>
                Učenički ID
              </Label>
              <Input
                id="studentId"
                placeholder="npr. 550e8400-e29b-41d4-a716-446655440000"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={isLoading}
                className="font-mono text-xs"
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby="studentId-help"
              />
              <p id="studentId-help" className="text-xs text-muted-foreground">
                ID je jedinstveni identifikator u UUID formatu.
              </p>
            </div>

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
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Otkaži
            </Button>
            <Button type="submit" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Povezivanje...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 size-4" />
                  Poveži
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
