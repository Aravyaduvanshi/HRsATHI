"use client";

import Link from "next/link";
import type { Job } from "@/types/job";
import { formatDate, getApplyUrl } from "@/lib/utils";

interface JobCardProps {
  job: Job;
}

const STATUS_STYLES: Record<Job["status"], string> = {
  active: "bg-[hsl(142_72%_50%/0.15)] text-[hsl(142_72%_60%)]",
  draft:  "bg-[hsl(220_12%_22%)] text-[hsl(220_14%_55%)]",
  closed: "bg-[hsl(0_78%_55%/0.15)] text-[hsl(0_78%_65%)]",
};

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link
      href={`/dashboard/jobs/${job.id}`}
      className="group block p-5 rounded-xl glass hover:border-[hsl(222_70%_50%/0.4)]
                 hover:glow-brand transition-all duration-200 animate-fade-up"
    >
      {/* Status badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[job.status]}`}
        >
          {job.status}
        </span>
        <time className="text-xs text-[hsl(220_14%_45%)]">{formatDate(job.created_at)}</time>
      </div>

      <h2 className="font-semibold text-white group-hover:text-[hsl(222_70%_65%)] transition-colors leading-snug">
        {job.title}
      </h2>
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">

    <div>
        <p className="text-gray-400">Candidates</p>
        <p className="font-semibold">0</p>
    </div>

    <div>
        <p className="text-gray-400">Average Score</p>
        <p className="font-semibold">--</p>
    </div>

    <div>
        <p className="text-gray-400">Created</p>
        <p className="font-semibold">
            {formatDate(job.created_at)}
        </p>
    </div>

</div>
      <div className="mt-5 flex gap-2">

<button
className="rounded-lg bg-blue-600 px-4 py-2 text-sm"
onClick={(e)=>{
    e.preventDefault();
    window.location.href=`/dashboard/jobs/${job.id}`;
}}
>
View Candidates
</button>

<button
className="rounded-lg border px-4 py-2 text-sm"
>
Edit
</button>

<button
  className="rounded-lg border border-red-500 text-red-400 px-4 py-2 text-sm"
  onClick={async (e) => {
    e.preventDefault();

    if (!confirm("Delete this job?")) return;

    await fetch(`/api/jobs/${job.id}`, {
      method: "DELETE",
    });

    window.location.reload();
  }}
>
  Delete
</button>
</div>

      {/* Apply link preview */}
      <div className="mt-4 flex items-center justify-between">
    <span className="text-xs text-[hsl(220,14%,45%)] truncate">
        {getApplyUrl(job.id)}
    </span>

    <button
        onClick={(e) => {
            e.preventDefault();
            navigator.clipboard.writeText(getApplyUrl(job.id));
        }}
        className="rounded-md border px-3 py-1 text-xs hover:bg-white/5"
    >
        Copy Link
    </button>
</div>
    </Link>
  );
}
