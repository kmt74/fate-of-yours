import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { RefreshCw, RotateCcw } from "lucide-react";

// ─── Context & Data ───────────────────────────────────────────────────────────
import { useApp } from "../context/AppContext";
import { CATEGORIES, TAROT_DECK } from "../data/tarot-data";

// ─── Layout ───────────────────────────────────────────────────────────────────
import { Layout } from "../components/Layout";
import { GlobalNavBar } from "../components/GlobalNavBar";

// ─── Shared UI Primitives ─────────────────────────────────────────────────────
import { SectionTag } from "../components/ui/SectionTag";
import { useLocale } from "../../hooks/useLocale";

// ─── Reading Sub-Components ──────────────────────────────────────────────────
import { RevealedTarotCard } from "../components/reading/RevealedTarotCard";
import { AiInterpretationPanel } from "../components/reading/AiInterpretationPanel";
import { ReadingContextCard } from "../components/reading/ReadingContextCard";
import { RateLimitError } from "../../lib/ai";

const POSITIONS = ["past", "present", "future"];

export default function ReadingPage() {
  const { selectedCards, readingSetup, aiInterpretation, language, fetchAiInterpretation } = useApp();
  const navigate = useNavigate();
  const t = useLocale();

  const [cardsRevealed, setCardsRevealed] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState<string | null>(null);

  const categoryObj = CATEGORIES.find((c) => c.id === readingSetup?.category);
  const question = readingSetup?.question ?? "";
  const fullText = aiInterpretation?.interpretation ?? "";
  const aiLoading = !fullText && !rateLimitMsg;

  const HEADING_FONT = language === "VI" ? "'Playfair Display', serif" : "'Cinzel', serif";

  // ─── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setCardsRevealed(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        await fetchAiInterpretation();
      } catch (err) {
        if (err instanceof RateLimitError) {
          setRateLimitMsg(err.message);
        } else {
          setRateLimitMsg("The Oracle is silent. Please try again later.");
        }
      }
    };
    run();
  }, [fetchAiInterpretation]);

  useEffect(() => {
    if (fullText && cardsRevealed) {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(fullText.slice(0, i));
        i += 3;
        if (i > fullText.length) {
          setDisplayedText(fullText);
          setTypingDone(true);
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [fullText, cardsRevealed]);

  const handleNewReading = () => {
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
              fontFamily: HEADING_FONT,
              background: "none",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "#C9A84C",
              cursor: "pointer",
            }}
          >
            {t.reading.returnBtn}
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
            className="flex flex-col items-center text-center gap-5"
          >
            <SectionTag text={t.reading.step} centered={true} />
            {categoryObj && (
              <div className="w-full max-w-[600px]">
                <ReadingContextCard
                  category={categoryObj}
                  question={question}
                />
              </div>
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
                fontFamily: HEADING_FONT,
                color: "rgba(201,168,76,0.7)",
              }}
            >
              {t.reading.heading}
            </h2>

            <div
              id="Cards-Row"
              className="flex flex-wrap justify-center gap-5"
            >
              {selectedCards.map((card, i) => (
                <RevealedTarotCard
                  key={card.id}
                  card={card}
                  position={POSITIONS[i] as any}
                  positionIndex={i}
                  revealed={cardsRevealed}
                  delay={i * 300}
                />
              ))}
            </div>
          </section>

          {/* ── Rate Limit Notice ── */}
          {rateLimitMsg && (
            <div style={{
              padding: "10px 16px",
              borderRadius: "8px",
              background: "rgba(201,168,76,0.08)",
              border: "1px solid rgba(201,168,76,0.25)",
              color: "rgba(201,168,76,0.85)",
              fontSize: "0.82rem",
              fontFamily: "'Raleway', sans-serif",
              letterSpacing: "0.02em",
            }}>
              {rateLimitMsg}
            </div>
          )}

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
                  fontFamily: HEADING_FONT,
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={14} />
                {t.reading.newReading}
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
        nextLabel={t.reading.newReading}
        helperText={
          !typingDone ? t.reading.loading : undefined
        }
      />
    </Layout>
  );
}