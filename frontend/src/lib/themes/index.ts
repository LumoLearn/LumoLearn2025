import type { UserRole } from '@/lib/constants/roles';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeVariant = 'professional' | 'learner';

export const THEME_VARIANT_CLASS: Record<ThemeVariant, string> = {
  professional: '',
  learner: 'theme-learner',
};

export function getThemeVariantForRole(role: UserRole | undefined): ThemeVariant {
  return role === 'student' ? 'learner' : 'professional';
}

export function getThemeVariantClass(role: UserRole | undefined): string {
  return THEME_VARIANT_CLASS[getThemeVariantForRole(role)];
}
