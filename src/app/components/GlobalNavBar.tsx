import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";

type Lang = "EN" | "VI" | "ZH";

// ─── Bilingual labels ──────────────────────────────────────────────────────────
const NAV_LABELS: Record<Lang, { back: string; next: string; loading: string }> = {
  EN: { back: "Go Back", next: "Continue", loading: "Processing..." },
  VI: { back: "Quay về", next: "Tiến lên", loading: "Đang xử lý..." },
  ZH: { back: "返回", next: "继续", loading: "处理中..." },
};

export interface GlobalNavBarProps {
  onBack?: () => void;
  onNext?: () => void;
  /** Override the back button label */
  backLabel?: string;
  /** Override the next button label */
  nextLabel?: string;
  /** Disable the next button (e.g. form not complete) */
  nextDisabled?: boolean;
  /** Show loading state on next button */
  nextLoading?: boolean;
  /** Extra helper text shown between the two buttons */
  helperText?: string;
}

export function GlobalNavBar({
  onBack,
  onNext,
  backLabel,
  nextLabel,
  nextDisabled = false,
  nextLoading = false,
  helperText,
}: GlobalNavBarProps) {
  const { language } = useApp();
  const lang = (language as Lang) || "EN";
  const L = NAV_LABELS[lang];

  const HEADING_FONT = lang === "VI" ? "'Playfair Display', serif" : "'Cinzel', serif";

  const [backHov, setBackHov] = useState(false);
  const [nextHov, setNextHov] = useState(false);

  const nextActive = !nextDisabled && !nextLoading;

  return (
    <div
      id="Global-Nav-Bar"
      style={{
        // Sticky bottom of viewport
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        // Atmospheric fade-up background
        background: "linear-gradient(to top, rgba(7,7,16,0.98) 0%, rgba(7,7,16,0.88) 80%, transparent 100%)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderTop: "1px solid rgba(240,230,211,0.07)",
        padding: "14px 24px 18px",
      }}
    >
      <div
        id="GlobalNavBar-Inner"
        style={{
          maxWidth: "920px",
          margin: "0 auto",
          // ── Space-between: back on left, next on right ──
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        {/* ── Left: Back / Quay về ────────────────────────────────────────── */}
        <button
          id="NavBar-Back-Button"
          onClick={onBack}
          disabled={!onBack}
          onMouseEnter={() => setBackHov(true)}
          onMouseLeave={() => setBackHov(false)}
          title={L.back}
          style={{
            // Secondary style: transparent bg, distinct border
            display: "flex", alignItems: "center", gap: "8px",
            background: backHov && onBack ? "rgba(240,230,211,0.06)" : "transparent",
            border: `1.5px solid ${onBack ? (backHov ? "rgba(240,230,211,0.35)" : "rgba(240,230,211,0.18)") : "rgba(240,230,211,0.06)"}`,
            borderRadius: "50px",
            padding: "11px 22px",
            color: onBack
              ? backHov ? "#F0E6D3" : "rgba(240,230,211,0.55)"
              : "rgba(240,230,211,0.15)",
            cursor: onBack ? "pointer" : "not-allowed",
            fontFamily: "'Raleway', sans-serif",
            fontSize: "0.88rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            transition: "all 0.2s ease",
            userSelect: "none",
          }}
        >
          <ChevronLeft size={16} />
          {backLabel || L.back}
        </button>

        {/* ── Centre helper text ──────────────────────────────────────────── */}
        {helperText && (
          <span style={{
            fontFamily: "'Raleway', sans-serif",
            color: "rgba(240,230,211,0.28)",
            fontSize: "0.76rem",
            letterSpacing: "0.04em",
            textAlign: "center",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {helperText}
          </span>
        )}

        {/* ── Right: Next / Tiến lên ──────────────────────────────────────── */}
        <button
          id="NavBar-Next-Button"
          onClick={nextActive ? onNext : undefined}
          disabled={!nextActive}
          onMouseEnter={() => setNextHov(true)}
          onMouseLeave={() => setNextHov(false)}
          title={nextDisabled ? "Complete required fields first" : L.next}
          style={{
            // Primary gradient fill
            display: "flex", alignItems: "center", gap: "8px",
            background: nextDisabled
              ? "rgba(201,168,76,0.12)"
              : nextLoading
              ? "rgba(201,168,76,0.5)"
              : nextHov
              ? "linear-gradient(135deg, #D4B85C, #B8942A)"
              : "linear-gradient(135deg, #C9A84C, #A8873A)",
            border: nextDisabled
              ? "1.5px solid rgba(201,168,76,0.15)"
              : "none",
            borderRadius: "50px",
            padding: "12px 28px",
            color: nextDisabled ? "rgba(201,168,76,0.35)" : "#0A0A12",
            cursor: nextActive ? "pointer" : "not-allowed",
            fontFamily: HEADING_FONT,
            fontSize: "0.88rem",
            fontWeight: 600,
            letterSpacing: "0.07em",
            boxShadow: nextActive
              ? nextHov
                ? "0 6px 28px rgba(201,168,76,0.5), 0 0 60px rgba(201,168,76,0.2)"
                : "0 4px 20px rgba(201,168,76,0.28)"
              : "none",
            transform: nextHov && nextActive ? "translateY(-2px)" : "none",
            transition: "all 0.25s ease",
            userSelect: "none",
            minWidth: "140px",
            justifyContent: "center",
          }}
        >
          {nextLoading ? (
            <>
              <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
              {L.loading}
            </>
          ) : (
            <>
              {nextLabel || L.next}
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
