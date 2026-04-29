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
  const { readingSetup, setSelectedCards } = useApp();
  const navigate = useNavigate();

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
    const cards = selectedIds.map((id) => TAROT_DECK.find((c) => c.id === id)!);
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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <SectionTag text="STEP 2 OF 3 · DRAW YOUR CARDS" centered={false} />
              <h1
                className="text-[clamp(1.4rem,3vw,2rem)] font-semibold tracking-[0.04em]"
                style={{ fontFamily: "'Cinzel', serif", color: "#F0E6D3" }}
              >
                Select Your Three Cards
              </h1>
              {readingSetup && (
                <p
                  className="text-[0.82rem]"
                  style={{
                    fontFamily: "'Raleway', sans-serif",
                    color: "rgba(240,230,211,0.35)",
                  }}
                >
                  Reading for:{" "}
                  <span style={{ color: "rgba(201,168,76,0.55)" }}>
                    "{readingSetup.question}"
                  </span>
                </p>
              )}
            </div>

            {deckState === "interactive" && (
              <button
                id="Reset-Button"
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-[0.78rem] tracking-[0.04em] transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(240,230,211,0.1)",
                  color: "rgba(240,230,211,0.4)",
                  fontFamily: "'Raleway', sans-serif",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#C9A84C";
                  e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(240,230,211,0.4)";
                  e.currentTarget.style.borderColor = "rgba(240,230,211,0.1)";
                }}
              >
                <RotateCcw size={13} />
                Restart Draw
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
          className={`mx-auto flex w-full max-w-[1200px] flex-col px-6 pb-8 ${
            deckState !== "interactive" ? "flex-1 items-center justify-center" : "items-start justify-start"
          }`}
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
                ? "✦ Reveal My Fate"
                : `Choose ${REQUIRED - selectedIds.length} more card${
                    REQUIRED - selectedIds.length !== 1 ? "s" : ""
                  }`
            }
            helperText={
              allSelected
                ? "Your three cards are chosen — the veil is ready to lift"
                : undefined
            }
          />
        )}
      </div>
    </Layout>
  );
}