import mammoth from 'mammoth';
import PDFParser from 'pdf2json';

/**
 * File Service
 *
 * Handles parsing of Word (.docx) and PDF files to HTML
 */

export interface ParsedContent {
  html: string;
  plainText: string;
  metadata?: {
    fileType: string;
    fileName: string;
    fileSize: number;
  };
}

/**
 * Ubaci razmak gde bold/italic tag dodiruje slovo ili cifru — pokriva tipičnu
 * Word grešku kada autor selektuje reč zajedno sa okolnim razmakom pa nestane
 * space između <strong> i sledećeg teksta ("Centriolesu" umesto "Centriole su").
 *
 * Koristi \p{L}/\p{N} da hvata ćirilicu i latinicu podjednako. Interpunkcija se
 * namerno ne dira — "<strong>DNK</strong>." treba da ostane bez razmaka.
 */
const normalizeInlineSpacing = (html: string): string =>
  html
    .replace(/<\/(strong|em|b|i)>(?=[\p{L}\p{N}])/gu, '</$1> ')
    .replace(/(?<=[\p{L}\p{N}])<(strong|em|b|i)>/gu, ' <$1>');

export const parseWordFile = async (
  buffer: Buffer,
  fileName: string
): Promise<ParsedContent> => {
  try {
    const result = await mammoth.convertToHtml({ buffer });
    const html = normalizeInlineSpacing(result.value);

    return {
      html,
      plainText: html.replace(/<[^>]*>/g, ''),
      metadata: {
        fileType: 'docx',
        fileName,
        fileSize: buffer.length,
      },
    };
  } catch (error) {
    console.error('Error parsing Word file:', error);
    throw new Error('Failed to parse Word document');
  }
};

/**
 * Parse PDF file to HTML
 *
 * Koristi pdf2json da ekstraktuje tekst sa pozicijama i font stilovima, pa
 * onda rekonstruiše paragrafe, naslove i bold markup iz toga.
 *
 * Heuristike:
 *  - Tekst-run-ovi sa istim y unutar ±0.3 tolerancije pripadaju istoj liniji.
 *  - Vertikalni razmak između linija veći od ~1.6× medijane = granica paragrafa.
 *  - Font size >= 1.25× medijane → h2; >= 1.1× → h3.
 *  - Bold flag na run-u → <strong>.
 */

interface PdfTextRun {
  T: string; // URL-encoded tekst
  S?: number; // style index
  TS?: [number, number, number, number]; // [fontFaceId, fontSize, bold, italic]
}

interface PdfTextBlock {
  x: number;
  y: number;
  R: PdfTextRun[];
}

interface PdfPage {
  Texts: PdfTextBlock[];
}

interface PdfData {
  Pages: PdfPage[];
}

interface ParsedRun {
  text: string;
  bold: boolean;
  italic: boolean;
  fontSize: number;
}

