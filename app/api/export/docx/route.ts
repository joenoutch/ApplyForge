import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Generation ID is required" }, { status: 400 });
  }

  const generation = await prisma.generation.findUnique({
    where: { id },
  });

  if (!generation) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: "ApplyForge — Optimized Application",
            heading: HeadingLevel.TITLE,
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `ATS Score: ${generation.atsScore ?? "N/A"}`,
                bold: true,
              }),
            ],
          }),

          new Paragraph({ text: "" }),

          new Paragraph({
            text: "Professional Summary",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph(generation.summary ?? ""),

          new Paragraph({ text: "" }),

          new Paragraph({
            text: "ATS Keywords",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph((generation.keywords || []).join(", ")),

          new Paragraph({ text: "" }),

          new Paragraph({
            text: "Optimized CV",
            heading: HeadingLevel.HEADING_1,
          }),
          ...splitText(generation.optimizedCv ?? ""),

          new Paragraph({ text: "" }),

          new Paragraph({
            text: "Cover Letter",
            heading: HeadingLevel.HEADING_1,
          }),
          ...splitText(generation.coverLetter ?? ""),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const body = new Uint8Array(buffer);

  return new NextResponse(body, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="applyforge-${id}.docx"`,
    },
  });
}

function splitText(text: string): Paragraph[] {
  return text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => new Paragraph(line.trim()));
}