import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Layout } from "../components/Layout";
import { GlobalNavBar } from "../components/GlobalNavBar";
import { TAROT_DECK, TarotCard } from "../data/tarot-data";
import { Sparkles, RotateCcw, X } from "lucide-react";

type DeckState = "stacked" | "splitting" | "spreading" | "interactive";
const REQUIRED = 3;

// ─── Card Back Pattern ─────────────────────────────────────────────────────────
function CardBack({
  width = 88, height = 138, glowColor = "rgba(139,92,246,0.3)",
  elevated = false, selected = false, selectionNum = 0, compact = false,
}: {
  width?: number; height?: number; glowColor?: string;
  elevated?: boolean; selected?: boolean; selectionNum?: number; compact?: boolean;
}) {
  const w = compact ? Math.round(width * 0.65) : width;
  const h = compact ? Math.round(height * 0.65) : height;

  return (
    <div style={{
      width: `${w}px`, height: `${h}px`, borderRadius: `${compact ? 6 : 9}px`,
      background: selected
        ? "linear-gradient(145deg, #2A1D4A 0%, #1E1235 100%)"
        : "linear-gradient(145deg, #161628 0%, #10101E 100%)",
      border: `${selected ? "1.5px" : "1px"} solid ${
        selected ? "#C9A84C" : elevated ? "rgba(139,92,246,0.5)" : "rgba(201,168,76,0.12)"
      }`,
      boxShadow: selected
        ? `0 0 18px rgba(201,168,76,0.4), 0 ${elevated ? 12 : 4}px 24px rgba(0,0,0,0.6)`
        : elevated
        ? `0 0 14px ${glowColor}, 0 10px 28px rgba(0,0,0,0.7)`
        : "0 2px 8px rgba(0,0,0,0.5)",
      position: "relative", overflow: "hidden", flexShrink: 0,
      transition: "box-shadow 0.25s ease, border-color 0.25s ease",
    }}>
      {/* Lattice pattern */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `repeating-linear-gradient(
          45deg, rgba(139,92,246,0.07) 0px, rgba(139,92,246,0.07) 1px,
          transparent 1px, transparent ${compact ? 6 : 9}px
        )`,
      }} />
      {/* Inner border */}
      <div style={{
        position: "absolute",
        inset: `${compact ? 3 : 5}px`,
        border: `0.5px solid rgba(201,168,76,${selected ? "0.3" : "0.1"})`,
        borderRadius: `${compact ? 4 : 6}px`,
        transition: "border-color 0.25s",
      }} />
      {/* Centre glyph */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontSize: `${compact ? 10 : 16}px`,
          color: selected ? "rgba(201,168,76,0.7)" : "rgba(139,92,246,0.35)",
          userSelect: "none", lineHeight: 1,
        }}>✦</span>
      </div>
      {/* Corner ornaments */}
      {!compact && (
        <>
          <div style={{ position: "absolute", top: "10px", left: "10px", width: "12px", height: "12px", borderTop: "1px solid rgba(201,168,76,0.2)", borderLeft: "1px solid rgba(201,168,76,0.2)", borderRadius: "2px 0 0 0" }} />
          <div style={{ position: "absolute", top: "10px", right: "10px", width: "12px", height: "12px", borderTop: "1px solid rgba(201,168,76,0.2)", borderRight: "1px solid rgba(201,168,76,0.2)", borderRadius: "0 2px 0 0" }} />
          <div style={{ position: "absolute", bottom: "10px", left: "10px", width: "12px", height: "12px", borderBottom: "1px solid rgba(201,168,76,0.2)", borderLeft: "1px solid rgba(201,168,76,0.2)", borderRadius: "0 0 0 2px" }} />
          <div style={{ position: "absolute", bottom: "10px", right: "10px", width: "12px", height: "12px", borderBottom: "1px solid rgba(201,168,76,0.2)", borderRight: "1px solid rgba(201,168,76,0.2)", borderRadius: "0 0 2px 0" }} />
        </>
      )}
      {/* Selection badge */}
      {selected && (
        <div style={{
          position: "absolute", top: compact ? "4px" : "6px", right: compact ? "4px" : "6px",
          width: compact ? "14px" : "18px", height: compact ? "14px" : "18px",
          borderRadius: "50%", background: "#C9A84C",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: compact ? "7px" : "9px", color: "#0A0A12", fontWeight: 700,
          boxShadow: "0 0 8px rgba(201,168,76,0.5)",
        }}>{selectionNum}</div>
      )}
    </div>
  );
}

