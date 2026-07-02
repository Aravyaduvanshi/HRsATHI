import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthenticatedUserId } from "@/lib/clerk/helpers";
import { getSignedResumeUrl } from "@/lib/supabase/storage";
import JobTable from "@/components/dashboard/JobTable";
import type { Job } from "@/types/job";
import type { Resume } from "@/types/resume";
import type { ScoreRow } from "@/types/score";
import { getApplyUrl } from "@/lib/utils";
import { rankCandidates } from "@/lib/ranking/rank";

export const metadata: Metadata = { title: "Job Candidates" };

interface PageProps {
    params: Promise<{
        jobId: string;
    }>;
}



export default async function JobCandidatesPage({ params }: PageProps) {
  const { jobId } = await params;
  await rankCandidates(jobId);
  const userId = await getAuthenticatedUserId();
  const supabase = await createServerSupabaseServiceClient();

  // Verify ownership
  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("hr_user_id", userId)
    .single();

  if (!job) notFound();

  
  

const [resumeRes, scoreRes] = await Promise.all([
  supabase
    .from("resumes")
    .select("*")
    .eq("job_id", jobId),

  supabase
    .from("candidate_rankings")
    .select("*")
    .eq("job_id", jobId)
    .order("rank"),
]);

  // Fetch resumes + scores in parallel
  const { data: candidates, error } = await supabase
  .from("candidate_rankings")
  .select("*")
  .eq("job_id", jobId)
  .order("score", { ascending: false });

if (error) {
  console.error(error);
}
  const resumes = (resumeRes.data ?? []) as Resume[];
  const scores = (scoreRes.data ?? []) as ScoreRow[];

  // Attach signed URLs for viewing PDFs
  const resumesWithUrls = await Promise.all(
    resumes.map(async (r) => {
      try {
        const signed_url = await getSignedResumeUrl(r.storage_path);
        return { ...r, signed_url };
      } catch {
        return r;
      }
    })
  );

  const applyUrl = getApplyUrl(jobId);

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{(job as Job).title}</h1>
        <p className="text-sm text-[hsl(220_14%_55%)] mt-1">
          {resumes.length} candidate{resumes.length !== 1 ? "s" : ""} applied
        </p>

        {/* Public apply link */}
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="text-[hsl(220_14%_50%)]">Public apply link:</span>
          <code className="px-2 py-1 rounded bg-[hsl(220_12%_16%)] text-[hsl(222_70%_65%)]">
            {applyUrl}
          </code>
        </div>
      </div>

      {/* Ranked candidates table */}
      <JobTable resumes={resumesWithUrls} scores={scores} />
    </div>
  );
}
