'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { QuizEditFormData } from '@/lib/schemas/quiz';
import { getOptionLetter } from '@/lib/schemas/quiz';

interface QuestionEditorProps {
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

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Drag Handle (visual only for now) */}
          <div className="cursor-move pt-1 text-gray-400">
            <GripVertical className="h-5 w-5" />
          </div>

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
                className={questionError?.question ? 'border-red-500' : ''}
              />
              {questionError?.question && (
                <p className="text-sm text-red-500">{questionError.question.message}</p>
              )}
            </div>
          </div>

          {/* Delete Button */}
          {isDeletable && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(index)}
              className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              title="Obriši pitanje"
            >
              <Trash2 className="h-4 w-4" />
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
                      className="h-4 w-4 cursor-pointer accent-green-500"
                      title="Označi kao tačan odgovor"
                    />
                  </div>

                  {/* Option Letter */}
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                      isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {optionLetter}
                  </div>

                  {/* Option Input */}
                  <div className="flex-1 space-y-1">
                    <Input
                      {...register(`questions.${index}.options.${optionIndex}`)}
                      placeholder={`Opcija ${optionLetter}`}
                      className={`${
                        isCorrect
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : ''
                      } ${optionError ? 'border-red-500' : ''}`}
                    />
                    {optionError && (
                      <p className="text-xs text-red-500">
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

          {/* Correct Answer Error */}
          {questionError?.correctAnswer && (
            <p className="text-sm text-red-500">{questionError.correctAnswer.message}</p>
          )}

          {/* Hint */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 Kliknite na radio dugme pored opcije da označite tačan odgovor
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
