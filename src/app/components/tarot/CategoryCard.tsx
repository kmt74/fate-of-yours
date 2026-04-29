import React, { useState } from "react";
import {
  Briefcase, Heart, Users, BookOpen, Coins, Leaf, Star, Home,
} from "lucide-react";
import { CATEGORIES, CATEGORY_VI, CATEGORY_ZH, Category } from "../../data/tarot-data";

type Lang = "EN" | "VI" | "ZH";

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ReactNode> = {
  career:   <Briefcase size={24} />,
  love:     <Heart size={24} />,
  friendship: <Users size={24} />,
  general:  <BookOpen size={24} />,
  finance:  <Coins size={24} />,
  health:   <Leaf size={24} />,
  spiritual: <Star size={24} />,
  family:   <Home size={24} />,
};

function hexToRgb(hex: string) {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}

function getCatDesc(id: string, lang: Lang): string {
  if (lang === "VI") return CATEGORY_VI[id]?.description ?? "";
  if (lang === "ZH") return CATEGORY_ZH[id]?.description ?? "";
  return CATEGORIES.find((c) => c.id === id)?.description ?? "";
}

// ─── Category Card Component ──────────────────────────────────────────────────
export function CategoryCard({
  category, selected, lang, onClick,
}: {
  category: Category; selected: boolean; lang: Lang; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const rgb = hexToRgb(category.accentColor);
  const active = selected || hovered;

  const enLabel = category.label;
  const nativeLabel = lang === "VI" ? CATEGORY_VI[category.id]?.label : lang === "ZH" ? CATEGORY_ZH[category.id]?.label : null;
  const displayLabel = nativeLabel ? `${enLabel} (${nativeLabel})` : enLabel;
  const displayDesc = getCatDesc(category.id, lang);

  return (
    <button
      id={`Category-Card-${category.id}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: selected
          ? `linear-gradient(145deg, rgba(${rgb},0.14) 0%, rgba(${rgb},0.07) 100%)`
          : hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.025)",
        border: `1.5px solid ${selected ? category.accentColor : hovered ? `rgba(${rgb},0.45)` : "rgba(240,230,211,0.09)"}`,
        borderRadius: "16px",
        padding: "20px 18px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "12px",
        transition: "all 0.25s ease",
        textAlign: "left",
        boxShadow: selected
          ? `0 0 28px rgba(${rgb},0.18), 0 4px 20px rgba(0,0,0,0.3)`
          : hovered ? `0 0 16px rgba(${rgb},0.09), 0 4px 16px rgba(0,0,0,0.2)` : "none",
        transform: active ? "translateY(-3px)" : "none",
        overflow: "hidden",
        minHeight: "136px",
      }}
    >
      {selected && (
        <div style={{
          position: "absolute", top: "12px", right: "12px",
          width: "20px", height: "20px", borderRadius: "50%",
          background: category.accentColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "10px", color: "#0A0A12", fontWeight: 700,
          boxShadow: `0 0 10px rgba(${rgb},0.4)`,
        }}>✓</div>
      )}

      {selected && (
        <div style={{
          position: "absolute", bottom: 0, right: 0, width: "80px", height: "80px",
          background: `radial-gradient(circle at bottom right, rgba(${rgb},0.12) 0%, transparent 70%)`,
          borderRadius: "16px",
        }} />
      )}

      <div style={{
        width: "48px", height: "48px", borderRadius: "13px",
        background: selected ? `rgba(${rgb},0.18)` : `rgba(${rgb},0.08)`,
        border: `1px solid rgba(${rgb},${selected ? "0.45" : "0.2"})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: category.accentColor, transition: "all 0.25s ease",
        boxShadow: selected ? `0 0 16px rgba(${rgb},0.22)` : "none",
        flexShrink: 0,
      }}>
        {ICON_MAP[category.id] || <span style={{ fontSize: "22px" }}>{category.icon}</span>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
        <span style={{
          fontFamily: "'Cinzel', serif",
          color: selected ? category.accentColor : hovered ? "#F0E6D3" : "rgba(240,230,211,0.85)",
          fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.04em",
          transition: "color 0.2s",
          lineHeight: 1.4,
        }}>
          {displayLabel}
        </span>
        <span style={{
          fontFamily: "'Raleway', sans-serif",
          color: "rgba(240,230,211,0.4)", fontSize: "0.75rem",
          lineHeight: 1.5,
        }}>
          {displayDesc}
        </span>
      </div>
    </button>
  );
}

// ─── Question Chip ────────────────────────────────────────────────────────────
export function QuestionChip({
  question, selected, accentColor, onClick,
}: {
  question: string; selected: boolean; accentColor: string; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const rgb = hexToRgb(accentColor);

  return (
    <button
      id={`Chip-${question.slice(0,15).replace(/\s/g,"-")}`}
      onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: selected ? `rgba(${rgb},0.16)` : hov ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${selected ? accentColor : hov ? `rgba(${rgb},0.38)` : "rgba(240,230,211,0.11)"}`,
        borderRadius: "50px", padding: "9px 18px", cursor: "pointer",
        fontFamily: "'Raleway', sans-serif", fontSize: "0.83rem",
        color: selected ? accentColor : hov ? "#F0E6D3" : "rgba(240,230,211,0.55)",
        transition: "all 0.2s ease", letterSpacing: "0.02em",
        lineHeight: 1.5, whiteSpace: "normal", textAlign: "left",
        boxShadow: selected ? `0 0 14px rgba(${rgb},0.14)` : "none",
      }}
    >
      {question}
    </button>
  );
}
