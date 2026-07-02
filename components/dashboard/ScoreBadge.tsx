"use client";

import { clampScore, scoreColour } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md";
}

const COLOUR_CLASSES = {
  high: "bg-[hsl(142_72%_50%/0.15)] text-[hsl(142_72%_55%)] ring-1 ring-[hsl(142_72%_50%/0.3)]",
  mid:  "bg-[hsl(38_92%_54%/0.15)]  text-[hsl(38_92%_59%)]  ring-1 ring-[hsl(38_92%_54%/0.3)]",
  low:  "bg-[hsl(0_78%_55%/0.15)]   text-[hsl(0_78%_60%)]   ring-1 ring-[hsl(0_78%_55%/0.3)]",
};

export default function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const clamped = clampScore(score);
  const colour = scoreColour(clamped);

  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded-lg tabular-nums
        ${COLOUR_CLASSES[colour]}
        ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}
      title={`AI Score: ${clamped}/100`}
    >
      {clamped}
    </span>
  );
}
