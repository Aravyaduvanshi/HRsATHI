import { Candidate } from "./parser";

interface ScoreResult {
  score: number;
  reason: string;
}

export function scoreCandidate(
  candidate: Candidate,
  jd: string
): ScoreResult {

  const jdLower = jd.toLowerCase();

  let score = 0;

  const matchedSkills: string[] = [];

  //-------------------------------------------------------
  // Skills (40)
  //-------------------------------------------------------

  for (const skill of candidate.skills) {

    if (jdLower.includes(skill.name.toLowerCase())) {

      score += 8;

      matchedSkills.push(skill.name);

    }

  }

  score = Math.min(score,40);

  //-------------------------------------------------------
  // Experience (25)
  //-------------------------------------------------------

  const years =
    candidate.profile.years_of_experience;

  score += Math.min(years * 2.5,25);

  //-------------------------------------------------------
  // Education (10)
  //-------------------------------------------------------

  if(candidate.education.length>0){

      score +=10;

  }

  //-------------------------------------------------------
  // Redrob Signals (25)
  //-------------------------------------------------------

  const signals =
    candidate.redrob_signals;

  if(signals.open_to_work_flag)
      score +=5;

  score +=
    Math.min(
      signals.profile_completeness_score/20,
      5
    );

  score +=
    Math.min(
      signals.recruiter_response_rate*5,
      5
    );

  score +=
    Math.min(
      signals.interview_completion_rate*5,
      5
    );

  score +=
    Math.min(
      signals.github_activity_score/20,
      5
    );

  //-------------------------------------------------------

  score=Math.round(score);

  return {
    score,

    matchedSkills: matched,

    missingSkills,

    yearsExperience,

    education,

    summary,

    reason
}

}