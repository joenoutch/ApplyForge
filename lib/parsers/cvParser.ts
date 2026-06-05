import { createRequire } from "module";
import mammoth from "mammoth";

const require = createRequire(import.meta.url);

const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  buffer: Buffer
) => Promise<{ text: string }>;

export async function parsePdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);

  if (!data.text || data.text.trim().length < 50) {
    throw new Error("PDF text extraction failed");
  }

  return data.text;
}

export async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });

  if (!result.value || result.value.trim().length < 50) {
    throw new Error("DOCX text extraction failed");
  }

  return result.value;
}