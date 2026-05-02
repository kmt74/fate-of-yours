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
      className="flex flex-col items-center text-center gap-4 rounded-[14px] px-6 py-5"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(240,230,211,0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex items-center justify-center gap-2">
        <CategoryBadge
          icon={category.icon}
          label={category.label.toUpperCase()}
          accentColor={category.accentColor}
        />
      </div>
      <p
        className="text-[clamp(1.1rem,3vw,1.4rem)] font-medium leading-relaxed tracking-[0.02em]"
        style={{ 
          fontFamily: "'Cinzel', serif", 
          color: "#F0E6D3",
          maxWidth: "100%"
        }}
      >
        "{question}"
      </p>
    </div>
  );
}
