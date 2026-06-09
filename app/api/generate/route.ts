import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parsePdf, parseDocx } from "@/lib/parsers/cvParser";
import { generateApplication } from "@/lib/ai/openrouter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("cv") as File | null;
    const jobDescription = formData.get("jobDescription");
    const email = formData.get("email");

    if (!file) {
      return NextResponse.json({ error: "CV file is required" }, { status: 400 });
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (typeof jobDescription !== "string" || jobDescription.trim().length < 100) {
      return NextResponse.json(
        { error: "Job description must contain at least 100 characters" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();

    let cvText = "";

    if (file.type === "application/pdf" || fileName.endsWith(".pdf")) {
      cvText = await parsePdf(buffer);
    } else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      cvText = await parseDocx(buffer);
    } else {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are supported" },
        { status: 400 }
      );
    }

    const cleanCvText = cvText.trim();

    if (cleanCvText.length < 100) {
      return NextResponse.json(
        { error: "Could not extract enough text from CV" },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        credits: 1,
      },
    });

    const generation = await prisma.generation.create({
      data: {
        userId: user.id,
        originalCv: cleanCvText,
        jobDescription: jobDescription.trim(),
        status: "PROCESSING",
      },
    });

    try {
      const result = await generateApplication(cleanCvText, jobDescription.trim());

      await prisma.generation.update({
		  where: { id: generation.id },
		  data: {
			optimizedCv:
			  typeof result.optimizedCv === "string"
				? result.optimizedCv
				: JSON.stringify(result.optimizedCv, null, 2),

			coverLetter:
			  typeof result.coverLetter === "string"
				? result.coverLetter
				: JSON.stringify(result.coverLetter, null, 2),

			summary:
			  typeof result.summary === "string"
				? result.summary
				: JSON.stringify(result.summary, null, 2),

			keywords: Array.isArray(result.keywords)
			  ? result.keywords
			  : [],

			atsScore:
			  typeof result.atsScore === "number"
				? result.atsScore
				: 0,

			status: "COMPLETED",
		  },
	 });

      return NextResponse.json({
		  success: true,
		  generationId: updatedGeneration.id,
		  atsScore: updatedGeneration.atsScore,
		  optimizedCv: updatedGeneration.optimizedCv,
		  coverLetter: updatedGeneration.coverLetter,
		  summary: updatedGeneration.summary,
		  keywords: updatedGeneration.keywords
		});
    } catch (aiError) {
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: "FAILED",
        },
      });

      console.error("APPLYFORGE_AI_ERROR:", aiError);

      return NextResponse.json(
        {
          error: "AI generation failed",
          details: aiError instanceof Error ? aiError.message : String(aiError),
          generationId: generation.id,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("APPLYFORGE_GENERATION_ERROR:", error);

    return NextResponse.json(
      {
        error: "Generation failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}