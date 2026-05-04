import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Layout } from "../components/Layout";
import { GlobalNavBar } from "../components/GlobalNavBar";
import { CATEGORIES, Category, QUESTIONS_VI, QUESTIONS_ZH } from "../data/tarot-data";
import { CategoryCard, QuestionChip } from "../components/tarot/CategoryCard";
import { useLocale } from "../../hooks/useLocale";

type Lang = "EN" | "VI" | "ZH";

export default function SetupPage() {
  const { setReadingSetup, language } = useApp();
  const navigate = useNavigate();
  const lang = (language as Lang) || "EN";
  const locale = useLocale();
  const L = locale.setup;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [textFocused, setTextFocused] = useState(false);
  const questionRef = useRef<HTMLDivElement>(null);

  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory);
  const accentColor = activeCategory?.accentColor ?? "#C9A84C";

  // Dynamic font for Vietnamese support
  const HEADING_FONT = lang === "VI" ? "'Playfair Display', serif" : "'Cinzel', serif";

  // Get translated questions
  const suggestedQuestions = selectedCategory ? (
    lang === "VI" ? QUESTIONS_VI[selectedCategory] :
    lang === "ZH" ? QUESTIONS_ZH[selectedCategory] :
    activeCategory?.questions ?? []
  ) : [];

  const handleCategorySelect = (id: string) => {
    if (selectedCategory === id) return;
    setSelectedCategory(id);
    setSelectedQuestion(null);
    setCustomQuestion("");
    setTimeout(() => {
      questionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const finalQuestion = customQuestion.trim() || selectedQuestion || "";
  const canProceed = !!selectedCategory && !!finalQuestion;

  const handleProceed = () => {
    if (!canProceed) return;
    setReadingSetup({ category: selectedCategory!, question: finalQuestion });
    navigate("/deck");
  };

  return (
    <Layout step={1}>
      <div
        id="Setup-Page"
        style={{
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "#0A0A12",
          backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 55%)",
          padding: "56px 24px 0",
        }}
      >
        <div style={{ maxWidth: "920px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "52px", paddingBottom: "16px" }}>

          {/* Page Header */}
          <div id="Setup-Header" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ height: "1px", width: "40px", background: "linear-gradient(to right, transparent, rgba(201,168,76,0.5))" }} />
              <span style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(201,168,76,0.6)", fontSize: "0.68rem", letterSpacing: "0.22em", fontWeight: 600 }}>
                {L.step}
              </span>
              <div style={{ height: "1px", width: "40px", background: "linear-gradient(to left, transparent, rgba(201,168,76,0.5))" }} />
            </div>
            <h1 style={{ fontFamily: HEADING_FONT, color: "#F0E6D3", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 600, letterSpacing: "0.04em", lineHeight: 1.3 }}>
              {L.heading}
            </h1>
            <p style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.45)", fontSize: "0.95rem", lineHeight: 1.75, maxWidth: "520px" }}>
              {L.sub}
            </p>
          </div>

          {/* ── Category Grid ── */}
          <div id="Category-Section" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h2 style={{ fontFamily: HEADING_FONT, color: "rgba(201,168,76,0.7)", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.2em" }}>
                {L.sectionLabel}
              </h2>
              <p style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.35)", fontSize: "0.82rem", lineHeight: 1.5 }}>
                {L.sectionSub}
              </p>
            </div>

            <div
              id="Category-Grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "12px" }}
            >
              {CATEGORIES.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  selected={selectedCategory === cat.id}
                  lang={lang}
                  onClick={() => handleCategorySelect(cat.id)}
                />
              ))}
            </div>
          </div>

          {/* ── Question Section ── */}
          {selectedCategory && activeCategory && (
            <div id="Question-Section" ref={questionRef} style={{ display: "flex", flexDirection: "column", gap: "18px", animation: "fadeSlideUp 0.35s ease" }}>
              <h2 style={{ fontFamily: HEADING_FONT, color: "rgba(201,168,76,0.7)", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.2em" }}>
                {L.questionHeading}
              </h2>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {suggestedQuestions.map((q) => (
                  <QuestionChip
                    key={q} question={q}
                    selected={selectedQuestion === q && !customQuestion}
                    accentColor={accentColor}
                    onClick={() => { setSelectedQuestion(q); setCustomQuestion(""); }}
                  />
                ))}
              </div>

              <div style={{ position: "relative" }}>
                <textarea
                  id="Custom-Question-Input"
                  placeholder={L.customPlaceholder}
                  value={customQuestion}
                  onChange={(e) => { setCustomQuestion(e.target.value); setSelectedQuestion(null); }}
                  onFocus={() => setTextFocused(true)}
                  onBlur={() => setTextFocused(false)}
                  rows={3}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    fontFamily: "'Raleway', sans-serif",
                    background: textFocused ? "#0F0F1C" : "#0A0A14",
                    border: `1.5px solid ${textFocused ? accentColor : "rgba(240,230,211,0.1)"}`,
                    borderRadius: "12px", padding: "14px 16px",
                    color: "#F0E6D3", fontSize: "0.9rem", outline: "none",
                    resize: "vertical",
                    lineHeight: 1.7,
                    boxShadow: textFocused ? `0 0 0 3px rgba(201,168,76,0.07)` : "none",
                    transition: "all 0.2s ease",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <GlobalNavBar
        onBack={() => navigate("/")}
        onNext={handleProceed}
        nextDisabled={!canProceed}
        nextLabel={L.proceedBtn}
        helperText={!canProceed ? L.chooseHint : undefined}
      />

      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </Layout>
  );
}