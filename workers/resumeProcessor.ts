import { Worker } from "bullmq";
import { createRedisConnection, RESUME_QUEUE_NAME } from "@/lib/queue/client";
import { downloadResumeFile } from "@/lib/supabase/storage";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { parseResume } from "@/lib/ai/parse";
import { scoreResume } from "@/lib/ai/score";
import { embedText } from "@/lib/ai/embed";
import type { ResumeProcessingJobData } from "@/types/score";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const WEBHOOK_SECRET = process.env.WORKER_WEBHOOK_SECRET!;

/**
 * BullMQ Worker — runs as a standalone Node process outside Next.js.
 *
 * Pipeline for each resume:
 * 1. Mark status → "processing"
 * 2. Download raw file from Supabase Storage
 * 3. Extract plain text (PDF/DOCX → string)
 * 4. Claude: parse structured resume JSON
 * 5. Voyage AI: embed resume text
 * 6. Fetch JD text from Supabase
 * 7. Claude: score resume against JD
 * 8. pgvector: compute cosine similarity
 * 9. POST result to Next.js webhook → which persists to DB
 */
export const resumeWorker = new Worker<ResumeProcessingJobData>(
  RESUME_QUEUE_NAME,
  async (job) => {
    const { resumeId, jobId, storagePath } = job.data;
    const supabase = createServiceRoleClient();

    // ── Step 1: Mark processing ───────────────────────────────────────────────
    await supabase
      .from("resumes")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", resumeId);

    await job.updateProgress(10);

    // ── Step 2: Download file ─────────────────────────────────────────────────
    const fileBuffer = await downloadResumeFile(storagePath);
    await job.updateProgress(20);

    // ── Step 3: Extract text (basic — replace with pdfjs/mammoth in production) ──
    const rawText = fileBuffer.toString("utf-8");
    await job.updateProgress(30);

    // ── Step 4: Parse with Claude ─────────────────────────────────────────────
    const parsedResume = await parseResume(rawText);
    await supabase
      .from("resumes")
      .update({ status: "parsed", updated_at: new Date().toISOString() })
      .eq("id", resumeId);

    await job.updateProgress(55);

    // ── Step 5: Embed resume ──────────────────────────────────────────────────
    const resumeText = [
      parsedResume.summary,
      parsedResume.skills.join(", "),
      parsedResume.experience.map((e) => `${e.title} at ${e.company}`).join(". "),
    ]
      .filter(Boolean)
      .join("\n");

    const resumeEmbedding = await embedText(resumeText, "document");
    await job.updateProgress(70);

    // ── Step 6: Fetch JD + its embedding ─────────────────────────────────────
    const { data: jobRow } = await supabase
      .from("jobs")
      .select("jd_text, jd_embedding")
      .eq("id", jobId)
      .single();

    if (!jobRow) throw new Error(`Job ${jobId} not found`);

    // ── Step 7: Score with Claude ─────────────────────────────────────────────
    const scoreResult = await scoreResume(resumeId, jobId, jobRow.jd_text, parsedResume);
    await job.updateProgress(88);

    // ── Step 8: Cosine similarity (pgvector in Supabase) ─────────────────────
    if (jobRow.jd_embedding) {
      const { data: simResult } = await supabase.rpc("cosine_similarity", {
        vec_a: `[${resumeEmbedding.join(",")}]`,
        vec_b: jobRow.jd_embedding,
      });
      if (simResult !== null) {
        scoreResult.vector_similarity = simResult as number;
      }
    }

    // ── Step 9: Notify Next.js webhook ────────────────────────────────────────
    const webhookRes = await fetch(`${APP_URL}/api/webhooks/processing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WEBHOOK_SECRET}`,
      },
      body: JSON.stringify({
        event: "resume.scored",
        resumeId,
        jobId,
        scoreResult,
        parsedResume,
      }),
    });

    if (!webhookRes.ok) {
      throw new Error(`Webhook call failed: ${webhookRes.status}`);
    }

    await job.updateProgress(100);
    return { resumeId, score: scoreResult.overall_score };
  },
  {
    connection: createRedisConnection(),
    concurrency: 3,       // Process 3 resumes in parallel
    limiter: {
      max: 10,
      duration: 60_000,   // Max 10 LLM calls per minute
    },
  }
);

// ── Error / completion handlers ────────────────────────────────────────────────

resumeWorker.on("completed", (job, result) => {
  console.log(`[worker] ✅ resume ${result.resumeId} scored: ${result.score}/100`);
});

resumeWorker.on("failed", async (job, err) => {
  if (!job) return;
  console.error(`[worker] ❌ resume ${job.data.resumeId} failed:`, err.message);

  // Notify webhook of failure
  try {
    await fetch(`${APP_URL}/api/webhooks/processing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WEBHOOK_SECRET}`,
      },
      body: JSON.stringify({
        event: "resume.failed",
        resumeId: job.data.resumeId,
        jobId: job.data.jobId,
        errorMessage: err.message,
      }),
    });
  } catch {
    // Best-effort — status already in DB from failed BullMQ attempt
  }
});
