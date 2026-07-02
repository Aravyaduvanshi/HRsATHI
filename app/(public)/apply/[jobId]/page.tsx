import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server";
import UploadForm from "@/components/upload/UploadForm";
import type { Job } from "@/types/job";

interface PageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { jobId } = await params;
  // Use service role so RLS doesn't block public access to job title
  const supabase = await createServerSupabaseServiceClient();
  const { data: job, error } = await supabase
  .from("jobs")
  .select("id, title, department, jd_text, status")
  .eq("id", jobId)
  .single();

console.log("jobId:", jobId);
console.log("job:", job);
console.log("error:", error);

if (!job) {
  notFound();
}

  return {
    title: job ? `Apply — ${job.title}` : "Apply",
    description: job
      ? `Submit your resume for the ${job.title} position.`
      : "Submit your resume.",
  };
}

export default async function ApplyPage({ params }: PageProps) {
  const { jobId } = await params;
  const supabase = await createServerSupabaseServiceClient();

  // Only expose active jobs to candidates
  const {
  data: job,
  error,
} = await supabase
  .from("jobs")
  .select("*")
  .eq("id", jobId)
  .eq("status", "active")
  .single();

console.log("Job ID:", jobId);
console.log("Job:", job);
console.log("Error:", error);

  if (error) {
  return (
    <pre style={{ color: "white" }}>
      {JSON.stringify(error, null, 2)}
    </pre>
  );
}

if (!job) {
  return <h1 style={{ color: "white" }}>Job not found</h1>;
}

  const typedJob = job as Pick<Job, "id" | "title" | "department" | "jd_text" | "status">;

  return (
    <div className="w-full max-w-lg animate-fade-up">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">{typedJob.title}</h1>
        {typedJob.department && (
          <p className="text-sm text-[hsl(220_14%_55%)] mt-1">{typedJob.department}</p>
        )}
      </div>

      <UploadForm jobId={typedJob.id} jobTitle={typedJob.title} />
    </div>
  );
}
