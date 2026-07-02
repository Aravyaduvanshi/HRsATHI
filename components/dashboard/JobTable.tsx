"use client";

import { useMemo } from "react";
import type { Resume } from "@/types/resume";
import type { ScoreRow } from "@/types/score";
import ScoreBadge from "./ScoreBadge";
import { formatDate, truncate } from "@/lib/utils";

interface JobTableProps {
  resumes: Resume[];
  scores: ScoreRow[];
}

export default function JobTable({ resumes, scores }: JobTableProps) {
  // Build a lookup map: resumeId → ScoreRow
  const scoreMap = useMemo(() => {
    const map = new Map<string, ScoreRow>();
    (scores ?? []).forEach((s) => map.set(s.resume_id, s));
    return map;
  }, [scores]);

  // Sort by score descending, unscored at the bottom
  const sorted = useMemo(() => {
  if (!Array.isArray(resumes)) {
    console.log("resumes is:", resumes);
    return [];
  }

  return [...resumes].sort((a, b) => {
    const sa = scoreMap.get(a.id)?.overall_score ?? -1;
    const sb = scoreMap.get(b.id)?.overall_score ?? -1;
    return sb - sa;
  });
}, [resumes, scoreMap]);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-20 text-[hsl(220_14%_40%)]">
        <p className="text-lg font-medium">No candidates yet</p>
        <p className="text-sm mt-1">Share the apply link to start receiving resumes.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[hsl(220_12%_18%)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[hsl(220_12%_18%)] bg-[hsl(220_12%_10%)]">
            <th className="px-4 py-3 text-left font-medium text-[hsl(220_14%_55%)]">#</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(220_14%_55%)]">Candidate</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(220_14%_55%)]">Score</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(220_14%_55%)] hidden md:table-cell">
              Summary
            </th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(220_14%_55%)]">Status</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(220_14%_55%)]">Applied</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(220_14%_55%)]">Resume</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((resume, idx) => {
            const score = scoreMap.get(resume.id);
            return (
              <tr
                key={resume.id}
                className="border-b border-[hsl(220_12%_14%)] hover:bg-[hsl(220_12%_11%)] transition-colors"
              >
                <td className="px-4 py-3 text-[hsl(220_14%_40%)]">{idx + 1}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{resume.candidate_name}</p>
                  <p className="text-xs text-[hsl(220_14%_50%)]">{resume.candidate_email}</p>
                </td>
                <td className="px-4 py-3">
                  {score ? (
                    <ScoreBadge score={score.overall_score} />
                  ) : (
                    <span className="text-xs text-[hsl(220_14%_40%)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell max-w-xs">
                  <p className="text-[hsl(220_14%_60%)] text-xs leading-relaxed">
                    {score ? truncate(score.summary, 100) : "Processing…"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={resume.status} />
                </td>
                <td className="px-4 py-3 text-xs text-[hsl(220_14%_50%)]">
                  {formatDate(resume.created_at)}
                </td>
                <td className="px-4 py-3">
                  {resume.signed_url ? (
                    <a
                      href={resume.signed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[hsl(222_70%_60%)] hover:underline"
                    >
                      View PDF
                    </a>
                  ) : (
                    <span className="text-xs text-[hsl(220_14%_40%)]">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }: { status: Resume["status"] }) {
  const styles: Record<Resume["status"], string> = {
    uploaded:   "bg-[hsl(220_12%_22%)] text-[hsl(220_14%_60%)]",
    processing: "bg-[hsl(38_92%_54%/0.15)] text-[hsl(38_92%_64%)]",
    parsed:     "bg-[hsl(222_70%_50%/0.15)] text-[hsl(222_70%_65%)]",
    scored:     "bg-[hsl(142_72%_50%/0.15)] text-[hsl(142_72%_60%)]",
    failed:     "bg-[hsl(0_78%_55%/0.15)] text-[hsl(0_78%_65%)]",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
