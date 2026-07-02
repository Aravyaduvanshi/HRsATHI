/**
 * Minimal public layout for candidate-facing pages (/apply/[jobId]).
 * No auth chrome — just a clean centred shell with the HRSathi wordmark.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[hsl(220_14%_8%)] flex flex-col">
      {/* Minimal header — no user data */}
      <header className="px-6 py-4 border-b border-[hsl(220_12%_14%)]">
        <span className="text-lg font-bold text-white tracking-tight">
          HR<span className="text-[hsl(222_70%_60%)]">Sathi</span>
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}
