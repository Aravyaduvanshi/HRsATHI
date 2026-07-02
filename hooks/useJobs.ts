"use client";

import useSWR from "swr";
import type { Job } from "@/types/job";

interface JobsResponse {
  jobs: Job[];
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch jobs");
    return res.json() as Promise<JobsResponse>;
  });

/**
 * Client-side hook to fetch the authenticated HR user's jobs.
 * Used in Client Components that need live-updating job lists.
 * Prefer the Server Component approach (direct Supabase query) where possible.
 */
export function useJobs() {
  const { data, error, isLoading, mutate } = useSWR<JobsResponse>(
    "/api/jobs",
    fetcher,
    { refreshInterval: 0 } // Manual revalidation only
  );

  return {
    jobs: data?.jobs ?? [],
    isLoading,
    error,
    /** Call after creating/updating a job to refresh the list */
    refresh: () => mutate(),
  };
}
