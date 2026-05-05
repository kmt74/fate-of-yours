import React from "react";
import { X } from "lucide-react";
import { CardBack } from "./CardBack";
import type { TarotCard } from "../../data/tarot-data";
import { useLocale } from "../../../hooks/useLocale";
import { useApp } from "../../context/AppContext";

interface SelectedSlotProps {
  position: string;
  card: TarotCard | null;
  onRemove?: () => void;
}

function SelectedSlot({ position, card, onRemove }: SelectedSlotProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[0.7rem] uppercase tracking-[0.08em]" style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.5)" }}>{position}</span>
      <div className="relative">
        {card ? (
          <>
            <CardBack width={88} height={138} compact selected />
            {onRemove && (
              <button onClick={onRemove} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full p-0" style={{ background: "linear-gradient(145deg, #C9A84C, #E2C97E)", border: "1px solid rgba(240,230,211,0.3)", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>
                <X size={12} color="#161628" strokeWidth={2.5} />
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center rounded-md" style={{ width: "57px", height: "90px", border: "1.5px dashed rgba(240,230,211,0.15)", background: "rgba(240,230,211,0.02)" }}>
            <div className="rounded-full" style={{ width: "16px", height: "16px", border: "1.5px solid rgba(240,230,211,0.2)" }} />
          </div>
        )}
      </div>
    </div>
  );
}

export interface SelectedCardsTrayProps {
  selectedIds: number[];
  selectedCards: (TarotCard | null)[];
  onRemoveCard: (index: number) => void;
}

export function SelectedCardsTray({ selectedIds, selectedCards, onRemoveCard }: SelectedCardsTrayProps) {
  const t = useLocale();
  const { language } = useApp();
  const HEADING_FONT = language === "VI" ? "'Playfair Display', serif" : "'Cinzel', serif";

  const POSITIONS = [t.deck.past, t.deck.present, t.deck.future];

  return (
    <div id="Selected-Cards-Tray" className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 px-6 py-4">
      <div className="flex items-center gap-2.5">
        <span className="text-[0.72rem] tracking-[0.18em]" style={{ fontFamily: HEADING_FONT, color: selectedIds.length > 0 ? "#C9A84C" : "rgba(240,230,211,0.3)", transition: "color 0.3s" }}>{t.deck.selectedHeader}</span>
        <div className="h-px flex-1" style={{ background: "rgba(240,230,211,0.07)" }} />
        <span className="text-[0.7rem] tracking-[0.08em]" style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.3)" }}>{selectedIds.length}/3</span>
      </div>
      <div className="flex justify-center gap-4">
        {POSITIONS.map((pos, i) => <SelectedSlot key={i} position={pos} card={selectedCards[i] ?? null} onRemove={selectedCards[i] ? () => onRemoveCard(i) : undefined} />)}
      </div>
      <div className="mt-1 h-0.5 overflow-hidden rounded-sm" style={{ background: "rgba(240,230,211,0.06)" }}>
        <div className="h-full rounded-sm" style={{ width: `${(selectedIds.length / 3) * 100}%`, background: selectedIds.length >= 3 ? "linear-gradient(to right, #C9A84C, #E2C97E)" : "rgba(139,92,246,0.7)", transition: "width 0.35s ease, background 0.35s ease" }} />
      </div>
    </div>
  );
}
