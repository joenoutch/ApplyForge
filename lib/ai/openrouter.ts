export type GenerationResult = {
  optimizedCv: string
  coverLetter: string
  summary: string
  keywords: string[]
  atsScore: number
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const TIMEOUT_MS = 90000
const MAX_CV_LENGTH = 4500
const MAX_JOB_LENGTH = 3500

export async function generateApplication(
  cvText: string,
  jobDescription: string
): Promise<GenerationResult> {

  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing")
  }

  const safeCv = sanitizeText(cvText, MAX_CV_LENGTH)
  const safeJob = sanitizeText(jobDescription, MAX_JOB_LENGTH)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response: Response

  try {
    response = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.APP_URL || "http://localhost:3000",
        "X-Title": "ApplyForge"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        temperature: 0.2,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 2500,

        messages: [
          {
            role: "system",
            content: `
You are an elite ATS resume optimization expert.

STRICT RULES:
- Return ONLY valid JSON
- No markdown
- No explanations
- No extra text
- No backticks
- Must begin with {
- Must end with }

Never invent:
- languages
- certifications
- companies
- diplomas
- job titles
- years of experience

Only use verified CV information.
`
          },
          {
            role: "user",
            content: `
Return EXACTLY this JSON:

{
  "optimizedCv": "string",
  "coverLetter": "string",
  "summary": "string",
  "keywords": ["string"],
  "atsScore": 85
}

JOB DESCRIPTION:
${safeJob}

CANDIDATE CV:
${safeCv}
`
          }
        ]
      })
    })
  } catch (error) {
    throw new Error(
      `OpenRouter request failed: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`
    )
  } finally {
    clearTimeout(timeout)
  }

  const raw = await response.text()

  if (!response.ok) {
    throw new Error(
      `OpenRouter API Error ${response.status}: ${raw.slice(0,500)}`
    )
  }

  let parsedApiResponse: any

  try {
    parsedApiResponse = JSON.parse(raw)
  } catch {
    throw new Error(
      `OpenRouter returned invalid JSON: ${raw.slice(0,500)}`
    )
  }

  const content =
    parsedApiResponse?.choices?.[0]?.message?.content

  if (!content) {
    throw new Error("Empty AI response")
  }

  const cleanedJson = extractJson(content)

  if (!cleanedJson.startsWith("{")) {
    throw new Error(
      `AI returned invalid format: ${cleanedJson.slice(0,500)}`
    )
  }

  try {
    const result = JSON.parse(cleanedJson)

    return validateResult(result)

  } catch (error) {
    console.error("RAW AI RESPONSE:", content)

    throw new Error(
      `AI content invalid after cleaning: ${cleanedJson.slice(0,500)}`
    )
  }
}

function sanitizeText(
  text: string,
  maxLength: number
): string {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
}

function extractJson(content: string): string {
  let cleaned = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim()

  const firstBrace = cleaned.indexOf("{")
  const lastBrace = cleaned.lastIndexOf("}")

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    return cleaned.substring(
      firstBrace,
      lastBrace + 1
    )
  }

  return cleaned
}

function validateResult(
  result: any
): GenerationResult {
  return {
    optimizedCv:
      typeof result.optimizedCv === "string"
        ? result.optimizedCv
        : "",

    coverLetter:
      typeof result.coverLetter === "string"
        ? result.coverLetter
        : "",

    summary:
      typeof result.summary === "string"
        ? result.summary
        : "",

    keywords:
      Array.isArray(result.keywords)
        ? result.keywords
        : [],

    atsScore:
      typeof result.atsScore === "number"
        ? result.atsScore
        : 0
  }
}