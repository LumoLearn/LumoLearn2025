'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/auth.store';
import { studentService } from '@/lib/api/student';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  accessibilitySettingsSchema,
  type AccessibilitySettingsFormData
} from '@/lib/schemas/accessibility';
import {
  DEFAULT_SETTINGS,
  FONT_FAMILY_OPTIONS,
  ACCESSIBILITY_PRESETS,
  type AccessibilitySettings
} from '@/lib/types/accessibility';

export default function AccessibilitySettingsPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const defaultFormValues: AccessibilitySettingsFormData = {
    font_family: 'Arial',
    font_size: 16,
    line_spacing: 1.5,
    letter_spacing: 0,
    text_color: '#000000',
    background_color: '#FFFFFF',
  };

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm<AccessibilitySettingsFormData>({
    resolver: zodResolver(accessibilitySettingsSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange',
  });

  // Watch all form values for live preview
  const currentSettings = watch();

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) {
        setError('User not found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('[Accessibility Settings] Fetching settings for user:', user.id);
        const settings = await studentService.getAccessibilitySettings(user.id);
        console.log('[Accessibility Settings] Received settings:', settings);
        // Merge fetched settings with defaults to ensure all fields are present
        const completeSettings: AccessibilitySettingsFormData = {
          font_family: settings.font_family ?? defaultFormValues.font_family,
          font_size: settings.font_size ?? defaultFormValues.font_size,
          line_spacing: settings.line_spacing ?? defaultFormValues.line_spacing,
          letter_spacing: settings.letter_spacing ?? defaultFormValues.letter_spacing,
          text_color: settings.text_color ?? defaultFormValues.text_color,
          background_color: settings.background_color ?? defaultFormValues.background_color,
        };
        reset(completeSettings);
      } catch (err: any) {
        console.error('Error fetching accessibility settings:', err);
        setError(err.message || 'Failed to load settings');
        // Use default settings on error
        reset(defaultFormValues);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user?.id, reset]);

  // Handle form submission
  const onSubmit = async (data: AccessibilitySettingsFormData) => {
    if (!user?.id) {
      setError('User not found');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Ensure all values are present, merge with defaults
      const completeData: AccessibilitySettings = {
        font_family: data.font_family ?? defaultFormValues.font_family,
        font_size: data.font_size ?? defaultFormValues.font_size,
        line_spacing: data.line_spacing ?? defaultFormValues.line_spacing,
        letter_spacing: data.letter_spacing ?? defaultFormValues.letter_spacing,
        text_color: data.text_color ?? defaultFormValues.text_color,
        background_color: data.background_color ?? defaultFormValues.background_color,
      };

      console.log('[Accessibility Settings] Saving settings for user:', user.id);
      console.log('[Accessibility Settings] Data to save:', completeData);

      const result = await studentService.updateAccessibilitySettings(user.id, completeData);
      console.log('[Accessibility Settings] Save result:', result);

      setSuccessMessage('Settings saved successfully!');
      reset(completeData); // Reset form dirty state with complete data

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error saving accessibility settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Apply preset
  const applyPreset = (presetKey: string) => {
    const preset = ACCESSIBILITY_PRESETS[presetKey];
    if (preset) {
      Object.entries(preset.settings).forEach(([key, value]) => {
        setValue(key as keyof AccessibilitySettings, value, { shouldDirty: true });
      });
      setSuccessMessage(`Applied ${preset.name} preset`);
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Accessibility Settings</h1>
        <p className="text-muted-foreground mt-2">
          Customize your reading experience with accessibility options
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Customize Settings</CardTitle>
              <CardDescription>
                Adjust font, spacing, and colors to your preference
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Success Message */}
              {successMessage && (
                <div
                  className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800"
                  role="alert"
                  aria-live="polite"
                >
                  {successMessage}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div
                  className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800"
                  role="alert"
                  aria-live="assertive"
                >
                  {error}
                </div>
              )}

              {/* Quick Presets */}
              <div className="space-y-3 pb-6 border-b">
                <Label className="text-base font-semibold">Quick Presets</Label>
                <p className="text-sm text-muted-foreground">
                  Apply pre-configured settings optimized for specific needs
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(ACCESSIBILITY_PRESETS).map(([key, preset]) => (
                    <Button
                      key={key}
                      type="button"
                      variant="outline"
                      onClick={() => applyPreset(key)}
                      className="justify-start text-left h-auto py-3"
                    >
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-muted-foreground">{preset.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <Label htmlFor="font_family">Font Family</Label>
                <Controller
                  name="font_family"
                  control={control}
                  render={({ field }) => (
                    <select
                      id="font_family"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      {...field}
                    >
                      {FONT_FAMILY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.font_family && (
                  <p className="text-sm text-destructive">{errors.font_family.message}</p>
                )}
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="font_size">Font Size</Label>
                  <span className="text-sm text-muted-foreground">{currentSettings.font_size ?? 16}px</span>
                </div>
                <Controller
                  name="font_size"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <input
                      id="font_size"
                      type="range"
                      min="12"
                      max="24"
                      step="1"
                      value={value ?? 16}
                      onChange={(e) => onChange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      {...field}
                    />
                  )}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>12px</span>
                  <span>24px</span>
                </div>
                {errors.font_size && (
                  <p className="text-sm text-destructive">{errors.font_size.message}</p>
                )}
              </div>

              {/* Line Spacing */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="line_spacing">Line Spacing</Label>
                  <span className="text-sm text-muted-foreground">{(currentSettings.line_spacing ?? 1.5).toFixed(1)}</span>
                </div>
                <Controller
                  name="line_spacing"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <input
                      id="line_spacing"
                      type="range"
                      min="1.0"
                      max="3.0"
                      step="0.1"
                      value={value ?? 1.5}
                      onChange={(e) => onChange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      {...field}
                    />
                  )}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1.0</span>
                  <span>3.0</span>
                </div>
                {errors.line_spacing && (
                  <p className="text-sm text-destructive">{errors.line_spacing.message}</p>
                )}
              </div>

              {/* Letter Spacing */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="letter_spacing">Letter Spacing</Label>
                  <span className="text-sm text-muted-foreground">{(currentSettings.letter_spacing ?? 0).toFixed(2)}em</span>
                </div>
                <Controller
                  name="letter_spacing"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <input
                      id="letter_spacing"
                      type="range"
                      min="0"
                      max="0.2"
                      step="0.01"
                      value={value ?? 0}
                      onChange={(e) => onChange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      {...field}
                    />
                  )}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0em</span>
                  <span>0.2em</span>
                </div>
                {errors.letter_spacing && (
                  <p className="text-sm text-destructive">{errors.letter_spacing.message}</p>
                )}
              </div>

              {/* Text Color */}
              <div className="space-y-2">
                <Label htmlFor="text_color">Text Color</Label>
                <div className="flex items-center gap-3">
                  <Controller
                    name="text_color"
                    control={control}
                    render={({ field }) => (
                      <input
                        id="text_color"
                        type="color"
                        className="h-10 w-20 rounded border border-input cursor-pointer"
                        value={field.value ?? '#000000'}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    )}
                  />
                  <span className="text-sm text-muted-foreground font-mono">
                    {currentSettings.text_color ?? '#000000'}
                  </span>
                </div>
                {errors.text_color && (
                  <p className="text-sm text-destructive">{errors.text_color.message}</p>
                )}
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <Label htmlFor="background_color">Background Color</Label>
                <div className="flex items-center gap-3">
                  <Controller
                    name="background_color"
                    control={control}
                    render={({ field }) => (
                      <input
                        id="background_color"
                        type="color"
                        className="h-10 w-20 rounded border border-input cursor-pointer"
                        value={field.value ?? '#FFFFFF'}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    )}
                  />
                  <span className="text-sm text-muted-foreground font-mono">
                    {currentSettings.background_color ?? '#FFFFFF'}
                  </span>
                </div>
                {errors.background_color && (
                  <p className="text-sm text-destructive">{errors.background_color.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button
                type="submit"
                disabled={isSaving || !isDirty}
                aria-busy={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
              {isDirty && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                >
                  Reset
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Live Preview Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your text will appear with these settings
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div
                className="p-6 rounded-md border"
                style={{
                  fontFamily: currentSettings.font_family ?? 'Arial',
                  fontSize: `${currentSettings.font_size ?? 16}px`,
                  lineHeight: currentSettings.line_spacing ?? 1.5,
                  letterSpacing: `${currentSettings.letter_spacing ?? 0}em`,
                  color: currentSettings.text_color ?? '#000000',
                  backgroundColor: currentSettings.background_color ?? '#FFFFFF',
                }}
              >
                <h3 className="font-bold mb-4">Sample Lesson Text</h3>
                <p className="mb-4">
                  The quick brown fox jumps over the lazy dog. This sentence contains every letter
                  of the alphabet and helps you see how the text will look.
                </p>
                <p className="mb-4">
                  Reading should be comfortable and accessible for everyone. These settings allow
                  you to customize your reading experience to match your needs.
                </p>
                <p>
                  Try adjusting the font size, spacing, and colors until you find what works best
                  for you. Your settings will be saved automatically.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
