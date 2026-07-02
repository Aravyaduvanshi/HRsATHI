"use client";

import useSWR from "swr";
import type { ResumeStatus } from "@/types/resume";

interface ResumeStatusResponse {
  status: ResumeStatus;
  score?: number;
  error?: string;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch resume status");
    return res.json() as Promise<ResumeStatusResponse>;
  });

/**
 * Poll the processing status of a single resume.
 * Used in the candidate's SubmitSuccess screen to show progress.
 * Stops polling once status reaches a terminal state (scored | failed).
 */
export function useResumeStatus(resumeId: string | null) {
  const isTerminal = (status?: ResumeStatus) =>
    status === "scored" || status === "failed";

  const { data, error, isLoading } = useSWR<ResumeStatusResponse>(
    resumeId ? `/api/resumes/${resumeId}/status` : null,
    fetcher,
    {
      refreshInterval: (data) =>
        isTerminal(data?.status) ? 0 : 3000, // Poll every 3s until terminal
      revalidateOnFocus: false,
    }
  );

  return {
    status: data?.status,
    score: data?.score,
    isLoading,
    isTerminal: isTerminal(data?.status),
    error,
  };
}
