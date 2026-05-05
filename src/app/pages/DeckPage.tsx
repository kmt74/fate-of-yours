import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { RotateCcw } from "lucide-react";

// ─── Context & Data ───────────────────────────────────────────────────────────
import { useApp } from "../context/AppContext";
import { TAROT_DECK, TarotCard } from "../data/tarot-data";

// ─── Layout ───────────────────────────────────────────────────────────────────
import { Layout } from "../components/Layout";
import { GlobalNavBar } from "../components/GlobalNavBar";

// ─── Shared UI Primitives ─────────────────────────────────────────────────────
import { SectionTag } from "../components/ui/SectionTag";
import { useLocale } from "../../hooks/useLocale";

// ─── Deck Sub-Components ──────────────────────────────────────────────────────
import { StackedDeck } from "../components/deck/StackedDeck";
import { SplittingDeck } from "../components/deck/SplittingDeck";
import { SpreadingDeck } from "../components/deck/SpreadingDeck";
import { CurvedSpread } from "../components/deck/CurvedSpread";
import { SelectedCardsTray } from "../components/deck/SelectedCardsTray";

// ─── Constants ────────────────────────────────────────────────────────────────
const REQUIRED = 3;

type DeckState = "stacked" | "splitting" | "spreading" | "interactive";

export default function DeckPage() {
  const { readingSetup, setSelectedCards, language } = useApp();
  const navigate = useNavigate();
  const t = useLocale();

  const HEADING_FONT = language === "VI" ? "'Playfair Display', serif" : "'Cinzel', serif";

  // ─── State ──────────────────────────────────────────────────────────────────
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

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleBegin = () => {
    setDeckState("splitting");
    setTimeout(() => setDeckState("spreading"), 1000);
    setTimeout(() => setDeckState("interactive"), 2200);
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
    const cards = selectedIds.map((id) => {
      const card = { ...TAROT_DECK.find((c) => c.id === id)! };
      // 1/3 probability for reversed
      card.orientation = Math.random() < 1 / 3 ? "reversed" : "upright";
      return card;
    });
    setSelectedCards(cards);
    navigate("/reading");
  };

  // ─── Derived Data ───────────────────────────────────────────────────────────
  const allSelected = selectedIds.length >= REQUIRED;
  const selectedCards = selectedIds.map((id) => deck.find((c) => c.id === id) ?? null);

  return (
    <Layout step={2}>
      <div
        id="Deck-Page"
        className="flex flex-col"
        style={{
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "#080810",
          backgroundImage: `
            radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.07) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(201,168,76,0.04) 0%, transparent 40%)
          `,
        }}
      >
        {/* ── Header ── */}
        <header
          id="Deck-Header"
          className="mx-auto w-full max-w-[1200px] px-6 py-9"
        >
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <SectionTag text={t.deck.step} centered={true} />
              <h1
                className="text-[clamp(1.6rem,4vw,2.4rem)] font-semibold tracking-[0.04em]"
                style={{ fontFamily: HEADING_FONT, color: "#F0E6D3" }}
              >
                {t.deck.heading}
              </h1>
              {readingSetup && (
                <p
                  className="text-[0.85rem]"
                  style={{
                    fontFamily: "'Raleway', sans-serif",
                    color: "rgba(240,230,211,0.35)",
                  }}
                >
                  {t.deck.readingFor}{" "}
                  <span style={{ color: "rgba(201,168,76,0.6)" }}>
                    "{readingSetup.question}"
                  </span>
                </p>
              )}
            </div>

            {deckState === "interactive" && (
              <button
                id="Reset-Button"
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[0.78rem] tracking-[0.04em] transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(240,230,211,0.12)",
                  color: "rgba(240,230,211,0.5)",
                  fontFamily: "'Raleway', sans-serif",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#C9A84C";
                  e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)";
                  e.currentTarget.style.background = "rgba(201,168,76,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(240,230,211,0.5)";
                  e.currentTarget.style.borderColor = "rgba(240,230,211,0.12)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
              >
                <RotateCcw size={13} />
                {t.deck.restart}
              </button>
            )}
          </div>
        </header>


        {/* ── Selected Cards Tray ── */}
        {deckState === "interactive" && (
          <SelectedCardsTray
            selectedIds={selectedIds}
            selectedCards={selectedCards}
            onRemoveCard={handleRemoveCard}
          />
        )}

        {/* ── Deck Stage ── */}
        <div
          id="Deck-Stage"
          className={`mx-auto flex w-full max-w-[1400px] flex-col px-6 pb-8 items-center justify-center`}
          style={{ overflow: "visible" }}
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

        {/* ── Global Navigation Bar ── */}
        {deckState === "interactive" && (
          <GlobalNavBar
            onBack={() => navigate("/setup")}
            onNext={handleReveal}
            nextDisabled={!allSelected}
            nextLabel={
              allSelected
                ? t.deck.revealBtn
                : selectedIds.length === 2 
                  ? t.deck.chooseOne 
                  : t.deck.chooseMore.replace("{n}", String(REQUIRED - selectedIds.length))
            }
            helperText={
              allSelected
                ? t.deck.readyHint
                : undefined
            }
          />
        )}
      </div>
    </Layout>
  );
}