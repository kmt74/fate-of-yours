import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Layout } from "../components/Layout";
import { GlobalNavBar } from "../components/GlobalNavBar";
import { CATEGORIES, generateInterpretation } from "../data/tarot-data";
import { TarotCard, MAJOR_ARCANA_VI, MAJOR_ARCANA_ZH } from "../data/tarot-data";
import { RefreshCw, Sparkles, BookOpen } from "lucide-react";

const POSITIONS = ["Past", "Present", "Future"];
const POSITION_COLORS = ["rgba(167,139,250,0.9)", "#C9A84C", "rgba(126,168,224,0.9)"];

// ─── Revealed Card ─────────────────────────────────────────────────────────────
function RevealedCard({
  card,
  position,
  positionIndex,
  revealed,
  delay,
}: {
  card: TarotCard;
  position: string;
  positionIndex: number;
  revealed: boolean;
  delay: number;
}) {
  const color = POSITION_COLORS[positionIndex];

  return (
    <div
      id={`Revealed-Card-${positionIndex + 1}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        flex: "1 1 0",
        minWidth: "140px",
        maxWidth: "240px",
      }}
    >
      {/* Position label */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ height: "1px", width: "24px", background: `linear-gradient(to right, transparent, ${color})` }} />
        <span style={{
          fontFamily: "'Raleway', sans-serif",
          color: color, fontSize: "0.68rem",
          letterSpacing: "0.22em", fontWeight: 700,
        }}>
          {position.toUpperCase()}
        </span>
        <div style={{ height: "1px", width: "24px", background: `linear-gradient(to left, transparent, ${color})` }} />
      </div>

      {/* Card face — flip animation */}
      <div style={{ perspective: "1000px", width: "100%" }}>
        <div style={{
          transformStyle: "preserve-3d",
          transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: `transform 0.8s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
          position: "relative",
          width: "100%",
          paddingBottom: "150%",
        }}>
          {/* Back */}
          <div style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            position: "absolute", inset: 0,
            borderRadius: "12px",
            background: "linear-gradient(145deg, #141420 0%, #0F0F1A 100%)",
            border: "1.5px solid rgba(139,92,246,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `repeating-linear-gradient(45deg, rgba(139,92,246,0.08) 0px, rgba(139,92,246,0.08) 1px, transparent 1px, transparent 8px)`,
            }} />
            <div style={{ position: "absolute", inset: "8px", border: "0.5px solid rgba(201,168,76,0.15)", borderRadius: "6px" }} />
            <span style={{ position: "relative", color: "rgba(139,92,246,0.4)", fontSize: "22px" }}>✦</span>
          </div>

          {/* Front */}
          <div style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: "absolute", inset: 0,
            borderRadius: "12px",
            background: "linear-gradient(145deg, #1E1632 0%, #160F28 100%)",
            border: `1.5px solid ${color}66`,
            boxShadow: revealed ? `0 0 30px ${color}33, 0 8px 32px rgba(0,0,0,0.6)` : "none",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "space-between",
            padding: "20px 14px",
            overflow: "hidden",
          }}>
            {/* Subtle pattern */}
            <div style={{
              position: "absolute", inset: 0, opacity: 0.04,
              backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
              backgroundSize: "18px 18px",
            }} />
            <div style={{ position: "absolute", inset: "6px", border: `0.5px solid ${color}33`, borderRadius: "8px" }} />

            {/* Top mark */}
            <span style={{
              position: "relative",
              fontFamily: "'Cinzel', serif",
              color: `${color}88`,
              fontSize: "0.55rem", letterSpacing: "0.2em",
            }}>
              ✦ UPRIGHT ✦
            </span>

            {/* Symbol */}
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%",
                background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                border: `1.5px solid ${color}55`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "28px",
                boxShadow: `0 0 20px ${color}20`,
              }}>
                {card.symbol}
              </div>
              <span style={{
                fontFamily: "'Cinzel', serif",
                color: "#F0E6D3",
                fontSize: "clamp(0.75rem, 2vw, 0.95rem)",
                fontWeight: 600, letterSpacing: "0.04em",
                textAlign: "center", lineHeight: 1.3,
              }}>
                {card.name}
              </span>
              <span style={{
                fontFamily: "'Raleway', sans-serif",
                color: "rgba(240,230,211,0.45)",
                fontSize: "0.65rem", textAlign: "center",
                lineHeight: 1.5, letterSpacing: "0.02em",
              }}>
                {card.meaning}
              </span>
            </div>

            {/* Suit badge */}
            <div style={{
              position: "relative",
              background: `rgba(${card.suit === "major" ? "201,168,76" : "139,92,246"},0.12)`,
              border: `1px solid rgba(${card.suit === "major" ? "201,168,76" : "139,92,246"},0.25)`,
              borderRadius: "20px", padding: "3px 10px",
            }}>
              <span style={{
                fontFamily: "'Raleway', sans-serif",
                color: card.suit === "major" ? "rgba(201,168,76,0.7)" : "rgba(139,92,246,0.7)",
                fontSize: "0.58rem", letterSpacing: "0.12em", fontWeight: 600,
              }}>
                {card.suit === "major" ? "MAJOR ARCANA" : card.suit.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────
function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // --- H2 ---
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} style={{
          fontFamily: "'Cinzel',serif", color: "#C9A84C",
          fontSize: "1.08rem", fontWeight: 600, letterSpacing: "0.05em",
          margin: "32px 0 14px",
          paddingBottom: "10px",
          borderBottom: "1px solid rgba(201,168,76,0.18)",
        }}>
          {line.slice(3)}
        </h2>
      );
    }
    // --- H3 ---
    else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} style={{
          fontFamily: "'Cinzel',serif", color: "rgba(167,139,250,0.9)",
          fontSize: "0.95rem", fontWeight: 600, letterSpacing: "0.06em",
          margin: "24px 0 10px",
        }}>
          {line.slice(4)}
        </h3>
      );
    }
    // --- Blockquote ---
    else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} style={{
          margin: "18px 0",
          paddingLeft: "20px",
          borderLeft: "2px solid rgba(139,92,246,0.5)",
          fontFamily: "'Raleway',sans-serif",
          color: "rgba(167,139,250,0.75)",
          fontSize: "0.93rem",
          lineHeight: 1.8,
          fontStyle: "italic",
          background: "rgba(139,92,246,0.04)",
          borderRadius: "0 8px 8px 0",
          padding: "12px 16px 12px 20px",
        }}>
          {renderInline(line.slice(2))}
        </blockquote>
      );
    }
    // --- Bullet list item ---
    else if (line.startsWith("- ")) {
      const bulletItems: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        bulletItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: "12px 0", paddingLeft: "0", listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
          {bulletItems.map((item, bi) => (
            <li key={bi} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span style={{ color: "rgba(201,168,76,0.5)", fontSize: "8px", marginTop: "8px", flexShrink: 0 }}>◆</span>
              <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.68)", fontSize: "0.93rem", lineHeight: 1.75 }}>
                {renderInline(item)}
              </span>
            </li>
          ))}
        </ul>
      );
      continue;
    }
    // --- Horizontal rule ---
    else if (line === "---") {
      elements.push(
        <div key={i} style={{ margin: "24px 0", height: "1px", background: "linear-gradient(to right,rgba(139,92,246,0.3),rgba(201,168,76,0.2),transparent)" }} />
      );
    }
    // --- Empty line (spacer) ---
    else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: "8px" }} />);
    }
    // --- Italic line (starts with *) ---
    else if (line.startsWith("*") && line.endsWith("*")) {
      elements.push(
        <p key={i} style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.4)", fontSize: "0.85rem", fontStyle: "italic", lineHeight: 1.7, margin: "4px 0" }}>
          {line.slice(1, -1)}
        </p>
      );
    }
    // --- Regular paragraph ---
    else {
      elements.push(
        <p key={i} style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.75)", fontSize: "0.97rem", lineHeight: 1.9, margin: "0 0 4px", letterSpacing: "0.01em" }}>
          {renderInline(line)}
        </p>
      );
    }
    i++;
  }

  return <div id="Markdown-Render">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ color: "#F0E6D3", fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} style={{ color: "rgba(240,230,211,0.6)", fontStyle: "italic" }}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

