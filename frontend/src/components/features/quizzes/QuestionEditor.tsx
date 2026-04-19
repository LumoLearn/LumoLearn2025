'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { QuizEditFormData } from '@/lib/schemas/quiz';
import { getOptionLetter } from '@/lib/schemas/quiz';
import { cn } from '@/lib/utils';

interface QuestionEditorProps {
  id: string;
  index: number;
  register: UseFormRegister<QuizEditFormData>;
  errors: FieldErrors<QuizEditFormData>;
  onDelete: (index: number) => void;
  numOptions: number;
  correctAnswer: string;
  onCorrectAnswerChange: (questionIndex: number, answer: string) => void;
  isDeletable: boolean;
}

/**
 * Question Editor Component
 *
 * Editable form for a single quiz question.
 * Allows editing question text, options, and selecting correct answer.
 */
export function QuestionEditor({
  id,
  index,
  register,
  errors,
  onDelete,
  numOptions,
  correctAnswer,
  onCorrectAnswerChange,
  isDeletable,
}: QuestionEditorProps) {
  const questionError = errors.questions?.[index];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative',
        isDragging && 'z-10 opacity-60 shadow-lg'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            aria-label="Prevuci pitanje"
            className="cursor-grab touch-none rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-5" />
          </button>

          {/* Question Number and Input */}
          <div className="flex-1 space-y-2">
            <CardTitle className="text-base font-medium">
              Pitanje {index + 1}
            </CardTitle>
            <div className="space-y-1">
              <Label htmlFor={`questions.${index}.question`} className="text-sm">
                Tekst pitanja
              </Label>
              <Input
                id={`questions.${index}.question`}
                {...register(`questions.${index}.question`)}
                placeholder="Unesite tekst pitanja..."
                className={questionError?.question ? 'border-destructive' : ''}
              />
              {questionError?.question && (
                <p className="text-sm text-destructive">{questionError.question.message}</p>
              )}
            </div>
          </div>

          {isDeletable && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(index)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              title="Obriši pitanje"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <Label className="text-sm font-medium">Opcije</Label>

          {/* Options */}
          <div className="space-y-2">
            {Array.from({ length: numOptions }).map((_, optionIndex) => {
              const optionLetter = getOptionLetter(optionIndex);
              const isCorrect = correctAnswer === optionLetter;
              const optionError = questionError?.options?.[optionIndex];

              return (
                <div key={optionIndex} className="flex items-start gap-3">
                  {/* Radio Button for Correct Answer */}
                  <div className="flex items-center pt-2">
                    <input
                      type="radio"
                      id={`question-${index}-correct-${optionLetter}`}
                      name={`question-${index}-correct`}
                      checked={isCorrect}
                      onChange={() => onCorrectAnswerChange(index, optionLetter)}
                      className="size-4 cursor-pointer accent-success"
                      title="Označi kao tačan odgovor"
                    />
                  </div>

                  <div
                    className={cn(
                      'flex size-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium',
                      isCorrect
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {optionLetter}
                  </div>

                  <div className="flex-1 space-y-1">
                    <Input
                      {...register(`questions.${index}.options.${optionIndex}`)}
                      placeholder={`Opcija ${optionLetter}`}
                      className={cn(
                        isCorrect && 'border-success focus-visible:ring-success',
                        optionError && 'border-destructive'
                      )}
                    />
                    {optionError && (
                      <p className="text-xs text-destructive">
                        {typeof optionError === 'object' && 'message' in optionError
                          ? optionError.message
                          : 'Ova opcija ima grešku'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {questionError?.correctAnswer && (
            <p className="text-sm text-destructive">{questionError.correctAnswer.message}</p>
          )}

          <p className="text-xs text-muted-foreground">
            Klikni radio dugme pored opcije da označiš tačan odgovor.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
