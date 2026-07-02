"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
}

const VARIANT_STYLES = {
  primary: "bg-[hsl(222_70%_50%)] text-white hover:bg-[hsl(222_74%_42%)] glow-brand",
  ghost:   "text-[hsl(220_14%_55%)] hover:text-white hover:bg-[hsl(220_12%_18%)]",
  danger:  "bg-[hsl(0_78%_55%/0.15)] text-[hsl(0_78%_65%)] hover:bg-[hsl(0_78%_55%/0.25)]",
};

const SIZE_STYLES = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2 text-sm rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, disabled, className = "", ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-colors duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      {...rest}
    >
      {loading ? "Loading…" : children}
    </button>
  )
);

Button.displayName = "Button";