// ─── AI Skeleton Loader (Mystical) ────────────────────────────────────────────
function AISkeleton() {
  const LINES = [
    { w: "45%", height: 18 }, // H2 heading
    { w: "92%", height: 13 },
    { w: "88%", height: 13 },
    { w: "74%", height: 13 },
    { w: "0%", height: 8 },   // spacer
    { w: "100%", height: 1, isRule: true }, // divider
    { w: "0%", height: 8 },
    { w: "55%", height: 16 }, // H3
    { w: "96%", height: 13 },
    { w: "88%", height: 13 },
    { w: "70%", height: 13 },
    { w: "0%", height: 14 },
    { w: "80%", height: 13, isQuote: true },
    { w: "72%", height: 13, isQuote: true },
    { w: "0%", height: 14 },
    { w: "95%", height: 13 },
    { w: "82%", height: 13 },
  ];

  return (
    <div id="AI-Skeleton" style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      {LINES.map((line, i) => {
        if (line.width === "0%") return <div key={i} style={{ height: `${line.height}px` }} />;
        if (line.isRule) return (
          <div key={i} style={{ height: "1px", background: "linear-gradient(to right,rgba(139,92,246,0.3),rgba(201,168,76,0.15),transparent)", margin: "8px 0" }} />
        );
        return (
          <div key={i} style={{
            height: `${line.height}px`, borderRadius: "5px",
            width: line.w,
            marginLeft: line.isQuote ? "20px" : "0",
            borderLeft: line.isQuote ? "2px solid rgba(139,92,246,0.25)" : "none",
            paddingLeft: line.isQuote ? "8px" : "0",
            background: `linear-gradient(90deg, rgba(139,92,246,0.06) 0%, rgba(201,168,76,0.1) 30%, rgba(139,92,246,0.08) 60%, rgba(139,92,246,0.05) 100%)`,
            backgroundSize: "300% 100%",
            animation: `shimmerWave 2.4s ease-in-out infinite`,
            animationDelay: `${i * 0.06}s`,
          }} />
        );
      })}

      {/* Pulsing mystical indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px" }}>
        <div style={{ display: "flex", gap: "5px" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: "5px", height: "5px", borderRadius: "50%",
              background: i === 0 ? "#C9A84C" : i === 1 ? "#8B5CF6" : "#7EA8E0",
              animation: "typingDot 1.6s ease-in-out infinite",
              animationDelay: `${i * 0.25}s`, opacity: 0.7,
            }} />
          ))}
        </div>
        <span style={{ fontFamily: "'Cinzel',serif", color: "rgba(139,92,246,0.45)", fontSize: "0.72rem", letterSpacing: "0.14em", animation: "breathe 2s ease-in-out infinite alternate" }}>
          The Oracle is consulting the cards...
        </span>
      </div>
    </div>
  );
}

// ─── Reading Page ─────────────────────────────────────────────────────────────
export default function ReadingPage() {
  const { readingSetup, selectedCards, resetReading, language } = useApp();
  const navigate = useNavigate();

  const [cardsRevealed, setCardsRevealed] = useState(false);
  const [aiLoading, setAiLoading] = useState(true);
  const [displayedText, setDisplayedText] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const category = readingSetup?.category ?? "general";
  const question = readingSetup?.question ?? "What does my journey hold?";
  const categoryObj = CATEGORIES.find((c) => c.id === category);
  const fullText = selectedCards.length === 3
    ? generateInterpretation(selectedCards, category, question)
    : "";

  useEffect(() => {
    const t = setTimeout(() => setCardsRevealed(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!cardsRevealed) return;
    const t = setTimeout(() => setAiLoading(false), 3200);
    return () => clearTimeout(t);
  }, [cardsRevealed]);

  // Typewriter
  useEffect(() => {
    if (aiLoading || !fullText) return;
    let i = 0;
    typingRef.current = setInterval(() => {
      if (i < fullText.length) { setDisplayedText(fullText.slice(0, i + 1)); i++; }
      else { if (typingRef.current) clearInterval(typingRef.current); setTypingDone(true); }
    }, 12);
    return () => { if (typingRef.current) clearInterval(typingRef.current); };
  }, [aiLoading, fullText]);

  const handleNewReading = () => { resetReading(); navigate("/setup"); };

  if (selectedCards.length < 3) {
    return (
      <Layout step={3}>
        <div style={{ minHeight: "calc(100vh-64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => navigate("/deck")} style={{ fontFamily: "'Raleway',sans-serif", background: "none", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "10px", padding: "12px 24px", color: "#C9A84C", cursor: "pointer" }}>Return to Deck</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout step={3}>
      <div id="Reading-Page" style={{ minHeight: "calc(100vh - 64px)", backgroundColor: "#0A0A12", backgroundImage: "radial-gradient(ellipse at 50% 0%,rgba(139,92,246,0.07) 0%,transparent 55%)", padding: "48px 24px 80px" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "44px" }}>

          {/* Reading Header */}
          <div id="Reading-Header" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ height: "1px", width: "36px", background: "linear-gradient(to right,transparent,rgba(201,168,76,0.5))" }} />
              <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(201,168,76,0.6)", fontSize: "0.68rem", letterSpacing: "0.22em", fontWeight: 600 }}>STEP 3 OF 3 · YOUR READING</span>
            </div>
            <div id="Reading-Context-Card" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(240,230,211,0.08)", borderRadius: "14px", padding: "18px 22px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {categoryObj && (
                  <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.68rem", letterSpacing: "0.14em", fontWeight: 700, color: categoryObj.accentColor, background: `rgba(${hexToRgbStr(categoryObj.accentColor)},0.1)`, border: `1px solid rgba(${hexToRgbStr(categoryObj.accentColor)},0.25)`, borderRadius: "20px", padding: "3px 12px" }}>
                    {categoryObj.icon} {categoryObj.label.toUpperCase()}
                  </span>
                )}
              </div>
              <p style={{ fontFamily: "'Cinzel',serif", color: "#F0E6D3", fontSize: "clamp(1rem,2.5vw,1.25rem)", fontWeight: 500, letterSpacing: "0.02em", lineHeight: 1.5 }}>
                "{question}"
              </p>
            </div>
          </div>

          {/* Card Reveal */}
          <div id="Card-Reveal-Section" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2 style={{ fontFamily: "'Cinzel',serif", color: "rgba(201,168,76,0.7)", fontSize: "0.78rem", letterSpacing: "0.2em", fontWeight: 600 }}>YOUR THREE CARDS</h2>
            <div id="Cards-Row" style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
              {selectedCards.map((card, i) => (
                <RevealedCard key={card.id} card={card} position={POSITIONS[i]} positionIndex={i} revealed={cardsRevealed} delay={i * 300} />
              ))}
            </div>
          </div>

          {/* ─── AI Interpretation (Rich Text) ─── */}
          <div id="AI-Interpretation-Section" style={{
            background: "linear-gradient(145deg,rgba(16,12,30,0.9) 0%,rgba(10,8,22,0.95) 100%)",
            border: `1px solid ${typingDone ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.15)"}`,
            borderRadius: "22px",
            padding: "36px 40px",
            display: "flex", flexDirection: "column", gap: "24px",
            boxShadow: typingDone ? "0 0 70px rgba(139,92,246,0.1), 0 8px 40px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.4)",
            transition: "all 0.6s ease",
            position: "relative", overflow: "hidden",
            // Comfortable reading width: max 72ch enforced by maxWidth on content
          }}>
            {/* Ambient glows */}
            {typingDone && (
              <>
                <div style={{ position: "absolute", top: 0, left: 0, width: "250px", height: "250px", background: "radial-gradient(circle at top left,rgba(139,92,246,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: 0, right: 0, width: "250px", height: "250px", background: "radial-gradient(circle at bottom right,rgba(201,168,76,0.05) 0%,transparent 70%)", pointerEvents: "none" }} />
              </>
            )}

            {/* AI Header */}
            <div id="AI-Header" style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,rgba(139,92,246,0.22),rgba(201,168,76,0.1))", border: "1px solid rgba(139,92,246,0.38)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 18px rgba(139,92,246,0.2)", flexShrink: 0 }}>
                <Sparkles size={16} color="#A78BFA" />
              </div>
              <div>
                <span style={{ fontFamily: "'Cinzel',serif", color: "#A78BFA", fontSize: "0.88rem", letterSpacing: "0.1em", fontWeight: 600, display: "block" }}>AI Interpretation</span>
                <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.3)", fontSize: "0.72rem" }}>
                  {aiLoading ? "Consulting the ancient wisdom..." : typingDone ? "Reading complete · scroll to explore" : "Channeling the cards..."}
                </span>
              </div>
              {typingDone && (
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px", color: "rgba(240,230,211,0.25)", flexShrink: 0 }}>
                  <BookOpen size={13} />
                  <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.68rem", letterSpacing: "0.06em" }}>FULL ANALYSIS</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "linear-gradient(to right,rgba(139,92,246,0.5),rgba(201,168,76,0.2),transparent)", position: "relative" }} />

            {/* Content — reading-optimised line width */}
            <div id="AI-Content" style={{ position: "relative", maxWidth: "68ch" }}>
              {aiLoading ? (
                <AISkeleton />
              ) : (
                <div style={{ position: "relative" }}>
                  {/* Render markdown when done, plain text with cursor while typing */}
                  {typingDone ? (
                    <MarkdownText text={fullText} />
                  ) : (
                    <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.78)", fontSize: "0.97rem", lineHeight: 1.95, whiteSpace: "pre-wrap", minHeight: "120px" }}>
                      {displayedText}
                      <span style={{ display: "inline-block", width: "2px", height: "1em", background: "#8B5CF6", marginLeft: "2px", animation: "blink 0.7s step-end infinite", verticalAlign: "text-bottom" }} />
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {typingDone && (
            <div id="Reading-Actions" style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap", animation: "fadeSlideUp 0.5s ease" }}>
              <button id="New-Reading-Button" onClick={handleNewReading} style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "1.5px solid rgba(201,168,76,0.35)", borderRadius: "50px", padding: "13px 28px", color: "#C9A84C", fontFamily: "'Cinzel',serif", fontSize: "0.88rem", fontWeight: 600, letterSpacing: "0.08em", cursor: "pointer", transition: "all 0.25s ease" }}
                onMouseEnter={(e) => { Object.assign((e.currentTarget as HTMLElement).style, { background: "rgba(201,168,76,0.08)", boxShadow: "0 0 20px rgba(201,168,76,0.18)", transform: "translateY(-2px)" }); }}
                onMouseLeave={(e) => { Object.assign((e.currentTarget as HTMLElement).style, { background: "transparent", boxShadow: "none", transform: "none" }); }}
              >
                <RefreshCw size={14} /> New Reading
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Nav Bar */}
      <GlobalNavBar
        onBack={() => navigate("/deck")}
        onNext={typingDone ? handleNewReading : undefined}
        nextDisabled={!typingDone}
        nextLabel="New Reading"
        helperText={!typingDone ? "Your reading is being revealed..." : undefined}
      />

      <style>{`
        @keyframes shimmerWave {
          0%   { background-position: 200% center; }
          100% { background-position: -100% center; }
        }
        @keyframes typingDot { 0%,60%,100%{transform:translateY(0);opacity:0.5} 30%{transform:translateY(-5px);opacity:1} }
        @keyframes breathe { from{opacity:0.35} to{opacity:0.7} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </Layout>
  );
}

function hexToRgbStr(hex: string): string {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}