import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Layout } from "../components/Layout";
import { GlobalNavBar } from "../components/GlobalNavBar";
import { CATEGORIES, CATEGORY_VI, CATEGORY_ZH, Category } from "../data/tarot-data";
import {
  Briefcase, Heart, Users, BookOpen, Coins, Leaf, Star, Home, ArrowRight,
} from "lucide-react";

type Lang = "EN" | "VI" | "ZH";

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ReactNode> = {
  career:   <Briefcase size={24} />,
  love:     <Heart size={24} />,
  friendship: <Users size={24} />,
  general:  <BookOpen size={24} />,
  finance:  <Coins size={24} />,
  health:   <Leaf size={24} />,
  spiritual: <Star size={24} />,
  family:   <Home size={24} />,
};

function hexToRgb(hex: string) {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}

// ─── Bilingual label resolver ─────────────────────────────────────────────────
function getCatLabel(id: string, lang: Lang): string {
  if (lang === "VI") return CATEGORY_VI[id]?.label ?? id;
  if (lang === "ZH") return CATEGORY_ZH[id]?.label ?? id;
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
function getCatDesc(id: string, lang: Lang): string {
  if (lang === "VI") return CATEGORY_VI[id]?.description ?? "";
  if (lang === "ZH") return CATEGORY_ZH[id]?.description ?? "";
  return CATEGORIES.find((c) => c.id === id)?.description ?? "";
}

// ─── Page header translations ─────────────────────────────────────────────────
const PAGE_LABELS: Record<Lang, { step: string; heading: string; sub: string; sectionLabel: string; sectionSub: string; questionHeading: string; proceedBtn: string; chooseHint: string }> = {
  EN: {
    step: "STEP 1 OF 3 · SET YOUR INTENTION",
    heading: "Choose Your Realm",
    sub: "Before the cards speak, you must first speak to them. Select the domain of life you seek clarity in.",
    sectionLabel: "READING DOMAINS",
    sectionSub: "Select one domain to focus your reading energy",
    questionHeading: "YOUR QUESTION",
    proceedBtn: "Proceed to the Deck",
    chooseHint: "Select a category and a question to continue",
  },
  VI: {
    step: "BƯỚC 1 / 3 · ĐẶT Ý ĐỊNH C��A BẠN",
    heading: "Chọn Lĩnh Vực",
    sub: "Trước khi những lá bài lên tiếng, bạn phải nói chuyện với chúng trước. Chọn lĩnh vực cuộc sống bạn muốn tìm sự rõ ràng.",
    sectionLabel: "LĨNH VỰC ĐỌC BÀI",
    sectionSub: "Chọn một lĩnh vực để tập trung năng lượng đọc bài",
    questionHeading: "CÂU HỎI CỦA BẠN",
    proceedBtn: "Tiến tới Bộ Bài",
    chooseHint: "Chọn chủ đề và câu hỏi để tiếp tục",
  },
  ZH: {
    step: "第1步/共3步 · 设定你的意图",
    heading: "选择你的领域",
    sub: "在牌开口说话之前，你必须先与它们交流。选择你寻求清晰的人生领域。",
    sectionLabel: "解读领域",
    sectionSub: "选择一个领域来集中你的解读能量",
    questionHeading: "你的问题",
    proceedBtn: "前往牌组",
    chooseHint: "选择一个类别和问题以继续",
  },
};

// ─── Category Card Component ──────────────────────────────────────────────────
function CategoryCard({
  category, selected, lang, onClick,
}: {
  category: Category; selected: boolean; lang: Lang; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const rgb = hexToRgb(category.accentColor);
  const active = selected || hovered;

  // Bilingual label: "Career (Sự Nghiệp)" when lang !== EN
  const enLabel = category.label;
  const nativeLabel = lang === "VI" ? CATEGORY_VI[category.id]?.label : lang === "ZH" ? CATEGORY_ZH[category.id]?.label : null;
  const displayLabel = nativeLabel ? `${enLabel} (${nativeLabel})` : enLabel;
  const displayDesc = getCatDesc(category.id, lang);

  return (
    <button
      id={`Category-Card-${category.id}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: selected
          ? `linear-gradient(145deg, rgba(${rgb},0.14) 0%, rgba(${rgb},0.07) 100%)`
          : hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.025)",
        border: `1.5px solid ${selected ? category.accentColor : hovered ? `rgba(${rgb},0.45)` : "rgba(240,230,211,0.09)"}`,
        borderRadius: "16px",
        padding: "20px 18px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "12px",
        transition: "all 0.25s ease",
        textAlign: "left",
        boxShadow: selected
          ? `0 0 28px rgba(${rgb},0.18), 0 4px 20px rgba(0,0,0,0.3)`
          : hovered ? `0 0 16px rgba(${rgb},0.09), 0 4px 16px rgba(0,0,0,0.2)` : "none",
        transform: active ? "translateY(-3px)" : "none",
        overflow: "hidden",
        // Min-height: prevents collapse when translation is short
        minHeight: "136px",
      }}
    >
      {/* Selected check badge */}
      {selected && (
        <div style={{
          position: "absolute", top: "12px", right: "12px",
          width: "20px", height: "20px", borderRadius: "50%",
          background: category.accentColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "10px", color: "#0A0A12", fontWeight: 700,
          boxShadow: `0 0 10px rgba(${rgb},0.4)`,
        }}>✓</div>
      )}

      {/* Selected glow bg */}
      {selected && (
        <div style={{
          position: "absolute", bottom: 0, right: 0, width: "80px", height: "80px",
          background: `radial-gradient(circle at bottom right, rgba(${rgb},0.12) 0%, transparent 70%)`,
          borderRadius: "16px",
        }} />
      )}

      {/* Icon */}
      <div style={{
        width: "48px", height: "48px", borderRadius: "13px",
        background: selected ? `rgba(${rgb},0.18)` : `rgba(${rgb},0.08)`,
        border: `1px solid rgba(${rgb},${selected ? "0.45" : "0.2"})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: category.accentColor, transition: "all 0.25s ease",
        boxShadow: selected ? `0 0 16px rgba(${rgb},0.22)` : "none",
        flexShrink: 0,
      }}>
        {ICON_MAP[category.id] || <span style={{ fontSize: "22px" }}>{category.icon}</span>}
      </div>

      {/* Text — hug contents vertically, no fixed height */}
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
        {/* Bilingual label: EN + native on same line */}
        <span style={{
          fontFamily: "'Cinzel', serif",
          color: selected ? category.accentColor : hovered ? "#F0E6D3" : "rgba(240,230,211,0.85)",
          fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.04em",
          transition: "color 0.2s",
          // No fixed height — hug contents
          lineHeight: 1.4,
        }}>
          {displayLabel}
        </span>
        {/* Description — 150% line-height to accommodate Vietnamese diacritics */}
        <span style={{
          fontFamily: "'Raleway', sans-serif",
          color: "rgba(240,230,211,0.4)", fontSize: "0.75rem",
          lineHeight: 1.5, // 150% — Vietnamese accent marks need breathing room
        }}>
          {displayDesc}
        </span>
      </div>
    </button>
  );
}

// ─── Question Chip ────────────────────────────────────────────────────────────
function QuestionChip({
  question, selected, accentColor, onClick,
}: {
  question: string; selected: boolean; accentColor: string; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const rgb = hexToRgb(accentColor);

  return (
    <button
      id={`Chip-${question.slice(0,15).replace(/\s/g,"-")}`}
      onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: selected ? `rgba(${rgb},0.16)` : hov ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${selected ? accentColor : hov ? `rgba(${rgb},0.38)` : "rgba(240,230,211,0.11)"}`,
        borderRadius: "50px", padding: "9px 18px", cursor: "pointer",
        fontFamily: "'Raleway', sans-serif", fontSize: "0.83rem",
        color: selected ? accentColor : hov ? "#F0E6D3" : "rgba(240,230,211,0.55)",
        transition: "all 0.2s ease", letterSpacing: "0.02em",
        // Hug contents — no fixed height, wrap text if needed
        lineHeight: 1.5, whiteSpace: "normal", textAlign: "left",
        boxShadow: selected ? `0 0 14px rgba(${rgb},0.14)` : "none",
      }}
    >
      {question}
    </button>
  );
}

function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.slice(1), 16), amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// ─── Setup Page ───────────────────────────────────────────────────────────────
export default function SetupPage() {
  const { setReadingSetup, language } = useApp();
  const navigate = useNavigate();
  const lang = (language as Lang) || "EN";
  const L = PAGE_LABELS[lang];

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [textFocused, setTextFocused] = useState(false);
  const questionRef = useRef<HTMLDivElement>(null);

  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory);
  const accentColor = activeCategory?.accentColor ?? "#C9A84C";

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
            <h1 style={{ fontFamily: "'Cinzel', serif", color: "#F0E6D3", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 600, letterSpacing: "0.04em", lineHeight: 1.3 }}>
              {L.heading}
            </h1>
            {/* Sub — no fixed height, line-height 1.75 for diacritics */}
            <p style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.45)", fontSize: "0.95rem", lineHeight: 1.75, maxWidth: "520px" }}>
              {L.sub}
            </p>
          </div>

          {/* ── Category Grid ── */}
          <div id="Category-Section" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", color: "rgba(201,168,76,0.7)", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.2em" }}>
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
              <h2 style={{ fontFamily: "'Cinzel', serif", color: "rgba(201,168,76,0.7)", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.2em" }}>
                {L.questionHeading}
              </h2>

              {/* Suggested question chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {activeCategory.questions.map((q) => (
                  <QuestionChip
                    key={q} question={q}
                    selected={selectedQuestion === q && !customQuestion}
                    accentColor={accentColor}
                    onClick={() => { setSelectedQuestion(q); setCustomQuestion(""); }}
                  />
                ))}
              </div>

              {/* Custom question textarea */}
              <div style={{ position: "relative" }}>
                <textarea
                  id="Custom-Question-Input"
                  placeholder={lang === "VI" ? "Hoặc nhập câu hỏi của riêng bạn..." : lang === "ZH" ? "或者输入您自己的问题..." : "Or type your own question..."}
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

      {/* ─── Global Navigation Bar ─────────────────────────────────────────── */}
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