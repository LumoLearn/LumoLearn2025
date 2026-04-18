'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  AlertCircle,
  BookOpen,
  Check,
  Eye,
  Palette,
  RotateCcw,
  Settings as SettingsIcon,
  Sparkles,
  Type,
} from 'lucide-react';

import { useAuthStore } from '@/store/auth.store';
import { studentService } from '@/lib/api/student';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import {
  accessibilitySettingsSchema,
  type AccessibilitySettingsFormData,
} from '@/lib/schemas/accessibility';
import {
  FONT_FAMILY_OPTIONS,
  ACCESSIBILITY_PRESETS,
  type AccessibilitySettings,
} from '@/lib/types/accessibility';
import { cn } from '@/lib/utils';

const DEFAULT_FORM_VALUES: AccessibilitySettingsFormData = {
  font_family: 'Arial',
  font_size: 16,
  line_spacing: 1.5,
  letter_spacing: 0,
  text_color: '#000000',
  background_color: '#FFFFFF',
};

const PRESET_TRANSLATIONS: Record<string, { name: string; description: string; icon: React.ComponentType<{ className?: string }> }> = {
  default: {
    name: 'Standardno',
    description: 'Uobičajena podešavanja za čitanje',
    icon: SettingsIcon,
  },
  dyslexia: {
    name: 'Disleksija',
    description: 'Optimizovano za čitaoce sa disleksijom',
    icon: Sparkles,
  },
  visualImpairment: {
    name: 'Oslabljen vid',
    description: 'Visok kontrast i veći tekst',
    icon: Eye,
  },
};

