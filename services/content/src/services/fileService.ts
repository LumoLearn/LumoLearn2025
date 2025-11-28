import mammoth from 'mammoth';
// pdf-parse v2 uses class-based API
import { PDFParse } from 'pdf-parse';

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
 * Parse Word (.docx) file to HTML
 *
 * Uses mammoth library to convert .docx to clean HTML
 */
export const parseWordFile = async (
  buffer: Buffer,
  fileName: string
): Promise<ParsedContent> => {
  try {
    const result = await mammoth.convertToHtml({ buffer });

    return {
      html: result.value,
      plainText: result.value.replace(/<[^>]*>/g, ''), // Strip HTML tags for plain text
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
 * Uses pdf-parse v2 library to extract text from PDF and convert to basic HTML
 */
export const parsePDFFile = async (
  buffer: Buffer,
  fileName: string
): Promise<ParsedContent> => {
  try {
    // pdf-parse v2 uses class-based API - use 'data' property with Uint8Array
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();

    // Convert plain text to basic HTML with paragraphs
    const textLines: string[] = result.text.split('\n');
    const htmlContent = textLines
      .map((line: string) => {
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0) {
          return '<br>';
        }
        return `<p>${trimmedLine}</p>`;
      })
      .join('\n');

    return {
      html: htmlContent,
      plainText: result.text,
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

/**
 * Parse file based on extension
 *
 * Automatically detects file type and uses appropriate parser
 */
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
