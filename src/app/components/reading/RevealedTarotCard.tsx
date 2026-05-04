import React from "react";
import { PositionLabel } from "../ui/PositionLabel";
import { POSITION_COLORS } from "../../lib/theme";
import { useApp } from "../../context/AppContext";
import { useLocale } from "../../../hooks/useLocale";
import type { TarotCard } from "../../data/tarot-data";
import type { Position } from "../../lib/theme";

export interface RevealedTarotCardProps {
  card: TarotCard;
  position: Position;
  positionIndex: number;
  revealed: boolean;
  delay: number;
}

export function RevealedTarotCard({
  card,
  position,
  positionIndex,
  revealed,
  delay,
}: RevealedTarotCardProps) {
  const { language } = useApp();
  const t = useLocale();
  const color = POSITION_COLORS[position];
  const HEADING_FONT = language === "VI" ? "'Playfair Display', serif" : "'Cinzel', serif";

  const getLocalizedName = (card: TarotCard) => {
    return card.name;
  };

  const localizedPosition = 
    position === "past" ? t.deck.past :
    position === "present" ? t.deck.present :
    t.deck.future;

  return (
    <div
      id={`Revealed-Card-${positionIndex + 1}`}
      className="flex flex-1 flex-col items-center gap-4"
      style={{ minWidth: "140px", maxWidth: "240px" }}
    >
      <PositionLabel label={localizedPosition.toUpperCase()} color={color} />

      <div style={{ perspective: "1000px" }} className="w-full">
        <div
          className="relative w-full"
          style={{
            transformStyle: "preserve-3d",
            transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: `transform 0.8s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
            paddingBottom: "171.5%",
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              background: "linear-gradient(145deg, #141420 0%, #0F0F1A 100%)",
              border: "1.5px solid rgba(139,92,246,0.35)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(139,92,246,0.08) 0px, rgba(139,92,246,0.08) 1px, transparent 1px, transparent 8px)",
              }}
            />
            <div
              className="absolute rounded-md"
              style={{
                inset: "8px",
                border: "0.5px solid rgba(201,168,76,0.15)",
              }}
            />
            <span
              className="relative text-[22px]"
              style={{ color: "rgba(139,92,246,0.4)" }}
              aria-hidden="true"
            >
              ✦
            </span>
          </div>

          <div
            className="absolute inset-0 flex flex-col items-center justify-between overflow-hidden rounded-xl"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackdropFilter: "blur(18px)",
              transform: "rotateY(180deg)",
              background: "#0F0F1A",
              border: `1.5px solid ${color}66`,
              boxShadow: revealed
                ? `0 0 40px ${color}25, 0 8px 32px rgba(0,0,0,0.8)`
                : "none",
              padding: "16px 12px",
            }}
          >
            {/* Card Artwork Layer */}
            <div className="absolute inset-0 z-0">
              <img 
                src={card.image} 
                alt={card.name}
                className="h-full w-full object-cover transition-transform duration-1000"
                style={{ 
                  filter: "brightness(0.85) contrast(1.1)",
                  opacity: 1,
                  transform: card.orientation === "reversed" ? "rotate(180deg)" : "none"
                }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              {/* Subtle Gradient Overlays for Readability */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom, rgba(15,15,26,0.8) 0%, transparent 20%, transparent 80%, rgba(15,15,26,0.9) 100%)`,
                }}
              />
            </div>

            {/* Top Label: Orientation */}
            <div className="relative z-10 w-full flex justify-center">
              <span
                className="text-[0.6rem] tracking-[0.25em] font-medium"
                style={{ 
                  fontFamily: HEADING_FONT, 
                  color: card.orientation === "reversed" ? "#ef4444" : "#C9A84C",
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                }}
              >
                ✦ {card.orientation === "reversed" ? t.reading.reversed : t.reading.upright} ✦
              </span>
            </div>

            {/* Bottom Label: Card Name */}
            <div className="relative z-10 w-full flex flex-col items-center gap-1">
              <span
                className="text-center text-[0.85rem] font-bold tracking-[0.06em]"
                style={{ 
                  fontFamily: HEADING_FONT, 
                  color: "#F0E6D3",
                  textShadow: "0 2px 8px rgba(0,0,0,0.8)"
                }}
              >
                {getLocalizedName(card).toUpperCase()}
              </span>
              <div className="h-0.5 w-8 rounded-full" style={{ background: color }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
