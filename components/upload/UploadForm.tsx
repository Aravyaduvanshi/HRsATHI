"use client";

import { useState, useRef } from "react";
import FilePreview from "./FilePreview";
import SubmitSuccess from "./SubmitSuccess";
import { formatFileSize } from "@/lib/utils";

interface UploadFormProps {
  jobId: string;
  jobTitle: string;
}

type FormState = "idle" | "submitting" | "success" | "error";

const ACCEPTED = ".pdf,.doc,.docx";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export default function UploadForm({ jobId, jobTitle }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (f.size > MAX_BYTES) {
      setErrorMsg(`File too large. Maximum is ${formatFileSize(MAX_BYTES)}.`);
      return;
    }
    setErrorMsg(null);
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;

    setFormState("submitting");
    setErrorMsg(null);

    const form = e.currentTarget;
    const fd = new FormData();
    fd.append("job_id", jobId);
    fd.append("candidate_name", (form.elements.namedItem("name") as HTMLInputElement).value);
    fd.append("candidate_email", (form.elements.namedItem("email") as HTMLInputElement).value);
    fd.append("resume", file);

    try {
      const res = await fetch("/api/resumes", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setResumeId(json.resumeId);
      setFormState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setFormState("error");
    }
  }

  if (formState === "success" && resumeId) {
    return <SubmitSuccess jobTitle={jobTitle} resumeId={resumeId} />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full glass rounded-2xl p-6 flex flex-col gap-5"
    >
      <h2 className="text-lg font-bold text-white">Submit Your Application</h2>

      {/* Name */}
      <Field label="Full Name" name="name" type="text" placeholder="Ada Lovelace" required />

      {/* Email */}
      <Field label="Email Address" name="email" type="email" placeholder="ada@example.com" required />

      {/* Dropzone */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[hsl(220_14%_70%)]">
          Resume <span className="text-[hsl(0_78%_65%)]">*</span>
        </label>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const dropped = e.dataTransfer.files[0];
            if (dropped) handleFile(dropped);
          }}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed
                      cursor-pointer transition-all duration-200
                      ${dragOver
                        ? "border-[hsl(222_70%_50%)] bg-[hsl(222_70%_50%/0.07)]"
                        : "border-[hsl(220_12%_22%)] hover:border-[hsl(220_12%_35%)]"
                      }`}
        >
          {file ? (
            <FilePreview file={file} onRemove={() => setFile(null)} />
          ) : (
            <>
              <svg className="w-8 h-8 text-[hsl(220_14%_40%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
              <p className="text-sm text-[hsl(220_14%_50%)]">
                <span className="text-[hsl(222_70%_60%)] font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-[hsl(220_14%_40%)]">PDF, DOC, DOCX — max 5 MB</p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {errorMsg && (
        <p className="text-xs text-[hsl(0_78%_65%)]">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={!file || formState === "submitting"}
        className="py-2.5 rounded-lg bg-[hsl(222_70%_50%)] text-white font-medium text-sm
                   hover:bg-[hsl(222_74%_42%)] disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors glow-brand"
      >
        {formState === "submitting" ? "Uploading…" : "Submit Application"}
      </button>
    </form>
  );
}

function Field({
  label, name, type, placeholder, required,
}: {
  label: string; name: string; type: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-[hsl(220_14%_70%)]">
        {label} {required && <span className="text-[hsl(0_78%_65%)]">*</span>}
      </label>
      <input
        id={name} name={name} type={type} required={required} placeholder={placeholder}
        className="px-3 py-2 rounded-lg bg-[hsl(220_12%_14%)] border border-[hsl(220_12%_22%)]
                   text-white placeholder:text-[hsl(220_14%_35%)] focus:outline-none
                   focus:border-[hsl(222_70%_50%)] transition-colors text-sm"
      />
    </div>
  );
}
