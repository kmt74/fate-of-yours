import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { RefreshCw } from "lucide-react";

// ─── Context & Data ───────────────────────────────────────────────────────────
import { useApp } from "../context/AppContext";
import { CATEGORIES, generateInterpretation } from "../data/tarot-data";

// ─── Layout ───────────────────────────────────────────────────────────────────
import { Layout } from "../components/Layout";
import { GlobalNavBar } from "../components/GlobalNavBar";

// ─── Shared UI Primitives ─────────────────────────────────────────────────────
import { SectionTag } from "../components/ui/SectionTag";

// ─── Reading Sub-Components ───────────────────────────────────────────────────
import { RevealedTarotCard } from "../components/reading/RevealedTarotCard";
import { ReadingContextCard } from "../components/reading/ReadingContextCard";
import { AiInterpretationPanel } from "../components/reading/AiInterpretationPanel";

// ─── Custom Hooks ─────────────────────────────────────────────────────────────
import { useTypewriter } from "../hooks/useTypewriter";
import { useCardReveal } from "../hooks/useCardReveal";

// ─── Constants ────────────────────────────────────────────────────────────────
import { POSITIONS } from "../lib/theme";
import type { Position } from "../lib/theme";

// ─── Reading Page ─────────────────────────────────────────────────────────────
// Figma Layer Hierarchy:
//   Layout (step=3)
//     └─ Reading-Page
//         ├─ Reading-Header (SectionTag + ReadingContextCard)
//         ├─ Card-Reveal-Section (3x RevealedTarotCard)
//         ├─ AI-Interpretation-Section (AiInterpretationPanel)
//         └─ Reading-Actions (New Reading button)
//     └─ GlobalNavBar

export default function ReadingPage() {
  const { readingSetup, selectedCards, resetReading } = useApp();
  const navigate = useNavigate();

  // ─── Derived Data ─────────────────────────────────────────────────────────
  const category = readingSetup?.category ?? "general";
  const question = readingSetup?.question ?? "What does my journey hold?";
  const categoryObj = CATEGORIES.find((c) => c.id === category);

  const fullText =
    selectedCards.length === 3
      ? generateInterpretation(selectedCards, category, question)
      : "";

  // ─── State (via custom hooks) ─────────────────────────────────────────────
  const cardsRevealed = useCardReveal(400);
  const [aiLoading, setAiLoading] = useState(true);

  // Wait for card flip animation to complete before showing AI content
  useEffect(() => {
    if (!cardsRevealed) return;
    const timer = setTimeout(() => setAiLoading(false), 3200);
    return () => clearTimeout(timer);
  }, [cardsRevealed]);

  const { displayedText, isDone: typingDone } = useTypewriter({
    text: fullText,
    speed: 12,
    enabled: !aiLoading,
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleNewReading = () => {
    resetReading();
    navigate("/setup");
  };

  // ─── Guard: not enough cards ──────────────────────────────────────────────
  if (selectedCards.length < 3) {
    return (
      <Layout step={3}>
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
          <button
            onClick={() => navigate("/deck")}
            className="rounded-[10px] px-6 py-3"
            style={{
              fontFamily: "'Raleway', sans-serif",
              background: "none",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "#C9A84C",
              cursor: "pointer",
            }}
          >
            Return to Deck
          </button>
        </div>
      </Layout>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Layout step={3}>
      <div
        id="Reading-Page"
        className="px-6 pb-20 pt-12"
        style={{
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "#0A0A12",
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.07) 0%, transparent 55%)",
        }}
      >
        <div className="mx-auto flex max-w-[820px] flex-col gap-11">
          {/* ── Reading Header ── */}
          <header
            id="Reading-Header"
            className="flex flex-col gap-4"
          >
            <SectionTag text="STEP 3 OF 3 · YOUR READING" centered={false} />
            {categoryObj && (
              <ReadingContextCard
                category={categoryObj}
                question={question}
              />
            )}
          </header>

          {/* ── Card Reveal Section ── */}
          <section
            id="Card-Reveal-Section"
            className="flex flex-col gap-5"
          >
            <h2
              className="text-[0.78rem] font-semibold tracking-[0.2em]"
              style={{
                fontFamily: "'Cinzel', serif",
                color: "rgba(201,168,76,0.7)",
              }}
            >
              YOUR THREE CARDS
            </h2>

            <div
              id="Cards-Row"
              className="flex flex-wrap justify-center gap-5"
            >
              {selectedCards.map((card, i) => (
                <RevealedTarotCard
                  key={card.id}
                  card={card}
                  position={POSITIONS[i] as Position}
                  positionIndex={i}
                  revealed={cardsRevealed}
                  delay={i * 300}
                />
              ))}
            </div>
          </section>

          {/* ── AI Interpretation ── */}
          <AiInterpretationPanel
            isLoading={aiLoading}
            displayedText={displayedText}
            fullText={fullText}
            isTypingDone={typingDone}
          />

          {/* ── Actions ── */}
          {typingDone && (
            <div
              id="Reading-Actions"
              className="flex flex-wrap justify-center gap-3.5"
              style={{ animation: "fadeSlideUp 0.5s ease" }}
            >
              <button
                id="New-Reading-Button"
                onClick={handleNewReading}
                className="flex items-center gap-2 rounded-full px-7 py-3 text-[0.88rem] font-semibold tracking-[0.08em] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(201,168,76,0.18)]"
                style={{
                  background: "transparent",
                  border: "1.5px solid rgba(201,168,76,0.35)",
                  color: "#C9A84C",
                  fontFamily: "'Cinzel', serif",
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={14} />
                New Reading
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Global Navigation Bar ── */}
      <GlobalNavBar
        onBack={() => navigate("/deck")}
        onNext={typingDone ? handleNewReading : undefined}
        nextDisabled={!typingDone}
        nextLabel="New Reading"
        helperText={
          !typingDone ? "Your reading is being revealed..." : undefined
        }
      />
    </Layout>
  );
}