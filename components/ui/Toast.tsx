"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  durationMs?: number;
  onDismiss?: () => void;
}

const TYPE_STYLES: Record<ToastType, string> = {
  success: "border-[hsl(142_72%_50%/0.4)] text-[hsl(142_72%_60%)]",
  error:   "border-[hsl(0_78%_55%/0.4)]   text-[hsl(0_78%_65%)]",
  info:    "border-[hsl(222_70%_50%/0.4)]  text-[hsl(222_70%_65%)]",
};

export function Toast({ message, type = "info", durationMs = 4000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, durationMs);
    return () => clearTimeout(t);
  }, [durationMs, onDismiss]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl
                  glass border animate-fade-up ${TYPE_STYLES[type]}`}
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => { setVisible(false); onDismiss?.(); }}
        className="text-current opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
