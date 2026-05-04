import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { useLocale } from "../../../hooks/useLocale";
import { useApp } from "../../context/AppContext";

export interface StackedDeckProps {
  onBegin: () => void;
}

export function StackedDeck({ onBegin }: StackedDeckProps) {
  const [hoverBtn, setHoverBtn] = useState(false);
  const t = useLocale();
  const { language } = useApp();
  const HEADING_FONT = language === "VI" ? "'Playfair Display', serif" : "'Cinzel', serif";

  return (
    <div
      id="Deck-State-Stacked"
      className="flex min-h-[480px] flex-col items-center justify-center gap-12"
      style={{ animation: "fadeIn 0.6s ease" }}
    >
      <div className="flex flex-col items-center">
        <p
          className="mb-8 text-[0.72rem] tracking-[0.18em]"
          style={{
            fontFamily: "'Raleway', sans-serif",
            color: "rgba(240,230,211,0.3)",
          }}
        >
          ─ {t.deck.cardsAwait} ─
        </p>

        <div className="relative" style={{ width: "110px", height: "170px" }}>
          <div
            className="absolute -translate-x-1/2 rounded-[50%]"
            style={{
              bottom: "-20px",
              left: "50%",
              width: "90px",
              height: "20px",
              background:
                "radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />

          {[...Array(14)].map((_, i) => {
            const isTop = i === 13;
            const fromTop = 13 - i;
            return (
              <div
                key={i}
                className="absolute overflow-hidden rounded-[9px]"
                style={{
                  bottom: `${i * 2}px`,
                  left: `${fromTop * 1.2}px`,
                  width: "110px",
                  height: "170px",
                  background: isTop
                    ? "linear-gradient(145deg, #1E1832 0%, #16122A 100%)"
                    : `linear-gradient(145deg, hsl(240,${15 + i}%,${8 + i * 0.5}%) 0%, hsl(240,${12 + i}%,${6 + i * 0.4}%) 100%)`,
                  border: isTop
                    ? "1px solid rgba(201,168,76,0.2)"
                    : `1px solid rgba(201,168,76,${0.04 + i * 0.005})`,
                  zIndex: i,
                  boxShadow: isTop
                    ? "0 -4px 20px rgba(139,92,246,0.12)"
                    : "none",
                }}
              >
                {isTop && (
                  <>
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, rgba(139,92,246,0.07) 0px, rgba(139,92,246,0.07) 1px, transparent 1px, transparent 9px)" }} />
                    <div style={{ position: "absolute", rounded: "6px", inset: "7px", border: "0.5px solid rgba(201,168,76,0.15)" }} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "rgba(139,92,246,0.4)" }}>✦</div>
                    <div className="absolute left-3 top-3 h-3.5 w-3.5" style={{ borderTop: "1px solid rgba(201,168,76,0.25)", borderLeft: "1px solid rgba(201,168,76,0.25)", borderRadius: "2px 0 0 0" }} />
                    <div className="absolute right-3 top-3 h-3.5 w-3.5" style={{ borderTop: "1px solid rgba(201,168,76,0.25)", borderRight: "1px solid rgba(201,168,76,0.25)", borderRadius: "0 2px 0 0" }} />
                    <div className="absolute bottom-3 left-3 h-3.5 w-3.5" style={{ borderBottom: "1px solid rgba(201,168,76,0.25)", borderLeft: "1px solid rgba(201,168,76,0.25)", borderRadius: "0 0 0 2px" }} />
                    <div className="absolute bottom-3 right-3 h-3.5 w-3.5" style={{ borderBottom: "1px solid rgba(201,168,76,0.25)", borderRight: "1px solid rgba(201,168,76,0.25)", borderRadius: "0 0 2px 0" }} />
                  </>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-7 text-[0.75rem] tracking-[0.12em]" style={{ fontFamily: HEADING_FONT, color: "rgba(201,168,76,0.5)" }}>
          {t.deck.deckDesc}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          id="Begin-Draw-Button"
          onClick={onBegin}
          onMouseEnter={() => setHoverBtn(true)}
          onMouseLeave={() => setHoverBtn(false)}
          className="flex items-center gap-3 rounded-full border-none px-11 py-4 text-base font-semibold tracking-[0.1em]"
          style={{
            background: hoverBtn
              ? "linear-gradient(135deg, #D4B85C, #B8942A)"
              : "linear-gradient(135deg, #C9A84C, #A8873A)",
            color: "#0A0A12",
            fontFamily: HEADING_FONT,
            cursor: "pointer",
            transition: "all 0.25s ease",
            boxShadow: hoverBtn
              ? "0 0 60px rgba(201,168,76,0.5), 0 12px 32px rgba(0,0,0,0.5)"
              : "0 0 40px rgba(201,168,76,0.3), 0 6px 24px rgba(0,0,0,0.4)",
            transform: hoverBtn ? "translateY(-2px)" : "none",
            animation: "pulseGold 2.5s ease-in-out infinite",
          }}
        >
          <Sparkles size={18} />
          {t.deck.beginBtn}
        </button>
        <p className="text-[0.75rem] tracking-[0.06em]" style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.25)" }}>
          {t.deck.readyHint}
        </p>
      </div>
    </div>
  );
}
