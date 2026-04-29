import React from "react";
import { CardPlaceholder, TarotCard } from "./card-placeholder";

interface ReadingBoardProps {
  mode: "idle" | "single" | "triple";
  cards: TarotCard[];
}

const SPREAD_INFO = {
  idle: { title: "Your Reading", subtitle: "Select a spread above to begin your reading" },
  single: { title: "Single Card Draw", subtitle: "One card to illuminate your present moment" },
  triple: { title: "Past · Present · Future", subtitle: "Three cards to reveal the arc of your journey" },
};

export function ReadingBoard({ mode, cards }: ReadingBoardProps) {
  const info = SPREAD_INFO[mode];

  const revealedMap: boolean[] = mode === "idle"
    ? [false, false, false]
    : mode === "single"
    ? [false, true, false]
    : [true, true, true];

  return (
    <section
      id="Reading-Board"
      className="w-full"
      style={{
        backgroundColor: "#121212",
        paddingTop: "80px",
        paddingBottom: "100px",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Board Header */}
        <div
          id="Board-Header"
          className="flex flex-col items-center"
          style={{ gap: "12px", marginBottom: "56px" }}
        >
          {/* Section tag */}
          <div
            id="Section-Tag"
            className="flex items-center"
            style={{ gap: "10px" }}
          >
            <div
              className="h-px w-12"
              style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.6))" }}
            />
            <span
              style={{
                fontFamily: "'Raleway', sans-serif",
                color: "rgba(201, 168, 76, 0.7)",
                fontSize: "0.7rem",
                letterSpacing: "0.25em",
                fontWeight: 600,
              }}
            >
              TAROT SPREAD
            </span>
            <div
              className="h-px w-12"
              style={{ background: "linear-gradient(to left, transparent, rgba(201,168,76,0.6))" }}
            />
          </div>

          <h2
            id="Board-Title"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              fontWeight: 600,
              color: "#E2E8F0",
              letterSpacing: "0.04em",
              textAlign: "center",
            }}
          >
            {info.title}
          </h2>
          <p
            id="Board-Subtitle"
            style={{
              fontFamily: "'Raleway', sans-serif",
              color: "rgba(226, 232, 240, 0.5)",
              fontSize: "0.95rem",
              letterSpacing: "0.02em",
              textAlign: "center",
            }}
          >
            {info.subtitle}
          </p>
        </div>

        {/* Card Spread Container */}
        <div
          id="Card-Spread-Container"
          className="relative w-full mx-auto"
          style={{ maxWidth: "820px" }}
        >
          {/* Ambient glow underneath */}
          <div
            className="absolute -inset-8 rounded-3xl opacity-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          {/* Board frame */}
          <div
            id="Board-Frame"
            className="relative rounded-2xl p-8 md:p-12"
            style={{
              background:
                "linear-gradient(145deg, rgba(26,26,46,0.6) 0%, rgba(20,20,38,0.8) 100%)",
              border: "1px solid rgba(201, 168, 76, 0.15)",
              boxShadow: "0 4px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {/* Corner ornaments */}
            {[
              "top-4 left-4",
              "top-4 right-4",
              "bottom-4 left-4",
              "bottom-4 right-4",
            ].map((pos, i) => (
              <span
                key={i}
                className={`absolute ${pos}`}
                style={{ color: "rgba(201, 168, 76, 0.25)", fontSize: "12px" }}
              >
                ✦
              </span>
            ))}

            {/* Cards row */}
            <div
              id="Cards-Row"
              className="flex flex-row items-stretch justify-center flex-wrap md:flex-nowrap"
              style={{ gap: "24px" }}
            >
              {cards.map((card, index) => (
                <CardPlaceholder
                  key={card.position}
                  card={card}
                  revealed={revealedMap[index]}
                  index={index}
                />
              ))}
            </div>

            {/* Connector lines between cards */}
            {mode !== "idle" && (
              <div
                id="Card-Connectors"
                className="hidden md:flex absolute"
                style={{
                  top: "50%",
                  left: "calc(33.33% + 0px)",
                  right: "calc(33.33% + 0px)",
                  height: "1px",
                  background:
                    "linear-gradient(to right, rgba(201,168,76,0.15), rgba(139,92,246,0.3), rgba(201,168,76,0.15))",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
            )}
          </div>
        </div>

        {/* Reading Insight Panel */}
        {mode !== "idle" && (
          <div
            id="Reading-Insight"
            className="mt-12 max-w-2xl mx-auto rounded-xl p-6 flex flex-col items-center"
            style={{
              background: "rgba(26, 20, 40, 0.7)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              gap: "12px",
            }}
          >
            <span style={{ color: "#8B5CF6", fontSize: "20px" }}>◈</span>
            <p
              id="Insight-Text"
              style={{
                fontFamily: "'Raleway', sans-serif",
                color: "rgba(226, 232, 240, 0.65)",
                fontSize: "0.9rem",
                lineHeight: 1.8,
                textAlign: "center",
                fontStyle: "italic",
                letterSpacing: "0.02em",
              }}
            >
              {mode === "single"
                ? "\"The present card reflects the energy that surrounds you now. Sit with its symbolism and allow its meaning to unfold within your own story.\""
                : "\"The three cards form a timeline of energy — what has shaped you, what you embody now, and where your path leads. Trust the wisdom of the spread.\""}
            </p>
            <div
              className="h-px w-24"
              style={{ background: "linear-gradient(to right, transparent, rgba(139,92,246,0.5), transparent)" }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
