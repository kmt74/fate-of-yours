import React from "react";

export interface SectionTagProps {
  text: string;
  centered?: boolean;
}

export function SectionTag({ text, centered = true }: SectionTagProps) {
  return (
    <div
      className={`flex items-center gap-2.5 ${centered ? "justify-center" : ""}`}
    >
      <div
        className="h-px w-9"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(201,168,76,0.5))",
        }}
      />
      <span
        className="text-[0.68rem] font-semibold tracking-[0.22em]"
        style={{
          fontFamily: "'Raleway', sans-serif",
          color: "rgba(201,168,76,0.6)",
        }}
      >
        {text}
      </span>
      {centered && (
        <div
          className="h-px w-9"
          style={{
            background:
              "linear-gradient(to left, transparent, rgba(201,168,76,0.5))",
          }}
        />
      )}
    </div>
  );
}
