import React, { useState } from "react";

export interface TarotCard {
  name: string;
  symbol: string;
  meaning: string;
  keywords: string[];
  position: string;
  positionLabel: string;
  orientation: "upright" | "reversed";
}

interface CardPlaceholderProps {
  card: TarotCard;
  revealed: boolean;
  index: number;
}

const ARCANA_SYMBOLS = ["☽", "✦", "◎", "⊹", "✸", "⊕"];

export function CardPlaceholder({ card, revealed, index }: CardPlaceholderProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      id={`Card-Wrapper-${index + 1}`}
      className="flex flex-col items-center"
      style={{ gap: "16px", flex: "1 1 0" }}
    >
      {/* Position Label */}
      <div
        id={`Card-Position-Label-${index + 1}`}
        className="flex items-center"
        style={{ gap: "8px" }}
      >
        <div
          className="h-px w-8"
          style={{
            background: `linear-gradient(to right, transparent, ${revealed ? "#C9A84C" : "rgba(139,92,246,0.5)"})`,
          }}
        />
        <span
          style={{
            fontFamily: "'Raleway', sans-serif",
            color: revealed ? "#C9A84C" : "rgba(139, 92, 246, 0.8)",
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            fontWeight: 600,
          }}
        >
          {card.positionLabel.toUpperCase()}
        </span>
        <div
          className="h-px w-8"
          style={{
            background: `linear-gradient(to left, transparent, ${revealed ? "#C9A84C" : "rgba(139,92,246,0.5)"})`,
          }}
        />
      </div>

      {/* Card Flip Container */}
      <div
        id={`Card-Placeholder-${index + 1}`}
        style={{ perspective: "1000px", width: "100%", maxWidth: "200px" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          id={`Card-Inner-${index + 1}`}
          style={{
            transformStyle: "preserve-3d",
            transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: `transform 0.75s cubic-bezier(0.4, 0.0, 0.2, 1) ${index * 0.18}s`,
            position: "relative",
            width: "100%",
            paddingBottom: "160%",
          }}
        >
          {/* Card Back */}
          <div
            id={`Card-Back-${index + 1}`}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              position: "absolute",
              inset: 0,
              borderRadius: "12px",
              background: "linear-gradient(145deg, #1A1A2E 0%, #16162A 50%, #0F0F1E 100%)",
              border: "1px solid rgba(139, 92, 246, 0.4)",
              boxShadow: hovered && !revealed
                ? "0 0 30px rgba(139, 92, 246, 0.3), 0 8px 32px rgba(0,0,0,0.6)"
                : "0 4px 24px rgba(0,0,0,0.5)",
              transition: "box-shadow 0.3s ease",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            {/* Back pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  rgba(139, 92, 246, 0.5) 0px,
                  rgba(139, 92, 246, 0.5) 1px,
                  transparent 1px,
                  transparent 12px
                )`,
              }}
            />
            {/* Border frame */}
            <div
              className="absolute"
              style={{
                inset: "10px",
                border: "1px solid rgba(139, 92, 246, 0.25)",
                borderRadius: "8px",
              }}
            />
            <div
              className="absolute"
              style={{
                inset: "14px",
                border: "1px solid rgba(201, 168, 76, 0.12)",
                borderRadius: "6px",
              }}
            />

            {/* Center symbol */}
            <div className="relative z-10 flex flex-col items-center" style={{ gap: "8px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(201,168,76,0.15))",
                  border: "1px solid rgba(139, 92, 246, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                }}
              >
                ✦
              </div>
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: "rgba(139, 92, 246, 0.6)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.3em",
                }}
              >
                ARCANA
              </span>
            </div>

            {/* Corner ornaments */}
            {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map(
              (pos, i) => (
                <span
                  key={i}
                  className={`absolute ${pos}`}
                  style={{ color: "rgba(201, 168, 76, 0.35)", fontSize: "10px" }}
                >
                  ✦
                </span>
              )
            )}
          </div>

          {/* Card Front */}
          <div
            id={`Card-Front-${index + 1}`}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              position: "absolute",
              inset: 0,
              borderRadius: "12px",
              background: "linear-gradient(145deg, #1E1830 0%, #1A1428 50%, #140E20 100%)",
              border: "1px solid rgba(201, 168, 76, 0.45)",
              boxShadow: revealed
                ? "0 0 35px rgba(201, 168, 76, 0.2), 0 8px 40px rgba(0,0,0,0.6)"
                : "none",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 16px",
            }}
          >
            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(201,168,76,0.8) 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />

            {/* Inner border frame */}
            <div
              className="absolute"
              style={{
                inset: "8px",
                border: "1px solid rgba(201, 168, 76, 0.2)",
                borderRadius: "8px",
                pointerEvents: "none",
              }}
            />

            {/* Top label */}
            <div className="relative z-10 w-full flex flex-col items-center" style={{ gap: "4px" }}>
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: "rgba(201, 168, 76, 0.6)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.25em",
                }}
              >
                {card.orientation === "reversed" ? "✦ REVERSED ✦" : "✦ UPRIGHT ✦"}
              </span>
            </div>

            {/* Central arcana symbol */}
            <div className="relative z-10 flex flex-col items-center" style={{ gap: "10px" }}>
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(201,168,76,0.2) 0%, rgba(139,92,246,0.15) 100%)",
                  border: "1.5px solid rgba(201, 168, 76, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  boxShadow: "0 0 20px rgba(201, 168, 76, 0.15)",
                }}
              >
                {card.symbol}
              </div>
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: "#C9A84C",
                  fontSize: "1rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textAlign: "center",
                }}
              >
                {card.name}
              </span>
              <span
                style={{
                  fontFamily: "'Raleway', sans-serif",
                  color: "rgba(226, 232, 240, 0.6)",
                  fontSize: "0.7rem",
                  textAlign: "center",
                  lineHeight: 1.5,
                  letterSpacing: "0.02em",
                }}
              >
                {card.meaning}
              </span>
            </div>

            {/* Keywords */}
            <div
              className="relative z-10 flex flex-wrap justify-center"
              style={{ gap: "4px" }}
            >
              {card.keywords.map((kw, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: "'Raleway', sans-serif",
                    backgroundColor: "rgba(139, 92, 246, 0.15)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    color: "rgba(167, 139, 250, 0.9)",
                    fontSize: "0.6rem",
                    padding: "2px 8px",
                    borderRadius: "20px",
                    letterSpacing: "0.06em",
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
