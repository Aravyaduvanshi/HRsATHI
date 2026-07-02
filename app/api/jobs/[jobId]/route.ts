import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAuthenticatedUserId } from "@/lib/clerk/helpers";
import { embedText } from "@/lib/ai/embed";

const UpdateJobSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  department: z.string().max(80).optional(),
  jd_text: z.string().min(100).optional(),
  status: z.enum(["draft", "active", "closed"]).optional(),
});

interface RouteContext {
  params: { jobId: string };
}

/** GET /api/jobs/[jobId] — fetch a single job (must be owner) */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const userId = await getAuthenticatedUserId();
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", params.jobId)
      .eq("hr_user_id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ job: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** PATCH /api/jobs/[jobId] — update job fields, re-embed JD if changed */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const userId = getAuthenticatedUserId();
    const body = await req.json();
    const parsed = UpdateJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const updates: Record<string, unknown> = { ...parsed.data };

    // Re-embed JD if the text changed
    if (parsed.data.jd_text) {
      const embedding = await embedText(parsed.data.jd_text, "document");
      updates.jd_embedding = `[${embedding.join(",")}]`;
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("jobs")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", params.jobId)
      .eq("hr_user_id", userId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Job not found or unauthorised" },
        { status: 404 }
      );
    }
    return NextResponse.json({ job: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE /api/jobs/[jobId] — soft-delete by closing the job */
export async function DELETE(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const userId = await getAuthenticatedUserId();
    const supabase = await createServerSupabaseClient();

    await supabase
      .from("candidate_rankings")
      .delete()
      .eq("job_id", params.jobId);

    await supabase
      .from("resumes")
      .delete()
      .eq("job_id", params.jobId);

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", params.jobId)
      .eq("hr_user_id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
