import JobCard from "@/components/dashboard/JobCard";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server";
import JobTable from "@/components/dashboard/JobTable";
import CreateJobModal from "@/components/dashboard/CreateJobModal";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = await createServerSupabaseServiceClient();

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, department, status, created_at")
    .eq("hr_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) console.error("Failed to fetch jobs:", error.message);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Jobs</h1>
          <p className="text-sm text-gray-400">{jobs?.length ?? 0} active postings</p>
        </div>
        <CreateJobModal />
      </div>
      <div className="grid gap-4 mt-6">
  {jobs?.map((job) => (
    <JobCard key={job.id} job={job} />
  ))}
</div>
    </div>
  );
}