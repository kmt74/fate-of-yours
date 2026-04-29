import React from "react";

export interface PositionLabelProps {
  label: string;
  color: string;
}

export function PositionLabel({ label, color }: PositionLabelProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-px w-6"
        style={{
          background: `linear-gradient(to right, transparent, ${color})`,
        }}
      />
      <span
        className="text-[0.68rem] font-bold tracking-[0.22em] uppercase"
        style={{ fontFamily: "'Raleway', sans-serif", color }}
      >
        {label}
      </span>
      <div
        className="h-px w-6"
        style={{
          background: `linear-gradient(to left, transparent, ${color})`,
        }}
      />
    </div>
  );
}
