import Groq from "groq-sdk";
import type { ParsedResume } from "@/types/resume";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY! });

/**
 * Groq model for resume parsing.
 * llama-3.3-70b-versatile gives the best JSON accuracy on Groq's free tier.
 * Alternatives: "llama-3.1-8b-instant" (faster/cheaper), "mixtral-8x7b-32768"
 */
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

const PARSE_SYSTEM_PROMPT = `You are an expert HR assistant that extracts structured information from resume text.
Always respond with valid JSON matching the requested schema — no markdown fences, no commentary.`;

const PARSE_USER_PROMPT = (text: string) => `
Extract the following structured data from the resume below.
Return ONLY a JSON object with these exact keys:
{
  "name": string,
  "email": string,
  "phone": string | null,
  "summary": string | null,
  "skills": string[],
  "experience": [{ "company": string, "title": string, "start_date": string | null, "end_date": string | null, "description": string | null }],
  "education": [{ "institution": string, "degree": string, "field": string | null, "graduation_year": string | null }],
  "certifications": string[],
  "languages": string[]
}

Resume text:
---
${text}
---`;

/**
 * Parse raw resume text into structured data using a Groq-hosted LLM.
 * @param rawText - Plain text extracted from the PDF/DOCX
 */
export async function parseResume(rawText: string): Promise<ParsedResume> {
  const completion = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 2048,
    temperature: 0.1, // Low temperature for deterministic JSON output
    messages: [
      { role: "system", content: PARSE_SYSTEM_PROMPT },
      { role: "user", content: PARSE_USER_PROMPT(rawText) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  // Strip any accidental markdown fences the model may add
  const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

  try {
    return JSON.parse(cleaned) as ParsedResume;
  } catch {
    throw new Error(`Failed to parse Groq JSON response: ${cleaned.slice(0, 200)}`);
  }
}
