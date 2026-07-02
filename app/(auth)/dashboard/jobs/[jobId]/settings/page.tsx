import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAuthenticatedUserId } from "@/lib/clerk/helpers";
import type { Job } from "@/types/job";

export const metadata: Metadata = { title: "Job Settings" };

interface PageProps {
  params: { jobId: string };
}

export default async function JobSettingsPage({ params }: PageProps) {
  const userId = await getAuthenticatedUserId();
  const supabase = await createServerSupabaseClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", params.jobId)
    .eq("hr_user_id", userId)
    .single();

  if (!job) notFound();

  const typedJob = job as Job;

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold text-white mb-6">Job Settings</h1>

      {/* TODO: Wire to PATCH /api/jobs/[jobId] with a form action */}
      <form className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium text-[hsl(220_14%_70%)]">
            Job Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={typedJob.title}
            className="px-3 py-2 rounded-lg bg-[hsl(220_12%_14%)] border border-[hsl(220_12%_22%)]
                       text-white placeholder:text-[hsl(220_14%_40%)] focus:outline-none
                       focus:border-[hsl(222_70%_50%)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="jd_text" className="text-sm font-medium text-[hsl(220_14%_70%)]">
            Job Description
          </label>
          <textarea
            id="jd_text"
            name="jd_text"
            rows={12}
            defaultValue={typedJob.jd_text}
            className="px-3 py-2 rounded-lg bg-[hsl(220_12%_14%)] border border-[hsl(220_12%_22%)]
                       text-white placeholder:text-[hsl(220_14%_40%)] focus:outline-none
                       focus:border-[hsl(222_70%_50%)] transition-colors resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-[hsl(222_70%_50%)] text-white font-medium
                       text-sm hover:bg-[hsl(222_74%_42%)] transition-colors"
          >
            Save Changes
          </button>
          <button
            type="button"
            className="px-5 py-2 rounded-lg border border-[hsl(0_78%_55%/0.5)] text-[hsl(0_78%_65%)]
                       font-medium text-sm hover:bg-[hsl(0_78%_55%/0.1)] transition-colors"
          >
            Close Job
          </button>
        </div>
      </form>
    </div>
  );
}