// ─── State 1: Stacked Deck ────────────────────────────────────────────────────
function StackedDeck({ onBegin }: { onBegin: () => void }) {
  const [hoverBtn, setHoverBtn] = useState(false);

  return (
    <div
      id="Deck-State-Stacked"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: "48px", minHeight: "480px",
        animation: "fadeIn 0.6s ease",
      }}
    >
      {/* 3D Stack Visual */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0" }}>
        <p style={{
          fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.3)",
          fontSize: "0.72rem", letterSpacing: "0.18em", marginBottom: "32px",
        }}>
          ─ 78 CARDS AWAIT ─
        </p>

        <div style={{ position: "relative", width: "110px", height: "170px" }}>
          {/* Shadow base */}
          <div style={{
            position: "absolute", bottom: "-20px", left: "50%",
            transform: "translateX(-50%)",
            width: "90px", height: "20px", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, transparent 70%)",
          }} />

          {/* Stack layers — rendered back to front */}
          {[...Array(14)].map((_, i) => {
            const isTop = i === 13;
            const fromTop = 13 - i;
            return (
              <div key={i} style={{
                position: "absolute",
                bottom: `${i * 2}px`,
                left: `${fromTop * 1.2}px`,
                width: "110px", height: "170px",
                borderRadius: "9px",
                background: isTop
                  ? "linear-gradient(145deg, #1E1832 0%, #16122A 100%)"
                  : `linear-gradient(145deg, hsl(240,${15 + i}%,${8 + i * 0.5}%) 0%, hsl(240,${12+i}%,${6+i*0.4}%) 100%)`,
                border: isTop
                  ? "1px solid rgba(201,168,76,0.2)"
                  : `1px solid rgba(201,168,76,${0.04 + i * 0.005})`,
                zIndex: i,
                boxShadow: isTop
                  ? "0 -4px 20px rgba(139,92,246,0.12)"
                  : "none",
                overflow: "hidden",
              }}>
                {isTop && (
                  <>
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg,rgba(139,92,246,0.07) 0px,rgba(139,92,246,0.07) 1px,transparent 1px,transparent 9px)" }} />
                    <div style={{ position: "absolute", inset: "7px", border: "0.5px solid rgba(201,168,76,0.15)", borderRadius: "6px" }} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "rgba(139,92,246,0.4)" }}>✦</div>
                    {/* Corner ornaments */}
                    <div style={{ position: "absolute", top: "12px", left: "12px", width: "14px", height: "14px", borderTop: "1px solid rgba(201,168,76,0.25)", borderLeft: "1px solid rgba(201,168,76,0.25)", borderRadius: "2px 0 0 0" }} />
                    <div style={{ position: "absolute", top: "12px", right: "12px", width: "14px", height: "14px", borderTop: "1px solid rgba(201,168,76,0.25)", borderRight: "1px solid rgba(201,168,76,0.25)", borderRadius: "0 2px 0 0" }} />
                    <div style={{ position: "absolute", bottom: "12px", left: "12px", width: "14px", height: "14px", borderBottom: "1px solid rgba(201,168,76,0.25)", borderLeft: "1px solid rgba(201,168,76,0.25)", borderRadius: "0 0 0 2px" }} />
                    <div style={{ position: "absolute", bottom: "12px", right: "12px", width: "14px", height: "14px", borderBottom: "1px solid rgba(201,168,76,0.25)", borderRight: "1px solid rgba(201,168,76,0.25)", borderRadius: "0 0 2px 0" }} />
                  </>
                )}
              </div>
            );
          })}
        </div>

        <p style={{ fontFamily: "'Cinzel', serif", color: "rgba(201,168,76,0.5)", fontSize: "0.75rem", letterSpacing: "0.12em", marginTop: "28px" }}>
          The full tarot deck, unified and waiting
        </p>
      </div>

      {/* Begin Button */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <button
          id="Begin-Draw-Button"
          onClick={onBegin}
          onMouseEnter={() => setHoverBtn(true)}
          onMouseLeave={() => setHoverBtn(false)}
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            background: hoverBtn
              ? "linear-gradient(135deg, #D4B85C, #B8942A)"
              : "linear-gradient(135deg, #C9A84C, #A8873A)",
            border: "none", borderRadius: "50px",
            padding: "16px 44px", color: "#0A0A12",
            fontFamily: "'Cinzel', serif", fontSize: "1rem",
            fontWeight: 600, letterSpacing: "0.1em", cursor: "pointer",
            transition: "all 0.25s ease",
            boxShadow: hoverBtn
              ? "0 0 60px rgba(201,168,76,0.5), 0 12px 32px rgba(0,0,0,0.5)"
              : "0 0 40px rgba(201,168,76,0.3), 0 6px 24px rgba(0,0,0,0.4)",
            transform: hoverBtn ? "translateY(-2px)" : "none",
            animation: "pulseGold 2.5s ease-in-out infinite",
          }}
        >
          <Sparkles size={18} />
          Begin Your Draw
        </button>
        <p style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.25)", fontSize: "0.75rem", letterSpacing: "0.06em" }}>
          The deck will be split for you to draw from
        </p>
      </div>
    </div>
  );
}

