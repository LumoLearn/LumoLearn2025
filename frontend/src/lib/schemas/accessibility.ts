import { z } from 'zod';

// Font family options
const fontFamilySchema = z.enum([
  'Arial',
  'OpenDyslexic',
  'Comic Sans MS',
  'Verdana',
  'Times New Roman',
  'Georgia',
]);

// Hex color validation
const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (e.g., #000000)');

// Accessibility settings schema
export const accessibilitySettingsSchema = z.object({
  font_family: fontFamilySchema,
  font_size: z
    .number()
    .min(12, 'Font size must be at least 12px')
    .max(24, 'Font size must not exceed 24px'),
  line_spacing: z
    .number()
    .min(1.0, 'Line spacing must be at least 1.0')
    .max(3.0, 'Line spacing must not exceed 3.0'),
  letter_spacing: z
    .number()
    .min(0, 'Letter spacing must be at least 0')
    .max(0.2, 'Letter spacing must not exceed 0.2em'),
  text_color: hexColorSchema,
  background_color: hexColorSchema,
});

export type AccessibilitySettingsFormData = z.infer<typeof accessibilitySettingsSchema>;