export default function AccessibilitySettingsPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AccessibilitySettingsFormData>({
    resolver: zodResolver(accessibilitySettingsSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onChange',
  });

  const currentSettings = watch();

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) {
        setError('Korisnik nije pronađen');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const settings = await studentService.getAccessibilitySettings(user.id);
        const merged: AccessibilitySettingsFormData = {
          font_family: settings.font_family ?? DEFAULT_FORM_VALUES.font_family,
          font_size: settings.font_size ?? DEFAULT_FORM_VALUES.font_size,
          line_spacing: settings.line_spacing ?? DEFAULT_FORM_VALUES.line_spacing,
          letter_spacing:
            settings.letter_spacing ?? DEFAULT_FORM_VALUES.letter_spacing,
          text_color: settings.text_color ?? DEFAULT_FORM_VALUES.text_color,
          background_color:
            settings.background_color ?? DEFAULT_FORM_VALUES.background_color,
        };
        reset(merged);
      } catch (err: any) {
        setError(err.message || 'Učitavanje podešavanja nije uspelo');
        reset(DEFAULT_FORM_VALUES);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user?.id, reset]);

  const onSubmit = async (data: AccessibilitySettingsFormData) => {
    if (!user?.id) {
      setError('Korisnik nije pronađen');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const complete: AccessibilitySettings = {
        font_family: data.font_family ?? DEFAULT_FORM_VALUES.font_family,
        font_size: data.font_size ?? DEFAULT_FORM_VALUES.font_size,
        line_spacing: data.line_spacing ?? DEFAULT_FORM_VALUES.line_spacing,
        letter_spacing:
          data.letter_spacing ?? DEFAULT_FORM_VALUES.letter_spacing,
        text_color: data.text_color ?? DEFAULT_FORM_VALUES.text_color,
        background_color:
          data.background_color ?? DEFAULT_FORM_VALUES.background_color,
      };

      await studentService.updateAccessibilitySettings(user.id, complete);
      toast.success('Podešavanja su sačuvana');
      reset(complete);
    } catch (err: any) {
      const msg = err.message || 'Čuvanje podešavanja nije uspelo';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (presetKey: string) => {
    const preset = ACCESSIBILITY_PRESETS[presetKey];
    if (!preset) return;
    Object.entries(preset.settings).forEach(([key, value]) => {
      setValue(key as keyof AccessibilitySettings, value, {
        shouldDirty: true,
      });
    });
    setActivePreset(presetKey);
    toast.success(`Primenjen preset: ${PRESET_TRANSLATIONS[presetKey]?.name ?? preset.name}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Pristupačnost"
          description="Prilagodi iskustvo čitanja prema svojim potrebama."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[600px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pristupačnost"
        description="Prilagodi iskustvo čitanja prema svojim potrebama."
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <CardTitle>Brze podrške</CardTitle>
                    <CardDescription>
                      Primeni gotova podešavanja optimizovana za različite potrebe.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(ACCESSIBILITY_PRESETS).map(([key, preset]) => {
                  const translated = PRESET_TRANSLATIONS[key];
                  const PresetIcon = translated?.icon ?? SettingsIcon;
                  const isActive = activePreset === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyPreset(key)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors',
                        'hover:border-primary/50 hover:bg-accent/40',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isActive
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border'
                      )}
                    >
                      <div
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-md',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <PresetIcon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {translated?.name ?? preset.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {translated?.description ?? preset.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-md bg-[color:var(--info)]/10 text-[color:var(--info)]">
                    <Type className="size-5" />
                  </div>
                  <CardTitle>Tekst</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
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

                <div className="space-y-2">
                  <Label htmlFor="font_family">Font</Label>
                  <Controller
                    name="font_family"
                    control={control}
                    render={({ field }) => (
                      <select
                        id="font_family"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                    <p className="text-sm text-destructive">
                      {errors.font_family.message}
                    </p>
                  )}
                </div>

                <Slider
                  label="Veličina fonta"
                  name="font_size"
                  control={control}
                  min={12}
                  max={24}
                  step={1}
                  displayValue={`${currentSettings.font_size ?? 16}px`}
                  minLabel="12px"
                  maxLabel="24px"
                  error={errors.font_size?.message}
                />

                <Slider
                  label="Razmak redova"
                  name="line_spacing"
                  control={control}
                  min={1.0}
                  max={3.0}
                  step={0.1}
                  displayValue={(currentSettings.line_spacing ?? 1.5).toFixed(1)}
                  minLabel="1.0"
                  maxLabel="3.0"
                  error={errors.line_spacing?.message}
                />

                <Slider
                  label="Razmak slova"
                  name="letter_spacing"
                  control={control}
                  min={0}
                  max={0.2}
                  step={0.01}
                  displayValue={`${(currentSettings.letter_spacing ?? 0).toFixed(2)}em`}
                  minLabel="0em"
                  maxLabel="0.2em"
                  error={errors.letter_spacing?.message}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-md bg-[color:var(--success)]/10 text-[color:var(--success)]">
                    <Palette className="size-5" />
                  </div>
                  <CardTitle>Boje</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <ColorPicker
                  name="text_color"
                  control={control}
                  label="Boja teksta"
                  value={currentSettings.text_color ?? '#000000'}
                  error={errors.text_color?.message}
                />
                <ColorPicker
                  name="background_color"
                  control={control}
                  label="Boja pozadine"
                  value={currentSettings.background_color ?? '#FFFFFF'}
                  error={errors.background_color?.message}
                />
              </CardContent>
              <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {isDirty && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset();
                      setActivePreset(null);
                    }}
                  >
                    <RotateCcw className="mr-2 size-4" />
                    Poništi izmene
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSaving || !isDirty}
                  aria-busy={isSaving}
                >
                  <Check className="mr-2 size-4" />
                  {isSaving ? 'Čuvanje...' : 'Sačuvaj'}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <BookOpen className="size-5" />
                  </div>
                  <div>
                    <CardTitle>Pregled uživo</CardTitle>
                    <CardDescription>
                      Vidi kako će izgledati tekst sa tvojim podešavanjima.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="rounded-md border p-6"
                  style={{
                    fontFamily: currentSettings.font_family ?? 'Arial',
                    fontSize: `${currentSettings.font_size ?? 16}px`,
                    lineHeight: currentSettings.line_spacing ?? 1.5,
                    letterSpacing: `${currentSettings.letter_spacing ?? 0}em`,
                    color: currentSettings.text_color ?? '#000000',
                    backgroundColor:
                      currentSettings.background_color ?? '#FFFFFF',
                  }}
                >
                  <h3 className="mb-4 font-bold">Primer teksta lekcije</h3>
                  <p className="mb-4">
                    Brza smeđa lisica skače preko lenjog psa. Ova rečenica
                    sadrži većinu slova abecede i pomaže ti da vidiš kako će
                    izgledati tekst.
                  </p>
                  <p className="mb-4">
                    Čitanje treba da bude prijatno i pristupačno svima. Ova
                    podešavanja ti omogućavaju da prilagodiš iskustvo čitanja
                    svojim potrebama.
                  </p>
                  <p>
                    Menjaj veličinu fonta, razmake i boje dok ne nađeš ono što
                    ti najviše odgovara. Podešavanja se čuvaju na tvom nalogu.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

interface SliderProps {
  label: string;
  name: keyof AccessibilitySettingsFormData;
  control: any;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  minLabel: string;
  maxLabel: string;
  error?: string;
}

function Slider({
  label,
  name,
  control,
  min,
  max,
  step,
  displayValue,
  minLabel,
  maxLabel,
  error,
}: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>{label}</Label>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
          {displayValue}
        </span>
      </div>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ...rest } }) => (
          <input
            id={name}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value ?? min}
            onChange={(e) => onChange(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
            {...rest}
          />
        )}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

interface ColorPickerProps {
  name: 'text_color' | 'background_color';
  control: any;
  label: string;
  value: string;
  error?: string;
}

function ColorPicker({ name, control, label, value, error }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="flex items-center gap-3">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              id={name}
              type="color"
              className="h-10 w-16 cursor-pointer rounded-md border border-input bg-transparent p-1"
              value={field.value ?? value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
            />
          )}
        />
        <span className="font-mono text-sm text-muted-foreground">{value}</span>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
