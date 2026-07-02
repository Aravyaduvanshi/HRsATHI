import { createResumeQueue } from "./client";
import type { ResumeProcessingJobData } from "@/types/score";

/**
 * Enqueue a resume for async processing.
 * Called from POST /api/resumes after the file is saved to Storage.
 *
 * @returns BullMQ Job ID (stored on the resume row for status polling)
 */
export async function enqueueResumeProcessing(
  data: ResumeProcessingJobData
): Promise<string> {
  const queue = createResumeQueue();

  const job = await queue.add(
    "process-resume",
    data,
    {
      jobId: `resume:${data.resumeId}`, // Idempotent — prevents duplicate jobs
    }
  );

  await queue.close();
  return job.id!;
}

/**
 * Check the current BullMQ job state for a resume.
 * Useful for the status polling API route.
 */
export async function getResumeJobState(resumeId: string) {
  const queue = createResumeQueue();
  const job = await queue.getJob(`resume:${resumeId}`);

  if (!job) {
    await queue.close();
    return null;
  }

  const state = await job.getState();
  await queue.close();
  return { state, progress: job.progress, failedReason: job.failedReason };
}