// ─── Single Pile Stack (pure flexbox, no absolute positioning) ───────────────
function PileStack({ id, label, subLabel, animClass, delay, cards }: {
  id: string; label: string; subLabel: string;
  animClass: string; delay: number; cards: number;
}) {
  const CARD_W = 82;
  const CARD_H = 128;
  // Overlap: each subsequent card shows only 12px of itself below the previous
  const VISIBLE_STRIP = 12;
  const MARGIN_TOP = -(CARD_H - VISIBLE_STRIP); // e.g. -116px

  return (
    <div
      id={id}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
        opacity: 0,
        animation: `${animClass} 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms forwards`,
      }}
    >
      {/* ── Pile frame: vertical Auto Layout, gap set to negative MARGIN_TOP ── */}
      <div
        id={`${id}-Stack`}
        style={{
          // Spread-container child — no absolute positioning inside
          display: "flex",
          flexDirection: "column",  // "First on top" — index 0 rendered at top
          alignItems: "center",
          // Width matches the card; height auto-hugs the pile
          width: `${CARD_W}px`,
        }}
      >
        {[...Array(cards)].map((_, i) => {
          const isTopCard = i === 0;
          return (
            <div
              key={i}
              style={{
                // ── Negative margin creates the physical overlap ──
                // -116px means each card overlaps the one above it,
                // leaving only VISIBLE_STRIP px of itself exposed at the bottom
                marginTop: i === 0 ? 0 : `${MARGIN_TOP}px`,
                // "First on top" stacking: card 0 has highest z-index
                zIndex: cards - i,
                flexShrink: 0,
                width: `${CARD_W}px`,
                height: `${CARD_H}px`,
                borderRadius: "7px",
                background: isTopCard
                  ? "linear-gradient(145deg, #1E1832, #16122A)"
                  : `linear-gradient(145deg, hsl(240,${10+i*0.4}%,${7+i*0.25}%) 0%, hsl(240,${8+i*0.3}%,${5+i*0.2}%) 100%)`,
                border: `1px solid rgba(201,168,76,${isTopCard ? "0.22" : 0.025 + i * 0.003})`,
                boxShadow: isTopCard ? "0 -3px 18px rgba(139,92,246,0.12), 0 4px 12px rgba(0,0,0,0.5)" : "none",
                overflow: "hidden",
                transition: "transform 0.2s ease",
              }}
            >
              {isTopCard && (
                <>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg,rgba(139,92,246,0.08) 0px,rgba(139,92,246,0.08) 1px,transparent 1px,transparent 7px)" }} />
                  <div style={{ position: "absolute", inset: "6px", border: "0.5px solid rgba(201,168,76,0.14)", borderRadius: "4px" }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", color: "rgba(139,92,246,0.38)" }}>✦</div>
                  {/* Corner ornaments on top card */}
                  <div style={{ position: "absolute", top: "8px", left: "8px", width: "10px", height: "10px", borderTop: "0.5px solid rgba(201,168,76,0.22)", borderLeft: "0.5px solid rgba(201,168,76,0.22)" }} />
                  <div style={{ position: "absolute", top: "8px", right: "8px", width: "10px", height: "10px", borderTop: "0.5px solid rgba(201,168,76,0.22)", borderRight: "0.5px solid rgba(201,168,76,0.22)" }} />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Pile label */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
        <span style={{ fontFamily: "'Cinzel', serif", color: "rgba(201,168,76,0.65)", fontSize: "0.82rem", letterSpacing: "0.12em" }}>{label}</span>
        <span style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.22)", fontSize: "0.63rem", letterSpacing: "0.04em" }}>{subLabel}</span>
      </div>
    </div>
  );
}

// ─── State 2: Splitting Deck (pure flexbox hierarchy) ─────────────────────────
function SplittingDeck() {
  const PILE_DEFS = [
    { id: "Pile-Left",   label: "I",   subLabel: "26 cards", animClass: "splitLeft",  delay: 0   },
    { id: "Pile-Center", label: "II",  subLabel: "26 cards", animClass: "splitUp",    delay: 90  },
    { id: "Pile-Right",  label: "III", subLabel: "26 cards", animClass: "splitRight", delay: 45  },
  ];

  return (
    <div
      id="Deck-State-Splitting"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "48px",
        minHeight: "480px", justifyContent: "center",
        animation: "fadeIn 0.4s ease",
      }}
    >
      <p style={{ fontFamily: "'Cinzel', serif", color: "rgba(201,168,76,0.6)", fontSize: "0.8rem", letterSpacing: "0.2em" }}>
        ─ CUTTING THE DECK ─
      </p>

      {/* ════════════════════════════════════════════════════════
          Spread-Container (Prompt spec):
          direction: horizontal | align: center | gap: 120px
          Contains 3 Pile components (Pile-Left, Pile-Center, Pile-Right).
          NO absolute positioning inside any pile.
          ════════════════════════════════════════════════════════ */}
      <div
        id="Spread-Container"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "center",
          // 120px gap clearly separates the 3 distinct piles
          gap: "120px",
          // Overflow visible so tall piles don't clip
          overflow: "visible",
        }}
      >
        {PILE_DEFS.map((p) => (
          <PileStack
            key={p.id}
            id={p.id}
            label={p.label}
            subLabel={p.subLabel}
            animClass={p.animClass}
            delay={p.delay}
            cards={26}
          />
        ))}
      </div>

      <p style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.3)", fontSize: "0.78rem", animation: "pulse 1s ease infinite alternate", letterSpacing: "0.06em" }}>
        Shuffling and splitting...
      </p>
    </div>
  );
}

