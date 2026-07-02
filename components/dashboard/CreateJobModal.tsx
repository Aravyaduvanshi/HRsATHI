"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateJobModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      department: (form.elements.namedItem("department") as HTMLInputElement).value || undefined,
      jd_text: (form.elements.namedItem("jd_text") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create job");

      setOpen(false);
      router.refresh(); // Revalidate the dashboard server component
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        id="create-job-btn"
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg bg-[hsl(222_70%_50%)] text-white text-sm font-medium
                   hover:bg-[hsl(222_74%_42%)] transition-colors glow-brand"
      >
        + New Job
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-lg glass rounded-2xl p-6 animate-fade-up">
            <h2 className="text-lg font-bold text-white mb-5">Create New Job</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Job Title" name="title" required placeholder="e.g. Senior Backend Engineer" />
              <Field label="Department" name="department" placeholder="e.g. Engineering (optional)" />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="jd_text" className="text-sm font-medium text-[hsl(220_14%_70%)]">
                  Job Description <span className="text-[hsl(0_78%_65%)]">*</span>
                </label>
                <textarea
                  id="jd_text"
                  name="jd_text"
                  required
                  rows={8}
                  placeholder="Paste the full job description here…"
                  className="px-3 py-2 rounded-lg bg-[hsl(220_12%_14%)] border border-[hsl(220_12%_22%)]
                             text-white placeholder:text-[hsl(220_14%_35%)] focus:outline-none
                             focus:border-[hsl(222_70%_50%)] transition-colors resize-none text-sm"
                />
              </div>

              {error && (
                <p className="text-xs text-[hsl(0_78%_65%)]">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[hsl(220_14%_55%)]
                             hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-[hsl(222_70%_50%)] text-white text-sm font-medium
                             hover:bg-[hsl(222_74%_42%)] disabled:opacity-50 transition-colors"
                >
                  {loading ? "Creating…" : "Create Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label, name, required, placeholder,
}: {
  label: string; name: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-[hsl(220_14%_70%)]">
        {label} {required && <span className="text-[hsl(0_78%_65%)]">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        required={required}
        placeholder={placeholder}
        className="px-3 py-2 rounded-lg bg-[hsl(220_12%_14%)] border border-[hsl(220_12%_22%)]
                   text-white placeholder:text-[hsl(220_14%_35%)] focus:outline-none
                   focus:border-[hsl(222_70%_50%)] transition-colors text-sm"
      />
    </div>
  );
}
