'use client';

import { Calendar } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Lesson } from '@/lib/types/lesson';
import type { AccessibilitySettings } from '@/lib/types/accessibility';
import { DEFAULT_SETTINGS } from '@/lib/types/accessibility';

interface LessonViewerProps {
  lesson: Lesson;
  accessibilitySettings?: AccessibilitySettings;
  showMetadata?: boolean;
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return '—';
  }
}

export function LessonViewer({
  lesson,
  accessibilitySettings,
  showMetadata = true,
}: LessonViewerProps) {
  // Accessibility stilovi se primenjuju samo kad su eksplicitno prosleđeni (student view).
  // Teacher preview koristi default Card/prose stilove bez overrides.
  const hasAccessibility = Boolean(accessibilitySettings);
  const settings = accessibilitySettings || DEFAULT_SETTINGS;

  const contentStyle: React.CSSProperties | undefined = hasAccessibility
    ? {
        fontFamily: settings.font_family,
        fontSize: `${settings.font_size}px`,
        lineHeight: settings.line_spacing,
        letterSpacing: `${settings.letter_spacing}em`,
        color: settings.text_color,
        backgroundColor: settings.background_color,
      }
    : undefined;

  return (
    <div className="space-y-6">
      {showMetadata && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    Kreirano: {formatDate(lesson.createdAt)}
                  </span>
                  {lesson.metadata?.fileType && (
                    <>
                      <span aria-hidden>·</span>
                      <Badge variant="outline" className="uppercase">
                        {lesson.metadata.fileType}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              <Badge variant={lesson.isPublished ? 'success' : 'secondary'}>
                {lesson.isPublished ? 'Objavljeno' : 'Neobjavljeno'}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardContent className="p-6 sm:p-8">
          {lesson.content ? (
            <div
              className={
                hasAccessibility
                  ? 'prose prose-base lg:prose-lg prose-full-width rounded-md p-6 sm:p-8'
                  : 'prose prose-base lg:prose-lg prose-full-width dark:prose-invert'
              }
              style={contentStyle}
              dangerouslySetInnerHTML={{ __html: lesson.content }}
              aria-label="Sadržaj lekcije"
            />
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p>Lekcija nema sadržaj za prikaz.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
