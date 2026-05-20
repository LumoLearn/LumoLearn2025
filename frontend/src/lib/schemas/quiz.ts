import { z } from 'zod';

/**
 * Quiz Validation Schemas
 * Zod schemas for runtime validation and type inference
 */

/**
 * Difficulty levels for quizzes
 */
export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;

/**
 * Minimum and maximum number of questions
 */
export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 50;

/**
 * Minimum and maximum number of options per question
 */
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;
export const STANDARD_OPTIONS = 4; // Most common

/**
 * Question validation schema
 */
export const questionSchema = z.object({
  question: z
    .string()
    .min(5, 'Pitanje mora imati najmanje 5 karaktera')
    .max(500, 'Pitanje može imati najviše 500 karaktera')
    .trim(),
  options: z
    .array(
      z
        .string()
        .min(1, 'Opcija ne može biti prazna')
        .max(200, 'Opcija može imati najviše 200 karaktera')
        .trim()
    )
    .min(MIN_OPTIONS, `Pitanje mora imati najmanje ${MIN_OPTIONS} opcije`)
    .max(MAX_OPTIONS, `Pitanje može imati najviše ${MAX_OPTIONS} opcija`)
    .refine(
      (options) => {
        // Check for duplicate options
        const uniqueOptions = new Set(options.map(opt => opt.toLowerCase()));
        return uniqueOptions.size === options.length;
      },
      'Opcije moraju biti jedinstvene'
    ),
  correctAnswer: z
    .string()
    .min(1, 'Morate izabrati tačan odgovor'),
});

/**
 * Quiz metadata schema
 */
export const quizMetadataSchema = z.object({
  difficulty: z.enum(DIFFICULTY_LEVELS).optional(),
  numQuestions: z.number().int().min(MIN_QUESTIONS).max(MAX_QUESTIONS).optional(),
  generatedBy: z.enum(['ai', 'manual']).optional(),
  generatedAt: z.string().optional(),
  aiModel: z.string().optional(),
});

/**
 * Quiz edit form schema
 */
export const quizEditSchema = z.object({
  title: z
    .string()
    .min(3, 'Naslov mora imati najmanje 3 karaktera')
    .max(255, 'Naslov može imati najviše 255 karaktera')
    .trim(),
  questions: z
    .array(questionSchema)
    .min(MIN_QUESTIONS, `Kviz mora imati najmanje ${MIN_QUESTIONS} pitanje`)
    .max(MAX_QUESTIONS, `Kviz može imati najviše ${MAX_QUESTIONS} pitanja`),
  metadata: quizMetadataSchema.optional(),
});

/**
 * Infer TypeScript types from schemas
 */
export type QuestionFormData = z.infer<typeof questionSchema>;
export type QuizMetadataFormData = z.infer<typeof quizMetadataSchema>;
export type QuizEditFormData = z.infer<typeof quizEditSchema>;

/**
 * Validate a single question
 * @param question - Question to validate
 * @returns Validation result with error messages
 */
export function validateQuestion(question: Partial<QuestionFormData>): {
  isValid: boolean;
  errors?: Record<string, string>;
} {
  try {
    questionSchema.parse(question);
    return { isValid: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      err.issues.forEach((error) => {
        const path = error.path.join('.');
        errors[path] = error.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Nepoznata greška pri validaciji' } };
  }
}

/**
 * Validate correct answer is one of the options
 * @param correctAnswer - The correct answer (e.g., "A", "B", "C", "D")
 * @param numOptions - Number of options available
 * @returns True if valid
 */
export function isValidCorrectAnswer(correctAnswer: string, numOptions: number): boolean {
  if (!correctAnswer) return false;

  const answerIndex = correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0);
  return answerIndex >= 0 && answerIndex < numOptions;
}

/**
 * Get letter for option index (0 -> 'A', 1 -> 'B', etc.)
 * @param index - Zero-based index
 * @returns Letter (A-Z)
 */
export function getOptionLetter(index: number): string {
  return String.fromCharCode('A'.charCodeAt(0) + index);
}

/**
 * Convert option letter to index ('A' -> 0, 'B' -> 1, etc.)
 * @param letter - Letter (A-Z)
 * @returns Zero-based index
 */
export function getOptionIndex(letter: string): number {
  return letter.charCodeAt(0) - 'A'.charCodeAt(0);
}

/**
 * Create an empty question template
 * @returns Empty question with 4 options
 */
export function createEmptyQuestion(): QuestionFormData {
  return {
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
  };
}

/**
 * Validate that quiz has all required fields before publishing
 * @param quiz - Quiz data to validate
 * @returns Validation result with specific error messages
 */
export function validateQuizForPublish(quiz: Partial<QuizEditFormData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!quiz.title || quiz.title.trim().length < 3) {
    errors.push('Kviz mora imati naslov');
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    errors.push('Kviz mora imati najmanje jedno pitanje');
  }

  if (quiz.questions) {
    quiz.questions.forEach((q, index) => {
      if (!q.question || q.question.trim().length < 5) {
        errors.push(`Pitanje ${index + 1}: Pitanje je prekratko ili prazno`);
      }

      if (!q.options || q.options.length < MIN_OPTIONS) {
        errors.push(`Pitanje ${index + 1}: Mora imati najmanje ${MIN_OPTIONS} opcije`);
      }

      if (q.options) {
        const emptyOptions = q.options.filter(opt => !opt || opt.trim().length === 0);
        if (emptyOptions.length > 0) {
          errors.push(`Pitanje ${index + 1}: Sve opcije moraju biti popunjene`);
        }
      }

      if (!q.correctAnswer || q.correctAnswer.trim().length === 0) {
        errors.push(`Pitanje ${index + 1}: Morate izabrati tačan odgovor`);
      } else if (q.options && !isValidCorrectAnswer(q.correctAnswer, q.options.length)) {
        errors.push(`Pitanje ${index + 1}: Tačan odgovor nije validan za broj opcija`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
