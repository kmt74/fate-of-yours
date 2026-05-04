import React, { useState } from "react";
import { CardBack } from "./CardBack";
import type { TarotCard } from "../../data/tarot-data";
import { useLocale } from "../../../hooks/useLocale";

interface ArcCardProps {
  card: TarotCard;
  globalIndex: number;
  arcOffsetY: number;
  selected: boolean;
  selectionOrder: number;
  disabled: boolean;
  onToggle: (id: number) => void;
}

function ArcCard({ card, globalIndex, arcOffsetY, selected, selectionOrder, disabled, onToggle }: ArcCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div id={`Arc-Card-${card.id}`} onClick={() => !disabled && onToggle(card.id)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} title={`Card ${globalIndex + 1}`} className="relative shrink-0" style={{ cursor: disabled && !selected ? "not-allowed" : "pointer", marginLeft: globalIndex % 26 === 0 ? 0 : "-42px", transform: `translateY(${arcOffsetY + (selected ? -22 : hovered && !disabled ? -18 : 0)}px)`, transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1)", zIndex: selected ? 60 : hovered ? 50 : globalIndex % 26, opacity: disabled && !selected ? 0.35 : 1 }}>
      <CardBack width={66} height={102} glowColor={hovered ? "rgba(139,92,246,0.45)" : "rgba(201,168,76,0.2)"} elevated={hovered || selected} selected={selected} selectionNum={selectionOrder} />
    </div>
  );
}

const ARC_AMPLITUDES = [28, 22, 30];

export interface CurvedSpreadProps {
  deck: TarotCard[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

export function CurvedSpread({ deck, selectedIds, onToggle }: CurvedSpreadProps) {
  const t = useLocale();
  const allSelected = selectedIds.length >= 3;
  const rows = [deck.slice(0, 26), deck.slice(26, 52), deck.slice(52, 78)];
  const getArcOffset = (i: number, n: number, amplitude: number) => {
    const normalized = i / (n - 1);
    return amplitude * 4 * Math.pow(normalized - 0.5, 2);
  };
  return (
    <div 
      id="Curved-Spread-Wrapper" 
      style={{ 
        width: "100%", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        overflow: "visible !important" 
      }}
    >
      <div 
        id="Curved-Spread" 
        className="flex flex-col gap-12" 
        style={{ 
          animation: "fadeIn 0.5s ease", 
          width: "fit-content",
          minWidth: "1100px", // Base width for the spread
          transform: "scale(clamp(0.4, calc(100vw / 1200), 1))",
          transformOrigin: "center top",
          overflow: "visible !important",
          padding: "20px 0"
        }}
      >
        <p className="text-center text-[0.77rem] tracking-[0.04em]" style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.32)", marginBottom: "-20px" }}>
          {t.deck.guide} <span style={{ color: "rgba(201,168,76,0.5)" }}> {allSelected ? "" : (selectedIds.length === 2 ? t.deck.chooseOne : t.deck.chooseMore.replace("{n}", (3 - selectedIds.length).toString()))}.</span>
        </p>
        {rows.map((row, rowIndex) => {
          const amplitude = ARC_AMPLITUDES[rowIndex];
          const n = row.length;
          return (
            <div 
              key={rowIndex} 
              id={`Arc-Row-${rowIndex + 1}`} 
              className="relative" 
              style={{ 
                paddingBottom: `${amplitude + 18}px`, 
                paddingTop: "10px", 
                width: "100%", 
                display: "flex", 
                justifyContent: "center",
                overflow: "visible !important"
              }}
            >
              <div 
                className="flex items-start" 
                style={{ 
                  overflow: "visible !important",
                  msOverflowStyle: "none", 
                  scrollbarWidth: "none" as any 
                }}
              >
                {row.map((card, colIndex) => {
                  const arcY = getArcOffset(colIndex, n, amplitude);
                  const globalIndex = rowIndex * 26 + colIndex;
                  return <ArcCard key={card.id} card={card} globalIndex={globalIndex} arcOffsetY={arcY} selected={selectedIds.includes(card.id)} selectionOrder={selectedIds.indexOf(card.id) + 1} disabled={!selectedIds.includes(card.id) && allSelected} onToggle={onToggle} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