// ─── State 3: Spreading Deck ──────────────────────────────────────────────────
function SpreadingDeck() {
  return (
    <div
      id="Deck-State-Spreading"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "36px", minHeight: "480px", justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <p style={{ fontFamily: "'Cinzel', serif", color: "rgba(201,168,76,0.6)", fontSize: "0.82rem", letterSpacing: "0.18em" }}>
        ─ CARDS ARE SPREADING ─
      </p>

      {/* Fan/spread visual — overlapping cards in a wide arc */}
      <div style={{
        position: "relative", width: "100%", maxWidth: "700px",
        height: "200px", display: "flex", alignItems: "flex-end",
        justifyContent: "center",
      }}>
        {[...Array(24)].map((_, i) => {
          const total = 24;
          const angleRange = 60;
          const angle = -angleRange/2 + (i / (total - 1)) * angleRange;
          const radius = 360;
          const x = Math.sin((angle * Math.PI) / 180) * radius;
          const y = -Math.cos((angle * Math.PI) / 180) * radius + radius - 80;

          return (
            <div key={i} style={{
              position: "absolute",
              bottom: "0",
              left: "50%",
              transform: `translateX(calc(-50% + ${x}px)) translateY(${y}px) rotate(${angle}deg)`,
              animation: `spreadCard 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 20}ms both`,
              zIndex: i,
            }}>
              <CardBack width={55} height={86} compact={false} />
            </div>
          );
        })}
      </div>

      <p style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.35)", fontSize: "0.8rem", animation: "pulse 0.9s ease infinite alternate" }}>
        Preparing your selection...
      </p>
    </div>
  );
}

