import React from "react";

export type DividerVariant = "default" | "violet-gold" | "gold-only";

export interface GlowDividerProps {
  variant?: DividerVariant;
  className?: string;
}

const GRADIENT_MAP: Record<DividerVariant, string> = {
  default:
    "linear-gradient(to right, rgba(139,92,246,0.5), rgba(201,168,76,0.2), transparent)",
  "violet-gold":
    "linear-gradient(to right, rgba(139,92,246,0.3), rgba(201,168,76,0.2), transparent)",
  "gold-only":
    "linear-gradient(to right, transparent, rgba(201,168,76,0.5), transparent)",
};

export function GlowDivider({
  variant = "default",
  className = "",
}: GlowDividerProps) {
  return (
    <div
      className={`h-px w-full ${className}`}
      style={{ background: GRADIENT_MAP[variant] }}
      role="separator"
      aria-hidden="true"
    />
  );
}
