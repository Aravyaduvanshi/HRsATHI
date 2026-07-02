// ─── Resume Types ─────────────────────────────────────────────────────────────

export type ResumeStatus =
  | "uploaded"      // raw file saved to Supabase Storage
  | "processing"    // BullMQ worker picked it up
  | "parsed"        // Claude extracted structured data
  | "scored"        // scored against the JD
  | "failed";       // unrecoverable error

export interface Resume {
  id: string;
  job_id: string;
  /** Candidate name — collected on the upload form */
  candidate_name: string;
  candidate_email: string;
  /** Supabase Storage path, e.g. resumes/<jobId>/<resumeId>.pdf */
  storage_path: string;
  /** Signed URL valid for the dashboard session (not persisted) */
  signed_url?: string;
  status: ResumeStatus;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

/** Structured data Claude extracts from the raw resume text */
export interface ParsedResume {
  name: string;
  email: string;
  phone?: string;
  summary?: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  certifications?: string[];
  languages?: string[];
}

export interface WorkExperience {
  company: string;
  title: string;
  start_date?: string;
  end_date?: string | "Present";
  description?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  graduation_year?: string;
}
