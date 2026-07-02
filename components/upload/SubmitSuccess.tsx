"use client";

interface SubmitSuccessProps {
  jobTitle: string;
  resumeId: string;
}

export default function SubmitSuccess({ jobTitle }: SubmitSuccessProps) {
  return (
    <div className="w-full glass rounded-2xl p-8 flex flex-col items-center text-center gap-4 animate-fade-up">
      {/* Checkmark */}
      <div className="w-14 h-14 rounded-full bg-[hsl(142_72%_50%/0.15)] flex items-center justify-center ring-1 ring-[hsl(142_72%_50%/0.3)]">
        <svg className="w-7 h-7 text-[hsl(142_72%_55%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">Application Submitted!</h2>
        <p className="text-sm text-[hsl(220_14%_55%)] mt-1">
          Your resume for <span className="text-white font-medium">{jobTitle}</span> has been received.
        </p>
      </div>

      <p className="text-xs text-[hsl(220_14%_40%)] max-w-xs leading-relaxed">
        Our team will review your application and reach out if there&apos;s a fit.
        You don&apos;t need to do anything else.
      </p>
    </div>
  );
}
