import React from "react";
import { PositionLabel } from "../ui/PositionLabel";
import { POSITION_COLORS } from "../../lib/theme";
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
  const color = POSITION_COLORS[position];

  return (
    <div
      id={`Revealed-Card-${positionIndex + 1}`}
      className="flex flex-1 flex-col items-center gap-4"
      style={{ minWidth: "140px", maxWidth: "240px" }}
    >
      <PositionLabel label={position.toUpperCase()} color={color} />

      <div style={{ perspective: "1000px" }} className="w-full">
        <div
          className="relative w-full"
          style={{
            transformStyle: "preserve-3d",
            transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: `transform 0.8s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
            paddingBottom: "150%",
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
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background:
                "linear-gradient(145deg, #1E1632 0%, #160F28 100%)",
              border: `1.5px solid ${color}66`,
              boxShadow: revealed
                ? `0 0 30px ${color}33, 0 8px 32px rgba(0,0,0,0.6)`
                : "none",
              padding: "20px 14px",
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
                backgroundSize: "18px 18px",
              }}
              aria-hidden="true"
            />
            <div
              className="absolute rounded-lg"
              style={{
                inset: "6px",
                border: `0.5px solid ${color}33`,
              }}
              aria-hidden="true"
            />

            <span
              className="relative text-[0.55rem] tracking-[0.2em]"
              style={{ fontFamily: "'Cinzel', serif", color: `${color}88` }}
            >
              ✦ UPRIGHT ✦
            </span>

            <div className="relative flex flex-col items-center gap-2.5">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-[28px]"
                style={{
                  background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                  border: `1.5px solid ${color}55`,
                  boxShadow: `0 0 20px ${color}20`,
                }}
              >
                {card.symbol}
              </div>

              <span
                className="text-center text-[clamp(0.75rem,2vw,0.95rem)] font-semibold leading-tight tracking-[0.04em]"
                style={{ fontFamily: "'Cinzel', serif", color: "#F0E6D3" }}
              >
                {card.name}
              </span>

              <span
                className="text-center text-[0.65rem] leading-relaxed tracking-[0.02em]"
                style={{
                  fontFamily: "'Raleway', sans-serif",
                  color: "rgba(240,230,211,0.45)",
                }}
              >
                {card.meaning}
              </span>
            </div>

            <div
              className="relative rounded-full px-2.5 py-0.5"
              style={{
                background: `rgba(${card.suit === "major" ? "201,168,76" : "139,92,246"},0.12)`,
                border: `1px solid rgba(${card.suit === "major" ? "201,168,76" : "139,92,246"},0.25)`,
              }}
            >
              <span
                className="text-[0.58rem] font-semibold tracking-[0.12em]"
                style={{
                  fontFamily: "'Raleway', sans-serif",
                  color:
                    card.suit === "major"
                      ? "rgba(201,168,76,0.7)"
                      : "rgba(139,92,246,0.7)",
                }}
              >
                {card.suit === "major"
                  ? "MAJOR ARCANA"
                  : card.suit.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
