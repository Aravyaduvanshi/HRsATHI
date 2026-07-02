"use client";

import type { ParsedResume } from "@/types/resume";
import type { ScoreRow } from "@/types/score";
import ScoreBadge from "@/components/dashboard/ScoreBadge";
import SkillTag from "./SkillTag";
import { formatDate } from "@/lib/utils";

interface ResumeCardProps {
  parsed: ParsedResume;
  score: ScoreRow;
  signedUrl?: string;
}

export default function ResumeCard({ parsed, score, signedUrl }: ResumeCardProps) {
  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-lg">{parsed.name}</h3>
          <p className="text-sm text-[hsl(220_14%_50%)]">{parsed.email}</p>
          {parsed.phone && (
            <p className="text-sm text-[hsl(220_14%_50%)]">{parsed.phone}</p>
          )}
        </div>
        <ScoreBadge score={score.overall_score} />
      </div>

      {/* Summary */}
      {score.summary && (
        <p className="text-sm text-[hsl(220_14%_65%)] leading-relaxed">{score.summary}</p>
      )}

      {/* Skills */}
      {parsed.skills.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[hsl(220_14%_45%)] mb-2 uppercase tracking-wide">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {parsed.skills.map((skill) => (
              <SkillTag key={skill} label={skill} />
            ))}
          </div>
        </div>
      )}

      {/* Criteria breakdown */}
      <div>
        <p className="text-xs font-medium text-[hsl(220_14%_45%)] mb-2 uppercase tracking-wide">
          Score Breakdown
        </p>
        <div className="flex flex-col gap-2">
          {score.criteria.map((c) => (
            <div key={c.name}>
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="text-[hsl(220_14%_60%)]">{c.name}</span>
                <span className="font-medium text-white">{c.score}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[hsl(220_12%_18%)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[hsl(222_70%_50%)] transition-all duration-500"
                  style={{ width: `${c.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <time className="text-xs text-[hsl(220_14%_40%)]">{formatDate(score.created_at)}</time>
        {signedUrl && (
          <a
            href={signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-[hsl(222_70%_60%)] hover:underline"
          >
            View Resume ↗
          </a>
        )}
      </div>
    </div>
  );
}