interface ParsedLine {
  y: number;
  runs: ParsedRun[];
  maxFontSize: number;
  plain: string;
}

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const median = (nums: number[]): number => {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const extractPdfData = (buffer: Buffer): Promise<PdfData> =>
  new Promise((resolve, reject) => {
    const parser = new PDFParser(null, true);
    parser.on('pdfParser_dataError', (err: any) => reject(err?.parserError || err));
    parser.on('pdfParser_dataReady', (data: PdfData) => resolve(data));
    parser.parseBuffer(buffer);
  });

const buildLines = (page: PdfPage): ParsedLine[] => {
  const Y_TOLERANCE = 0.3;
  const lines: ParsedLine[] = [];

  // Sortiraj tekst-blokove prvo po y, pa po x — rekonstruiše prirodni redosled čitanja.
  const sortedBlocks = [...page.Texts].sort((a, b) => {
    if (Math.abs(a.y - b.y) > Y_TOLERANCE) return a.y - b.y;
    return a.x - b.x;
  });

  for (const block of sortedBlocks) {
    const runs: ParsedRun[] = block.R.map((r) => {
      const fontSize = r.TS ? r.TS[1] : 12;
      const bold = r.TS ? Boolean(r.TS[2]) : false;
      const italic = r.TS ? Boolean(r.TS[3]) : false;
      let text = '';
      try {
        text = decodeURIComponent(r.T);
      } catch {
        text = r.T;
      }
      return { text, bold, italic, fontSize };
    });

    if (runs.every((r) => r.text.trim().length === 0)) continue;

    const lastLine = lines[lines.length - 1];
    if (lastLine && Math.abs(lastLine.y - block.y) <= Y_TOLERANCE) {
      lastLine.runs.push(...runs);
    } else {
      lines.push({
        y: block.y,
        runs,
        maxFontSize: 0,
        plain: '',
      });
    }
  }

  // Izračunaj maxFontSize i plain text po liniji.
  for (const line of lines) {
    line.maxFontSize = Math.max(...line.runs.map((r) => r.fontSize));
    line.plain = line.runs.map((r) => r.text).join('').trim();
  }

  return lines.filter((l) => l.plain.length > 0);
};

const HEADING_RATIO_H2 = 1.25;
const HEADING_RATIO_H3 = 1.1;

const runsToInlineHtml = (runs: ParsedRun[]): string => {
  // Spajaj susedne bold run-ove da izbegnemo fragmentisane <strong> tagove.
  const parts: string[] = [];
  let currentBold: boolean | null = null;
  let buffer = '';

  const flush = () => {
    if (buffer.length === 0) return;
    const escaped = escapeHtml(buffer);
    parts.push(currentBold ? `<strong>${escaped}</strong>` : escaped);
    buffer = '';
  };

  for (const run of runs) {
    if (run.text.length === 0) continue;
    if (currentBold === null) {
      currentBold = run.bold;
      buffer = run.text;
    } else if (run.bold === currentBold) {
      buffer += run.text;
    } else {
      flush();
      currentBold = run.bold;
      buffer = run.text;
    }
  }
  flush();

  return parts.join('').trim();
};

interface Block {
  kind: 'h2' | 'h3' | 'p';
  runs: ParsedRun[];
}

// Iseci liniju po granicama font-size-a — run-ovi sa fontom >= bodyFontSize * ratio
// postaju zaseban heading blok iznad ostatka linije.
const splitLineByFontSize = (line: ParsedLine, bodyFontSize: number): Block[] => {
  if (bodyFontSize <= 0) return [{ kind: 'p', runs: line.runs }];

  const h2Threshold = bodyFontSize * HEADING_RATIO_H2;
  const h3Threshold = bodyFontSize * HEADING_RATIO_H3;

  const classify = (fs: number): 'h2' | 'h3' | 'p' => {
    if (fs >= h2Threshold) return 'h2';
    if (fs >= h3Threshold) return 'h3';
    return 'p';
  };

  const blocks: Block[] = [];
  let currentKind: 'h2' | 'h3' | 'p' | null = null;
  let currentRuns: ParsedRun[] = [];

  for (const run of line.runs) {
    if (run.text.trim().length === 0 && currentKind !== null) {
      // Whitespace pripada trenutnom bloku.
      currentRuns.push(run);
      continue;
    }
    const kind = classify(run.fontSize);
    if (currentKind === null) {
      currentKind = kind;
      currentRuns = [run];
    } else if (kind === currentKind) {
      currentRuns.push(run);
    } else {
      blocks.push({ kind: currentKind, runs: currentRuns });
      currentKind = kind;
      currentRuns = [run];
    }
  }
  if (currentKind !== null && currentRuns.length > 0) {
    blocks.push({ kind: currentKind, runs: currentRuns });
  }

  return blocks;
};

const buildHtmlFromLines = (lines: ParsedLine[]): string => {
  if (lines.length === 0) return '';

  const bodyFontSize = median(
    lines
      .flatMap((l) => l.runs.map((r) => r.fontSize))
      .filter((s) => s > 0)
  );

  // Izračunaj tipičan razmak između uzastopnih linija — veća razdaljina = novi paragraf.
  const gaps: number[] = [];
  for (let i = 1; i < lines.length; i++) {
    const gap = lines[i].y - lines[i - 1].y;
    if (gap > 0) gaps.push(gap);
  }
  const medianGap = median(gaps) || 1;
  const paragraphGapThreshold = medianGap * 1.6;

  // Prvi prolaz: svaku liniju rastavi po font-size granicama u blokove.
  // Rezultat je ravan niz blokova sa očuvanim y-koordinatama za računanje gap-ova.
  interface FlatBlock extends Block {
    y: number;
    lineIndex: number;
  }
  const flat: FlatBlock[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const blocks = splitLineByFontSize(line, bodyFontSize);
    for (const b of blocks) {
      flat.push({ ...b, y: line.y, lineIndex: i });
    }
  }

  // Drugi prolaz: spajaj uzastopne blokove iste vrste u isti paragraf/heading,
  // osim ako je gap između njihovih linija veći od praga paragrafa.
  interface MergedBlock {
    kind: 'h2' | 'h3' | 'p';
    runs: ParsedRun[];
  }
  const merged: MergedBlock[] = [];
  let prevLineIndex = -1;

  for (const block of flat) {
    const last = merged[merged.length - 1];
    const prevLine = prevLineIndex >= 0 ? lines[prevLineIndex] : null;
    const currentLine = lines[block.lineIndex];
    const gap = prevLine ? currentLine.y - prevLine.y : 0;
    const newParagraph = gap >= paragraphGapThreshold;
    const sameLine = block.lineIndex === prevLineIndex;

    if (last && last.kind === block.kind && (sameLine || !newParagraph)) {
      // Dodaj razmak između run-ova različitih linija unutar istog paragrafa.
      if (!sameLine) {
        last.runs.push({ text: ' ', bold: false, italic: false, fontSize: bodyFontSize });
      }
      last.runs.push(...block.runs);
    } else {
      merged.push({ kind: block.kind, runs: [...block.runs] });
    }
    prevLineIndex = block.lineIndex;
  }

  const html = merged
    .map((b) => {
      const inline = runsToInlineHtml(b.runs);
      if (inline.length === 0) return '';
      if (b.kind === 'h2') return `<h2>${inline}</h2>`;
      if (b.kind === 'h3') return `<h3>${inline}</h3>`;
      return `<p>${inline}</p>`;
    })
    .filter((s) => s.length > 0)
    .join('\n');

  return html;
};

export const parsePDFFile = async (
  buffer: Buffer,
  fileName: string
): Promise<ParsedContent> => {
  try {
    const data = await extractPdfData(buffer);

    const allLines: ParsedLine[] = [];
    for (const page of data.Pages || []) {
      const pageLines = buildLines(page);
      // Dodaj veliki y-offset po strani da medianGap ne pomeša strane.
      const yOffset = allLines.length > 0 ? allLines[allLines.length - 1].y + 100 : 0;
      for (const line of pageLines) {
        allLines.push({ ...line, y: line.y + yOffset });
      }
    }

    const html = normalizeInlineSpacing(buildHtmlFromLines(allLines));
    const plainText = allLines.map((l) => l.plain).join('\n');

    return {
      html,
      plainText,
      metadata: {
        fileType: 'pdf',
        fileName,
        fileSize: buffer.length,
      },
    };
  } catch (error) {
    console.error('Error parsing PDF file:', error);
    throw new Error('Failed to parse PDF document');
  }
};

export const parseFile = async (
  buffer: Buffer,
  fileName: string
): Promise<ParsedContent> => {
  const extension = fileName.toLowerCase().split('.').pop();

  switch (extension) {
    case 'docx':
      return parseWordFile(buffer, fileName);
    case 'pdf':
      return parsePDFFile(buffer, fileName);
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
};
