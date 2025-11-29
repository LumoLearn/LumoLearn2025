'use client';

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

/**
 * LessonViewer Component
 *
 * Displays lesson content with optional accessibility settings applied.
 * Supports dynamic styling based on student preferences (font, spacing, colors).
 *
 * @param lesson - The lesson data including HTML content
 * @param accessibilitySettings - Optional accessibility preferences (for students)
 * @param showMetadata - Whether to show lesson metadata (default: true)
 */
export function LessonViewer({
  lesson,
  accessibilitySettings,
  showMetadata = true,
}: LessonViewerProps) {
  // Use provided settings or fall back to defaults
  const settings = accessibilitySettings || DEFAULT_SETTINGS;

  // Format dates
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const createdDate = formatDate(lesson.createdAt);
  const updatedDate = formatDate(lesson.updatedAt);

  return (
    <div className="space-y-6">
      {/* Lesson Metadata */}
      {showMetadata && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>Created: {createdDate}</span>
                  {lesson.metadata?.fileType && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="uppercase">
                        {lesson.metadata.fileType}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              <Badge variant={lesson.isPublished ? 'default' : 'secondary'}>
                {lesson.isPublished ? 'Published' : 'Unpublished'}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Lesson Content */}
      <Card>
        <CardContent className="pt-6">
          {lesson.content ? (
            <div
              className="prose prose-sm sm:prose lg:prose-lg max-w-none"
              style={{
                fontFamily: settings.font_family,
                fontSize: `${settings.font_size}px`,
                lineHeight: settings.line_spacing,
                letterSpacing: `${settings.letter_spacing}em`,
                color: settings.text_color,
                backgroundColor: settings.background_color,
                padding: '2rem',
                borderRadius: '0.5rem',
                minHeight: '400px',
              }}
              dangerouslySetInnerHTML={{ __html: lesson.content }}
              aria-label="Lesson content"
            />
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p>No content available for this lesson.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accessibility Settings Info (for development/debugging) */}
      {accessibilitySettings && process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Accessibility Settings Applied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
              <div>
                <span className="font-semibold">Font:</span> {settings.font_family}
              </div>
              <div>
                <span className="font-semibold">Size:</span> {settings.font_size}px
              </div>
              <div>
                <span className="font-semibold">Line Spacing:</span> {settings.line_spacing}
              </div>
              <div>
                <span className="font-semibold">Letter Spacing:</span> {settings.letter_spacing}em
              </div>
              <div>
                <span className="font-semibold">Text Color:</span> {settings.text_color}
              </div>
              <div>
                <span className="font-semibold">Background:</span> {settings.background_color}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
