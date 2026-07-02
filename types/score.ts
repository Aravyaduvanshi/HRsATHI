// ─── Score Types ──────────────────────────────────────────────────────────────

/** Individual scoring dimension */
export interface Criterion {
  name: string;
  /** 0–100 */
  score: number;
  /** Brief rationale for the score */
  rationale: string;
}

/** Full scoring result produced by Claude and persisted to Supabase */
export interface ScoreResult {
  resume_id: string;
  job_id: string;
  /** Overall composite score 0–100 */
  overall_score: number;
  /** Breakdown by dimension (skills, experience, education, etc.) */
  criteria: Criterion[];
  /** 2-3 sentence summary Claude produces */
  summary: string;
  /** Vector similarity score from pgvector cosine search (0–1) */
  vector_similarity?: number;
  created_at: string;
}

/** Shape stored in the score_results Supabase table */
export interface ScoreRow extends ScoreResult {
  id: string;
}

/** BullMQ job payload */
export interface ResumeProcessingJobData {
  resumeId: string;
  jobId: string;
  storagePath: string;
}
