// lib/ranking/rank.ts

import { loadCandidates } from "./parser";
import { scoreCandidate } from "./scorer";


import { createServerSupabaseServiceClient } from "@/lib/supabase/server";

export async function rankCandidates(jobId: string) {
    console.log("===== RANKING STARTED =====");
  console.log("🚀 rankCandidates started", jobId);
  const supabase = await createServerSupabaseServiceClient();
  await supabase
  .from("candidate_rankings")
  .delete()
  .eq("job_id", jobId);

  // Fetch Job
  const { data: job, error } = await supabase
    .from("jobs")
    .select("jd_text")
    .eq("id", jobId)
    .single();

  if (error || !job) {
    throw new Error("Job not found");
  }

  const jd = job.jd_text;

  // Read candidates
  

  
  

  const candidates = loadCandidates();
  console.log("Candidates loaded:", candidates.length);

  
  const rankings: any[] = [];

for (const candidate of candidates) {
  const result = scoreCandidate(candidate, jd);

  rankings.push({
    candidate_id: candidate.candidate_id,
    score: result.score,
    reason: result.reason,
    profile: candidate.profile,
  });
}

rankings.sort((a, b) => b.score - a.score);

const top100 = rankings.slice(0, 100);
console.log("Top100:", top100.length);

await supabase
  .from("candidate_rankings")
  .delete()
  .eq("job_id", jobId);

const rows = top100.map((c, index) => ({
  job_id: jobId,
  candidate_id: c.candidate_id,
  score: c.score,
  rank: index + 1,
  reason: c.reason,
  profile: c.profile,
}));
console.log("Inserting rows:", rows.length);
const { error: insertError } = await supabase
  .from("candidate_rankings")
  .insert(rows);

if (insertError) {
    console.log("Insert error:", insertError);
  console.error(insertError);
  throw insertError;
}
console.log("Insert successful");

return top100;
}console.log("Ranking finished");