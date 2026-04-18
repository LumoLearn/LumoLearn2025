import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/dashboard/page-header';
import { LessonUploadForm } from '@/components/features/lessons/LessonUploadForm';

export const metadata: Metadata = {
  title: 'Nova lekcija | LumoLearn',
  description: 'Otpremi novu lekciju za učenike',
};

export default function LessonUploadPage() {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
        <Link href="/dashboard/teacher/lessons">
          <ArrowLeft className="mr-2 size-4" />
          Nazad na lekcije
        </Link>
      </Button>

      <PageHeader
        title="Nova lekcija"
        description="Kreiraj novu lekciju otpremanjem Word ili PDF dokumenta."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <LessonUploadForm />

        <Card className="h-fit lg:sticky lg:top-6">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Info className="size-4" />
            </div>
            <CardTitle className="text-base">Uputstvo za otpremanje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <section className="space-y-2">
              <h3 className="inline-flex items-center gap-2 font-medium">
                <FileText className="size-4 text-muted-foreground" />
                Podržani formati
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Microsoft Word dokumenti (.docx)</li>
                <li>PDF dokumenti (.pdf)</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="font-medium">Ograničenja</h3>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Maksimalna veličina fajla: 10 MB</li>
                <li>Naslov lekcije: 3–255 karaktera</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="font-medium">Važne napomene</h3>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Fajlovi se automatski konvertuju u HTML za prikaz učenicima.</li>
                <li>
                  Nove lekcije su po default-u <strong>neobjavljene</strong> i
                  učenici ih ne vide.
                </li>
                <li>
                  Nakon otpremanja ih možeš objaviti sa spiska lekcija.
                </li>
                <li>
                  Formatiranje iz originalnog dokumenta biće zadržano koliko je
                  to moguće.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="font-medium">Najbolji rezultati</h3>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Koristi jasne naslove i podnaslove.</li>
                <li>Izbegavaj kompleksno formatiranje i tabele.</li>
                <li>Koristi standardne fontove.</li>
                <li>Pregledaj sadržaj pre objavljivanja.</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
