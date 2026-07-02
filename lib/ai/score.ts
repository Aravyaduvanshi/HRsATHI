import Groq from "groq-sdk";
import type { ParsedResume } from "@/types/resume";
import type { ScoreResult } from "@/types/score";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY! });
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

const SCORE_SYSTEM_PROMPT = `You are an expert technical recruiter.
Score candidates fairly and consistently. Return only valid JSON — no markdown, no prose.`;

const SCORE_USER_PROMPT = (
  jdText: string,
  resume: ParsedResume
) => `Score this candidate against the job description below.

Return a JSON object with EXACTLY this shape:
{
  "overall_score": number (0–100),
  "summary": "2-3 sentence summary of fit",
  "criteria": [
    { "name": "Skills Match",        "score": number, "rationale": string },
    { "name": "Experience Relevance","score": number, "rationale": string },
    { "name": "Education Fit",       "score": number, "rationale": string },
    { "name": "Cultural Signals",    "score": number, "rationale": string }
  ]
}

Overall score = weighted average: Skills 40%, Experience 35%, Education 15%, Cultural 10%.

JOB DESCRIPTION:
---
${jdText}
---

CANDIDATE:
${JSON.stringify(resume, null, 2)}`;

/**
 * Score a parsed resume against a job description using a Groq-hosted LLM.
 *
 * @param resumeId - UUID of the resume row (attached to the result for storage)
 * @param jobId    - UUID of the job row
 * @param jdText   - Full job description text
 * @param parsed   - Structured resume data from parseResume()
 */
export async function scoreResume(
  resumeId: string,
  jobId: string,
  jdText: string,
  parsed: ParsedResume
): Promise<ScoreResult> {
  const completion = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    temperature: 0.1,
    messages: [
      { role: "system", content: SCORE_SYSTEM_PROMPT },
      { role: "user", content: SCORE_USER_PROMPT(jdText, parsed) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  // Strip any accidental markdown fences open-source LLMs may add
  const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

  let parsedScore: Omit<ScoreResult, "resume_id" | "job_id" | "created_at">;
  try {
    parsedScore = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse Groq score JSON: ${cleaned.slice(0, 200)}`);
  }

  return {
    resume_id: resumeId,
    job_id: jobId,
    created_at: new Date().toISOString(),
    ...parsedScore,
  };
}