// ─── Arc Row Card ─────────────────────────────────────────────────────────────
function ArcCard({
  card, globalIndex, arcOffsetY, selected, selectionOrder, disabled, onToggle,
}: {
  card: TarotCard; globalIndex: number; arcOffsetY: number;
  selected: boolean; selectionOrder: number; disabled: boolean;
  onToggle: (id: number) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      id={`Arc-Card-${card.id}`}
      onClick={() => !disabled && onToggle(card.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`Card ${globalIndex + 1}`}
      style={{
        position: "relative", flexShrink: 0,
        cursor: disabled && !selected ? "not-allowed" : "pointer",
        marginLeft: globalIndex % 26 === 0 ? 0 : "-42px",
        // Arc offset + hover lift + selection lift, all combined
        transform: `translateY(${arcOffsetY + (selected ? -22 : hovered && !disabled ? -18 : 0)}px)`,
        transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        zIndex: selected ? 60 : hovered ? 50 : globalIndex % 26,
        opacity: disabled && !selected ? 0.35 : 1,
      }}
    >
      <CardBack
        width={66} height={102}
        glowColor={hovered ? "rgba(139,92,246,0.45)" : "rgba(201,168,76,0.2)"}
        elevated={hovered || selected}
        selected={selected}
        selectionNum={selectionOrder}
      />
    </div>
  );
}

// ─── Curved 3-Row Spread ──────────────────────────────────────────────────────
function CurvedSpread({
  deck, selectedIds, onToggle,
}: {
  deck: TarotCard[]; selectedIds: number[]; onToggle: (id: number) => void;
}) {
  const allSelected = selectedIds.length >= REQUIRED;
  // Split into 3 rows of 26 cards each
  const rows = [deck.slice(0, 26), deck.slice(26, 52), deck.slice(52, 78)];

  // Arc offset: middle cards are highest (offset 0), edges drop down
  // amplitude varies per row for visual variety
  const ARC_AMPLITUDES = [28, 22, 30];
  const getArcOffset = (i: number, n: number, amplitude: number) => {
    const normalized = i / (n - 1);
    return amplitude * 4 * Math.pow(normalized - 0.5, 2);
  };

  return (
    <div
      id="Curved-Spread"
      style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", animation: "fadeIn 0.5s ease" }}
    >
      <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.32)", fontSize: "0.77rem", textAlign: "center", letterSpacing: "0.04em" }}>
        Let your intuition guide you — hover and click to select.
        <span style={{ color: "rgba(201,168,76,0.5)" }}> Choose {REQUIRED} cards.</span>
      </p>

      {rows.map((row, rowIndex) => {
        const amplitude = ARC_AMPLITUDES[rowIndex];
        const n = row.length;

        return (
          <div
            key={rowIndex}
            id={`Arc-Row-${rowIndex + 1}`}
            style={{
              position: "relative",
              // Extra bottom padding to accommodate the arc's downward curve
              paddingBottom: `${amplitude + 18}px`,
              paddingTop: "10px",
              // Stagger rows slightly horizontally for depth feel
              paddingLeft: `${rowIndex * 12}px`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                overflowX: "auto",
                WebkitOverflowScrolling: "touch" as any,
                paddingLeft: "20px",
                paddingRight: "20px",
                // Hide scrollbar but keep functionality
                msOverflowStyle: "none",
                scrollbarWidth: "none" as any,
              }}
            >
              {row.map((card, colIndex) => {
                const arcY = getArcOffset(colIndex, n, amplitude);
                const globalIndex = rowIndex * 26 + colIndex;

                return (
                  <ArcCard
                    key={card.id}
                    card={card}
                    globalIndex={globalIndex}
                    arcOffsetY={arcY}
                    selected={selectedIds.includes(card.id)}
                    selectionOrder={selectedIds.indexOf(card.id) + 1}
                    disabled={!selectedIds.includes(card.id) && allSelected}
                    onToggle={onToggle}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Deck Page ───────────────────────────────────────────────────────────
export default function DeckPage() {
  const { readingSetup, setSelectedCards } = useApp();
  const navigate = useNavigate();

  const [deckState, setDeckState] = useState<DeckState>("stacked");
  const [deck, setDeck] = useState<TarotCard[]>(() => {
    const arr = [...TAROT_DECK];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const POSITIONS = ["Past", "Present", "Future"];

  // Advance through animation states
  const handleBegin = () => {
    setDeckState("splitting");
    setTimeout(() => { setDeckState("spreading"); }, 1000);
    setTimeout(() => { setDeckState("interactive"); }, 2200);
  };

  const handleToggle = useCallback((id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= REQUIRED) return prev;
      return [...prev, id];
    });
  }, []);

  const handleRemoveCard = (idx: number) => {
    setSelectedIds((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleReset = () => {
    setSelectedIds([]);
    setDeckState("stacked");
    setDeck((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  };

  const handleReveal = () => {
    if (selectedIds.length < REQUIRED) return;
    const cards = selectedIds.map((id) => TAROT_DECK.find((c) => c.id === id)!);
    setSelectedCards(cards);
    navigate("/reading");
  };

  const allSelected = selectedIds.length >= REQUIRED;
  const selectedCards = selectedIds.map((id) => deck.find((c) => c.id === id) ?? null);

  return (
    <Layout step={2}>
      <div
        id="Deck-Page"
        style={{
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "#080810",
          backgroundImage: `
            radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.07) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(201,168,76,0.04) 0%, transparent 40%)
          `,
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          id="Deck-Header"
          style={{
            padding: "36px 24px 20px",
            maxWidth: "1200px", margin: "0 auto", width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ height: "1px", width: "32px", background: "linear-gradient(to right, transparent, rgba(201,168,76,0.5))" }} />
                <span style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(201,168,76,0.6)", fontSize: "0.68rem", letterSpacing: "0.22em", fontWeight: 600 }}>STEP 2 OF 3 · DRAW YOUR CARDS</span>
              </div>
              <h1 style={{ fontFamily: "'Cinzel', serif", color: "#F0E6D3", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 600, letterSpacing: "0.04em" }}>
                Select Your Three Cards
              </h1>
              {readingSetup && (
                <p style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.35)", fontSize: "0.82rem" }}>
                  Reading for: <span style={{ color: "rgba(201,168,76,0.55)" }}>"{readingSetup.question}"</span>
                </p>
              )}
            </div>

            {deckState === "interactive" && (
              <button
                id="Reset-Button"
                onClick={handleReset}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(240,230,211,0.1)",
                  borderRadius: "8px", padding: "8px 14px",
                  color: "rgba(240,230,211,0.4)", cursor: "pointer",
                  fontFamily: "'Raleway', sans-serif", fontSize: "0.78rem",
                  letterSpacing: "0.04em", transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#C9A84C"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.3)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,230,211,0.4)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,230,211,0.1)"; }}
              >
                <RotateCcw size={13} />
                Restart Draw
              </button>
            )}
          </div>
        </div>

        {/* Selected Cards Tray */}
        {deckState === "interactive" && (
          <div
            id="Selected-Cards-Tray"
            style={{
              padding: "16px 24px",
              maxWidth: "1200px", margin: "0 auto", width: "100%",
              display: "flex", flexDirection: "column", gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{
                fontFamily: "'Cinzel', serif", color: selectedIds.length > 0 ? "#C9A84C" : "rgba(240,230,211,0.3)",
                fontSize: "0.72rem", letterSpacing: "0.18em", transition: "color 0.3s",
              }}>
                SELECTED CARDS
              </span>
              <div style={{ height: "1px", flex: 1, background: "rgba(240,230,211,0.07)" }} />
              <span style={{
                fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.3)",
                fontSize: "0.7rem", letterSpacing: "0.08em",
              }}>
                {selectedIds.length}/{REQUIRED}
              </span>
            </div>

            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              {POSITIONS.map((pos, i) => (
                <SelectedSlot
                  key={pos}
                  position={pos}
                  card={selectedCards[i] ?? null}
                  onRemove={selectedCards[i] ? () => handleRemoveCard(i) : undefined}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ height: "2px", background: "rgba(240,230,211,0.06)", borderRadius: "2px", overflow: "hidden", marginTop: "4px" }}>
              <div style={{
                height: "100%", width: `${(selectedIds.length / REQUIRED) * 100}%`,
                background: allSelected
                  ? "linear-gradient(to right, #C9A84C, #E2C97E)"
                  : "rgba(139,92,246,0.7)",
                borderRadius: "2px", transition: "width 0.35s ease, background 0.35s ease",
              }} />
            </div>
          </div>
        )}

        {/* ── Deck Stage ── */}
        <div
          id="Deck-Stage"
          style={{
            flex: 1, padding: "0 24px 32px",
            maxWidth: "1200px", margin: "0 auto", width: "100%",
            display: "flex", alignItems: deckState !== "interactive" ? "center" : "flex-start",
            justifyContent: deckState !== "interactive" ? "center" : "flex-start",
            flexDirection: "column",
          }}
        >
          {deckState === "stacked" && <StackedDeck onBegin={handleBegin} />}
          {deckState === "splitting" && <SplittingDeck />}
          {deckState === "spreading" && <SpreadingDeck />}
          {deckState === "interactive" && (
            <CurvedSpread
              deck={deck}
              selectedIds={selectedIds}
              onToggle={handleToggle}
            />
          )}
        </div>

        {/* ── Global Navigation Bar — Back / Reveal ── */}
        {deckState === "interactive" && (
          <GlobalNavBar
            onBack={() => navigate("/setup")}
            onNext={handleReveal}
            nextDisabled={!allSelected}
            nextLabel={allSelected ? "✦ Reveal My Fate" : `Choose ${REQUIRED - selectedIds.length} more card${REQUIRED - selectedIds.length !== 1 ? "s" : ""}`}
            helperText={allSelected ? "Your three cards are chosen — the veil is ready to lift" : undefined}
          />
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes splitLeft {
          from { opacity: 0; transform: translateX(60px) scale(0.9); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes splitRight {
          from { opacity: 0; transform: translateX(-60px) scale(0.9); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes splitUp {
          from { opacity: 0; transform: translateY(-30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spreadCard {
          from { opacity: 0; transform: translateX(0) translateY(60px) rotate(0deg); }
          to   { opacity: 1; }
        }
        @keyframes pulse {
          from { opacity: 0.4; } to { opacity: 0.8; }
        }
        @keyframes pulseGold {
          0%, 100% { box-shadow: 0 0 32px rgba(201,168,76,0.35), 0 4px 16px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 48px rgba(201,168,76,0.55), 0 4px 16px rgba(0,0,0,0.4); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.7) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </Layout>
  );
}