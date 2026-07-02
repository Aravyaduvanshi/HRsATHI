import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAuthenticatedUserId } from "@/lib/clerk/helpers";
import { rankCandidates } from "@/lib/ranking/rank";

const CreateJobSchema = z.object({
  title: z.string().min(2).max(120),
  department: z.string().max(80).optional(),
  jd_text: z.string().min(10),
});



export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("jobs")
      .select("id, title, department, status, created_at")
      .eq("hr_user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      jobs: data,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Failed to fetch jobs",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("api route started ");

    const userId = await getAuthenticatedUserId();

    const supabase = await createServerSupabaseClient();

    const body = await req.json();

    const parsed = CreateJobSchema.parse(body);

    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        hr_user_id: userId,
        title: parsed.title,
        department: parsed.department ?? null,
        jd_text: parsed.jd_text,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    // Automatically rank candidates
    await rankCandidates(job.id);

    return NextResponse.json(
      {
        job,
      },
      {
        status: 201,
      }
    );
  } catch (err) {
    console.error(err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: err.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create job",
      },
      {
        status: 500,
      }
    );
  }
}