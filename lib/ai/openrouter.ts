export type GenerationResult = {
  optimizedCv: string;
  coverLetter: string;
  summary: string;
  keywords: string[];
  atsScore: number;
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function generateApplication(
  cvText: string,
  jobDescription: string
): Promise<GenerationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing on server");
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL || "https://apply-forge-r9h3.vercel.app",
      "X-Title": "ApplyForge",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 2500,
      messages: [
        {
          role: "system",
          content:
            "You are an elite ATS resume optimization expert. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `
Return JSON with:
optimizedCv, coverLetter, summary, keywords, atsScore.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE CV:
${cvText}
`,
        },
      ],
    }),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`OpenRouter API Error ${response.status}: ${raw}`);
  }

  const data = JSON.parse(raw);
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty AI response");
  }

  const cleaned = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}