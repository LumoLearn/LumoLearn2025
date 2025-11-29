import { Metadata } from 'next';
import { LessonUploadForm } from '@/components/features/lessons/LessonUploadForm';

/**
 * Metadata for the lesson upload page
 */
export const metadata: Metadata = {
  title: 'Upload Lesson | LumoLearn',
  description: 'Upload new lessons for students',
};

/**
 * Lesson Upload Page (Teacher)
 *
 * This page allows teachers to upload lesson files (Word/PDF)
 * which will be converted to HTML and made available to students.
 *
 * Features:
 * - Drag-and-drop file upload
 * - File type validation (.docx, .pdf)
 * - File size validation (max 10MB)
 * - Title input with validation
 * - Upload progress indication
 * - Error handling and user feedback
 * - Redirect to lessons list on success
 *
 * Route: /dashboard/teacher/lessons/upload
 * Protected: Teacher role required
 */
export default function LessonUploadPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New Lesson</h1>
        <p className="text-muted-foreground mt-2">
          Create a new lesson by uploading a Word or PDF document
        </p>
      </div>

      {/* Upload Form */}
      <LessonUploadForm />

      {/* Instructions Section */}
      <div className="max-w-2xl mx-auto mt-8 space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Instructions</h2>

          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">Supported Formats:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Microsoft Word documents (.docx)</li>
                <li>PDF documents (.pdf)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">Limitations:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Maximum file size: 10MB</li>
                <li>Lesson title: 3-255 characters</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">Important Notes:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Files are automatically converted to HTML format for student viewing
                </li>
                <li>
                  Uploaded lessons are initially <strong>unpublished</strong> and
                  invisible to students
                </li>
                <li>
                  You can publish them after upload from the lessons list
                </li>
                <li>
                  Formatting from the original document will be preserved as much as possible
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">Best Practices for Optimal Results:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Use clear headings and subheadings</li>
                <li>Avoid complex formatting and tables</li>
                <li>Use standard fonts</li>
                <li>Review content after upload before publishing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
