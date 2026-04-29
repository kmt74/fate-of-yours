import React from "react";
import { CategoryBadge } from "../ui/CategoryBadge";
import type { Category } from "../../data/tarot-data";

export interface ReadingContextCardProps {
  category: Category;
  question: string;
}

export function ReadingContextCard({
  category,
  question,
}: ReadingContextCardProps) {
  return (
    <div
      id="Reading-Context-Card"
      className="flex flex-col gap-2.5 rounded-[14px] px-5 py-4"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(240,230,211,0.08)",
      }}
    >
      <div className="flex items-center gap-2">
        <CategoryBadge
          icon={category.icon}
          label={category.label.toUpperCase()}
          accentColor={category.accentColor}
        />
      </div>
      <p
        className="text-[clamp(1rem,2.5vw,1.25rem)] font-medium leading-relaxed tracking-[0.02em]"
        style={{ fontFamily: "'Cinzel', serif", color: "#F0E6D3" }}
      >
        "{question}"
      </p>
    </div>
  );
}
