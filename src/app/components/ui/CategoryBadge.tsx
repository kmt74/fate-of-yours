import React from "react";
import { hexToRgbStr } from "../../lib/theme";

export interface CategoryBadgeProps {
  icon: string;
  label: string;
  accentColor: string;
}

export function CategoryBadge({ icon, label, accentColor }: CategoryBadgeProps) {
  const rgb = hexToRgbStr(accentColor);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[0.68rem] font-bold tracking-[0.14em] uppercase"
      style={{
        fontFamily: "'Raleway', sans-serif",
        color: accentColor,
        background: `rgba(${rgb}, 0.1)`,
        border: `1px solid rgba(${rgb}, 0.25)`,
      }}
    >
      {icon} {label}
    </span>
  );
}
