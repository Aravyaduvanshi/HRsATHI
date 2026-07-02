import fs from "fs";
import path from "path";

export interface Candidate {
  candidate_id: string;

  profile: {
    anonymized_name: string;
    headline: string;
    summary: string;
    years_of_experience: number;
    current_title: string;
    current_company: string;
  };

  skills: {
    name: string;
    proficiency: string;
    endorsements: number;
  }[];

  education: any[];

  career_history: any[];

  redrob_signals: any;
}

export function loadCandidates(): Candidate[] {
  const filePath = path.join(
    process.cwd(),
    "data",
    "candidates.jsonl"
  );

  const content = fs.readFileSync(filePath, "utf8");

  return content
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
}