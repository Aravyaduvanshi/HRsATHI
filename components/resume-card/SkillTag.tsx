"use client";

interface SkillTagProps {
  label: string;
}

export default function SkillTag({ label }: SkillTagProps) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                 bg-[hsl(222_70%_50%/0.12)] text-[hsl(222_70%_65%)]
                 ring-1 ring-[hsl(222_70%_50%/0.25)] whitespace-nowrap"
    >
      {label}
    </span>
  );
}
