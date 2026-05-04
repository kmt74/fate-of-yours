import React from "react";
import { useLocale } from "../../../hooks/useLocale";
import { useApp } from "../../context/AppContext";

interface PileStackProps {
  id: string;
  label: string;
  subLabel: string;
  animClass: string;
  delay: number;
  cards: number;
  headingFont: string;
}

const CARD_W = 82;
const CARD_H = 128;
const VISIBLE_STRIP = 12;
const MARGIN_TOP = -(CARD_H - VISIBLE_STRIP);

function PileStack({ id, label, subLabel, animClass, delay, cards, headingFont }: PileStackProps) {
  return (
    <div id={id} className="flex flex-col items-center gap-4 opacity-0" style={{ animation: `${animClass} 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms forwards` }}>
      <div id={`${id}-Stack`} className="flex flex-col items-center" style={{ width: `${CARD_W}px` }}>
        {[...Array(cards)].map((_, i) => {
          const isTopCard = i === 0;
          return (
            <div key={i} className="shrink-0 overflow-hidden rounded-[7px]" style={{ marginTop: i === 0 ? 0 : `${MARGIN_TOP}px`, zIndex: cards - i, width: `${CARD_W}px`, height: `${CARD_H}px`, background: isTopCard ? "linear-gradient(145deg, #1E1832, #16122A)" : `linear-gradient(145deg, hsl(240,${10 + i * 0.4}%,${7 + i * 0.25}%) 0%, hsl(240,${8 + i * 0.3}%,${5 + i * 0.2}%) 100%)`, border: `1px solid rgba(201,168,76,${isTopCard ? "0.22" : 0.025 + i * 0.003})`, boxShadow: isTopCard ? "0 -3px 18px rgba(139,92,246,0.12), 0 4px 12px rgba(0,0,0,0.5)" : "none", transition: "transform 0.2s ease", position: "relative" }}>
              {isTopCard && (
                <>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, rgba(139,92,246,0.08) 0px, rgba(139,92,246,0.08) 1px, transparent 1px, transparent 7px)" }} />
                  <div style={{ position: "absolute", rounded: "4px", inset: "6px", border: "0.5px solid rgba(201,168,76,0.14)" }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", color: "rgba(139,92,246,0.38)" }}>✦</div>
                  <div className="absolute left-2 top-2 h-2.5 w-2.5" style={{ borderTop: "0.5px solid rgba(201,168,76,0.22)", borderLeft: "0.5px solid rgba(201,168,76,0.22)" }} />
                  <div className="absolute right-2 top-2 h-2.5 w-2.5" style={{ borderTop: "0.5px solid rgba(201,168,76,0.22)", borderRight: "0.5px solid rgba(201,168,76,0.22)" }} />
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span style={{ fontFamily: headingFont, color: "rgba(201,168,76,0.65)", fontSize: "0.82rem", letterSpacing: "0.12em" }}>{label}</span>
        <span style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.22)", fontSize: "0.63rem", letterSpacing: "0.04em" }}>{subLabel}</span>
      </div>
    </div>
  );
}

const PILE_DEFS = [
  { id: "Pile-Left", label: "I", animClass: "splitLeft", delay: 0 },
  { id: "Pile-Center", label: "II", animClass: "splitUp", delay: 90 },
  { id: "Pile-Right", label: "III", animClass: "splitRight", delay: 45 },
] as const;

export function SplittingDeck() {
  const t = useLocale();
  const { language } = useApp();
  const HEADING_FONT = language === "VI" ? "'Playfair Display', serif" : "'Cinzel', serif";

  return (
    <div id="Deck-State-Splitting" className="flex min-h-[480px] flex-col items-center justify-center gap-12" style={{ animation: "fadeIn 0.4s ease" }}>
      <p style={{ fontFamily: HEADING_FONT, color: "rgba(201,168,76,0.6)", fontSize: "0.8rem", letterSpacing: "0.2em" }}>─ {t.deck.splitting.toUpperCase()} ─</p>
      <div id="Spread-Container" className="flex flex-row items-start justify-center gap-[120px] overflow-visible">
        {PILE_DEFS.map((p) => <PileStack key={p.id} id={p.id} label={p.label} subLabel="26 cards" animClass={p.animClass} delay={p.delay} cards={26} headingFont={HEADING_FONT} />)}
      </div>
      <p style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.3)", fontSize: "0.78rem", animation: "pulse 1s ease infinite alternate", letterSpacing: "0.06em" }}>{t.deck.splitting}</p>
    </div>
  );
}
