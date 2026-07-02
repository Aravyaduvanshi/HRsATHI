// ─── Job Types ────────────────────────────────────────────────────────────────

export type JobStatus = "draft" | "active" | "closed";

export interface Job {
  id: string;
  /** Clerk userId of the HR who created the job */
  hr_user_id: string;
  title: string;
  department?: string;
  /** Full job description text — embedded as a pgvector for similarity scoring */
  jd_text: string;
  /** pgvector embedding of jd_text (returned from Supabase as number[]) */
  jd_embedding?: number[];
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

/** Shape used when creating a new job via POST /api/jobs */
export interface CreateJobInput {
  title: string;
  department?: string;
  jd_text: string;
}

/** Shape used when updating a job via PATCH /api/jobs/:id */
export interface UpdateJobInput {
  title?: string;
  department?: string;
  jd_text?: string;
  status?: JobStatus;
}
