// ─── Utility helpers ──────────────────────────────────────────────────────────

/**
 * Generate a short public URL for a job's apply page.
 */
export function getApplyUrl(jobId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/apply/${jobId}`;
}

/**
 * Format bytes into a human-readable file size string.
 * e.g. 1048576 → "1.0 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Clamp a score to the 0–100 range and round to the nearest integer.
 */
export function clampScore(score: number): number {
  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Derive a Tailwind colour class from a numeric score.
 * Returns a CSS class string for the score badge.
 */
export function scoreColour(score: number): "high" | "mid" | "low" {
  if (score >= 70) return "high";
  if (score >= 40) return "mid";
  return "low";
}

/**
 * Format an ISO date string to a readable locale date.
 * e.g. "2024-06-15T10:00:00Z" → "Jun 15, 2024"
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Truncate a string to a maximum length with an ellipsis.
 */
export function truncate(str: string, maxLen: number): string {
  return str.length <= maxLen ? str : `${str.slice(0, maxLen - 1)}…`;
}

/**
 * Validate that the incoming webhook request carries the correct secret.
 * Compares the Authorization header against WORKER_WEBHOOK_SECRET.
 */
export function validateWebhookSecret(authHeader: string | null): boolean {
  const secret = process.env.WORKER_WEBHOOK_SECRET;
  if (!secret) throw new Error("WORKER_WEBHOOK_SECRET is not configured");
  return authHeader === `Bearer ${secret}`;
}
