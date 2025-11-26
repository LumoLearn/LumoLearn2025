// Accessibility settings types for student

export type FontFamily = 'Arial' | 'OpenDyslexic' | 'Comic Sans MS' | 'Verdana' | 'Times New Roman' | 'Georgia';

export interface AccessibilitySettings {
  font_family: FontFamily;
  font_size: number; // 12-24px
  line_spacing: number; // 1.0-3.0
  letter_spacing: number; // 0-0.2em
  text_color: string; // Hex color
  background_color: string; // Hex color
}

export interface AccessibilityPreset {
  name: string;
  description: string;
  settings: AccessibilitySettings;
}

export const DEFAULT_SETTINGS: AccessibilitySettings = {
  font_family: 'Arial',
  font_size: 16,
  line_spacing: 1.5,
  letter_spacing: 0,
  text_color: '#000000',
  background_color: '#FFFFFF',
};

export const FONT_FAMILY_OPTIONS: { value: FontFamily; label: string }[] = [
  { value: 'Arial', label: 'Arial' },
  { value: 'OpenDyslexic', label: 'OpenDyslexic (Dyslexia-friendly)' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
];

export const ACCESSIBILITY_PRESETS: Record<string, AccessibilityPreset> = {
  default: {
    name: 'Default',
    description: 'Standard reading settings',
    settings: {
      font_family: 'Arial',
      font_size: 16,
      line_spacing: 1.5,
      letter_spacing: 0,
      text_color: '#000000',
      background_color: '#FFFFFF',
    },
  },
  dyslexia: {
    name: 'Dyslexia Friendly',
    description: 'Optimized for dyslexic readers',
    settings: {
      font_family: 'OpenDyslexic',
      font_size: 18,
      line_spacing: 2.0,
      letter_spacing: 0.1,
      text_color: '#000000',
      background_color: '#FFFBEA',
    },
  },
  visualImpairment: {
    name: 'Visual Impairment',
    description: 'High contrast with larger text',
    settings: {
      font_family: 'Arial',
      font_size: 24,
      line_spacing: 2.5,
      letter_spacing: 0.15,
      text_color: '#000000',
      background_color: '#FFFFE0',
    },
  },
};
