import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { uploadResumeFile } from "@/lib/supabase/storage";
import { enqueueResumeProcessing } from "@/lib/queue/jobs";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_MIME_TYPES = ["application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const MetaSchema = z.object({
  candidate_name: z.string().min(1).max(120),
  candidate_email: z.string().email(),
  job_id: z.string().uuid(),
});

/**
 * POST /api/resumes
 * Public endpoint — no Clerk auth required.
 * Accepts multipart/form-data: { resume: File, candidate_name, candidate_email, job_id }
 *
 * Flow:
 * 1. Validate metadata and file
 * 2. Verify job is active
 * 3. Upload file to Supabase Storage
 * 4. Insert resume row with status "uploaded"
 * 5. Enqueue BullMQ job → return 202
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const meta = MetaSchema.safeParse({
      candidate_name: formData.get("candidate_name"),
      candidate_email: formData.get("candidate_email"),
      job_id: formData.get("job_id"),
    });

    // Validate metadata
    if (!meta.success) {
      return NextResponse.json(
        { error: "Missing or invalid fields", details: meta.error.flatten() },
        { status: 422 }
      );
    }

    // Validate file
    if (!file) {
      return NextResponse.json({ error: "No resume file provided" }, { status: 422 });
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF and Word documents are accepted" },
        { status: 415 }
      );
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File must be under ${MAX_FILE_SIZE_MB}MB` },
        { status: 413 }
      );
    }

    const supabase = createServiceRoleClient();

    // Verify job is still active
    const { data: job } = await supabase
      .from("jobs")
      .select("id, status")
      .eq("id", meta.data.job_id)
      .eq("status", "active")
      .single();

    if (!job) {
      return NextResponse.json(
        { error: "This job posting is no longer accepting applications" },
        { status: 410 }
      );
    }

    const resumeId = randomUUID();
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage
    const storagePath = await uploadResumeFile(
      meta.data.job_id,
      resumeId,
      fileBuffer,
      file.type
    );

    // Insert resume row
    const { error: insertError } = await supabase.from("resumes").insert({
      id: resumeId,
      job_id: meta.data.job_id,
      candidate_name: meta.data.candidate_name,
      candidate_email: meta.data.candidate_email,
      storage_path: storagePath,
      status: "uploaded",
    });

    if (insertError) throw insertError;

    // Enqueue async processing
    await enqueueResumeProcessing({
      resumeId,
      jobId: meta.data.job_id,
      storagePath,
    });

    return NextResponse.json({ resumeId, status: "uploaded" }, { status: 202 });
  } catch (err) {
    console.error("[POST /api/resumes]", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
