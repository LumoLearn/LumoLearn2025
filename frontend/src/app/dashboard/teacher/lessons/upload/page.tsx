import { Metadata } from 'next';
import { LessonUploadForm } from '@/components/features/lessons/LessonUploadForm';

/**
 * Metadata for the lesson upload page
 */
export const metadata: Metadata = {
  title: 'Upload Lekcije | LumoLearn',
  description: 'Upload nove lekcije za učenike',
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
        <h1 className="text-3xl font-bold tracking-tight">Nova Lekcija</h1>
        <p className="text-muted-foreground mt-2">
          Kreirajte novu lekciju upload-ovanjem Word ili PDF dokumenta
        </p>
      </div>

      {/* Upload Form */}
      <LessonUploadForm />

      {/* Instructions Section */}
      <div className="max-w-2xl mx-auto mt-8 space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Uputstvo za upload</h2>

          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">Podržani formati:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Microsoft Word dokumenti (.docx)</li>
                <li>PDF dokumenti (.pdf)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">Ograničenja:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Maksimalna veličina fajla: 10MB</li>
                <li>Naslov lekcije: 3-255 karaktera</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">Napomene:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Fajlovi se automatski konvertuju u HTML format za prikaz učenicima
                </li>
                <li>
                  Upload-ovane lekcije su inicijalno <strong>nepublikovane</strong> i
                  nevidljive učenicima
                </li>
                <li>
                  Možete ih publikovati nakon upload-a iz liste lekcija
                </li>
                <li>
                  Formatiranje iz originalnog dokumenta će biti očuvano koliko je moguće
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">Preporuke za najbolje rezultate:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Koristite jasne naslove i podnaslove</li>
                <li>Izbegavajte složeno formatiranje i tabele</li>
                <li>Koristite standardne fontove</li>
                <li>Proverite sadržaj nakon upload-a pre publikovanja</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
