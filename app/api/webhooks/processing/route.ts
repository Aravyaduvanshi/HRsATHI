import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateWebhookSecret } from "@/lib/utils";
import type { ScoreResult } from "@/types/score";

const WebhookPayloadSchema = z.object({
  event: z.enum(["resume.scored", "resume.failed"]),
  resumeId: z.string().uuid(),
  jobId: z.string().uuid(),
  /** Present when event = "resume.scored" */
  scoreResult: z
    .object({
      overall_score: z.number(),
      summary: z.string(),
      criteria: z.array(
        z.object({ name: z.string(), score: z.number(), rationale: z.string() })
      ),
      vector_similarity: z.number().optional(),
    })
    .optional(),
  /** Present when event = "resume.failed" */
  errorMessage: z.string().optional(),
  parsedResume: z.unknown().optional(),
});

/**
 * POST /api/webhooks/processing
 *
 * Called by the BullMQ worker after it finishes processing a resume.
 * Protected by a shared secret (WORKER_WEBHOOK_SECRET).
 *
 * On success: persists ScoreResult, updates resume status to "scored".
 * On failure: updates resume status to "failed" with error message.
 */
export async function POST(req: NextRequest) {
  // Authenticate the webhook call
  const authHeader = req.headers.get("authorization");
  if (!validateWebhookSecret(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = WebhookPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const supabase = createServiceRoleClient();
  const { event, resumeId, jobId, scoreResult, errorMessage, parsedResume } =
    parsed.data;

  if (event === "resume.scored" && scoreResult) {
    // Persist the score
    const scoreRow: Omit<ScoreResult, "created_at"> & { created_at: string } = {
      resume_id: resumeId,
      job_id: jobId,
      overall_score: scoreResult.overall_score,
      summary: scoreResult.summary,
      criteria: scoreResult.criteria,
      vector_similarity: scoreResult.vector_similarity,
      created_at: new Date().toISOString(),
    };

    await supabase.from("score_results").upsert(scoreRow, {
      onConflict: "resume_id",
    });

    // Persist parsed resume JSON
    await supabase
      .from("resumes")
      .update({
        status: "scored",
        parsed_data: parsedResume ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resumeId);
  }

  if (event === "resume.failed") {
    await supabase
      .from("resumes")
      .update({
        status: "failed",
        error_message: errorMessage ?? "Unknown error",
        updated_at: new Date().toISOString(),
      })
      .eq("id", resumeId);
  }

  return NextResponse.json({ received: true });
}
