import React from "react";
import { Sparkles, BookOpen } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { GlowDivider } from "../ui/GlowDivider";
import { useApp } from "../../context/AppContext";

const SKELETON_LINES = [
  { w: "45%", h: 18 },
  { w: "92%", h: 13 },
  { w: "88%", h: 13 },
  { w: "74%", h: 13 },
  { w: "0%", h: 8 },
  { w: "100%", h: 1, isRule: true },
  { w: "0%", h: 8 },
  { w: "55%", h: 16 },
  { w: "96%", h: 13 },
  { w: "88%", h: 13 },
  { w: "70%", h: 13 },
  { w: "0%", h: 14 },
  { w: "80%", h: 13, isQuote: true },
  { w: "72%", h: 13, isQuote: true },
  { w: "0%", h: 14 },
  { w: "95%", h: 13 },
  { w: "82%", h: 13 },
] as const;

function AiSkeleton({ language }: { language: string }) {
  const HEADING_FONT = language === "VI" ? "'Playfair Display', serif" : "'Cinzel', serif";
  return (
    <div id="AI-Skeleton" className="flex flex-col gap-[7px]" role="status">
      {SKELETON_LINES.map((line, i) => {
        if (line.w === "0%") return <div key={i} style={{ height: `${line.h}px` }} />;
        if ("isRule" in line && line.isRule) {
          return (
            <div
              key={i}
              className="my-2 h-px"
              style={{
                background:
                  "linear-gradient(to right, rgba(139,92,246,0.3), rgba(201,168,76,0.15), transparent)",
              }}
            />
          );
        }
        return (
          <div
            key={i}
            className="rounded-[5px]"
            style={{
              height: `${line.h}px`,
              width: line.w,
              marginLeft: "isQuote" in line && line.isQuote ? "20px" : "0",
              borderLeft: "isQuote" in line && line.isQuote ? "2px solid rgba(139,92,246,0.25)" : "none",
              paddingLeft: "isQuote" in line && line.isQuote ? "8px" : "0",
              background: "linear-gradient(90deg, rgba(139,92,246,0.06) 0%, rgba(201,168,76,0.1) 30%, rgba(139,92,246,0.08) 60%, rgba(139,92,246,0.05) 100%)",
              backgroundSize: "300% 100%",
              animation: "shimmerWave 2.4s ease-in-out infinite",
              animationDelay: `${i * 0.06}s`,
            }}
          />
        );
      })}
      <div className="mt-4 flex items-center gap-2.5">
        <div className="flex gap-[5px]">
          {[0, 1, 2].map((j) => (
            <div
              key={j}
              className="h-[5px] w-[5px] rounded-full"
              style={{
                background: j === 0 ? "#C9A84C" : j === 1 ? "#8B5CF6" : "#7EA8E0",
                animation: "typingDot 1.6s ease-in-out infinite",
                animationDelay: `${j * 0.25}s`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>
        <span className="text-[0.72rem] tracking-[0.14em]" style={{ fontFamily: HEADING_FONT, color: "rgba(139,92,246,0.45)", animation: "breathe 2s ease-in-out infinite alternate" }}>
          The Oracle is consulting the cards...
        </span>
      </div>
    </div>
  );
}

export interface AiInterpretationPanelProps {
  isLoading: boolean;
  displayedText: string;
  fullText: string;
  isTypingDone: boolean;
}

export function AiInterpretationPanel({
  isLoading,
  displayedText,
  fullText,
  isTypingDone,
}: AiInterpretationPanelProps) {
  const { language } = useApp();
  const HEADING_FONT = language === "VI" ? "'Playfair Display', serif" : "'Cinzel', serif";

  return (
    <section
      id="AI-Interpretation-Section"
      className="relative flex flex-col gap-6 overflow-hidden rounded-[22px] px-10 py-9"
      style={{
        background: "linear-gradient(145deg, rgba(16,12,30,0.9) 0%, rgba(10,8,22,0.95) 100%)",
        border: `1px solid ${isTypingDone ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.15)"}`,
        boxShadow: isTypingDone ? "0 0 70px rgba(139,92,246,0.1), 0 8px 40px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.4)",
        transition: "all 0.6s ease",
      }}
    >
      {isTypingDone && (
        <>
          <div className="absolute left-0 top-0 h-[250px] w-[250px]" style={{ background: "radial-gradient(circle at top left, rgba(139,92,246,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div className="absolute bottom-0 right-0 h-[250px] w-[250px]" style={{ background: "radial-gradient(circle at bottom right, rgba(201,168,76,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        </>
      )}

      <header id="AI-Header" className="relative flex items-center gap-3">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px]" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.22), rgba(201,168,76,0.1))", border: "1px solid rgba(139,92,246,0.38)", boxShadow: "0 0 18px rgba(139,92,246,0.2)" }}>
          <Sparkles size={16} color="#A78BFA" />
        </div>
        <div>
          <span className="block text-[0.88rem] font-semibold tracking-[0.1em]" style={{ fontFamily: HEADING_FONT, color: "#A78BFA" }}>AI Interpretation</span>
          <span className="text-[0.72rem]" style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.3)" }}>
            {isLoading ? "Consulting the ancient wisdom..." : isTypingDone ? "Reading complete · scroll to explore" : "Channeling the cards..."}
          </span>
        </div>
        {isTypingDone && (
          <div className="ml-auto flex shrink-0 items-center gap-[5px]" style={{ color: "rgba(240,230,211,0.25)" }}>
            <BookOpen size={13} />
            <span className="text-[0.68rem] tracking-[0.06em]" style={{ fontFamily: "'Raleway', sans-serif" }}>FULL ANALYSIS</span>
          </div>
        )}
      </header>

      <GlowDivider variant="default" />

      <div id="AI-Content" className="relative" style={{ maxWidth: "68ch" }}>
        {isLoading ? (
          <AiSkeleton language={language} />
        ) : (
          <div className="relative">
            {isTypingDone ? (
              <MarkdownRenderer text={fullText} />
            ) : (
              <p className="min-h-[120px] whitespace-pre-wrap text-[0.97rem]" style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.78)", lineHeight: 1.95 }}>
                {displayedText}
                <span className="ml-0.5 inline-block h-[1em] w-0.5 align-text-bottom" style={{ background: "#8B5CF6", animation: "blink 0.7s step-end infinite" }} />
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
