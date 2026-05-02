import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { LogOut, Sparkles, Shield, Globe, ChevronDown, Check, Clock } from "lucide-react";
import { AdminModal } from "./admin-modal";

type Lang = "EN" | "VI" | "ZH";

// ─── Language Toggle ──────────────────────────────────────────────────────────
function LanguagePill({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const labels: { code: Lang; native: string }[] = [
    { code: "EN", native: "English" },
    { code: "VI", native: "Tiếng Việt" },
    { code: "ZH", native: "中文" },
  ];

  return (
    <div style={{ position: "relative" }}>
      <button
        id="Lang-Toggle"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: "5px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(240,230,211,0.1)", borderRadius: "8px",
          padding: "6px 10px", color: "rgba(240,230,211,0.55)", cursor: "pointer",
          fontFamily: "'Raleway', sans-serif", fontSize: "0.76rem",
          letterSpacing: "0.04em", transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.3)"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,230,211,0.1)"; }}
      >
        <Globe size={12} />
        <span style={{ fontWeight: 600 }}>{lang}</span>
        <ChevronDown size={10} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "#131320", border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: "10px", padding: "5px",
          minWidth: "140px", zIndex: 200,
          boxShadow: "0 16px 40px rgba(0,0,0,0.7)",
          animation: "menuOpen 0.15s ease",
        }}>
          {labels.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: "8px",
                background: lang === l.code ? "rgba(201,168,76,0.1)" : "transparent",
                border: "none", borderRadius: "6px", padding: "8px 10px",
                cursor: "pointer", fontFamily: "'Raleway', sans-serif",
                fontSize: "0.78rem", fontWeight: 500,
                color: lang === l.code ? "#C9A84C" : "rgba(240,230,211,0.55)",
              }}
            >
              {l.native}
              {lang === l.code && <Check size={11} color="#C9A84C" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step Progress ────────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, label: "Set Intention" },
  { n: 2, label: "Draw Cards" },
  { n: 3, label: "Reading" },
];

interface LayoutProps {
  children: React.ReactNode;
  step?: number;
}

export function Layout({ children, step }: LayoutProps) {
  const { user, logout, language, setLanguage } = useApp();
  const navigate = useNavigate();
  const [adminOpen, setAdminOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div id="Layout-Root" style={{ minHeight: "100vh", backgroundColor: "#0A0A12", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <header
        id="Layout-Header"
        style={{
          position: "sticky", top: 0, zIndex: 50,
          backgroundColor: "rgba(10,10,18,0.92)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(201,168,76,0.1)",
        }}
      >
        <div
          id="Header-Inner"
          style={{
            maxWidth: "1240px", margin: "0 auto",
            padding: "0 24px", height: "64px",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* Left: Brand */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
            <button
              id="Header-Brand"
              onClick={() => navigate("/")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "12px", padding: 0,
              }}
            >
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "linear-gradient(135deg, #C9A84C, #8B5CF6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 15px rgba(139,92,246,0.35)",
              }}>
                <Sparkles size={14} color="white" />
              </div>
              <span style={{
                fontFamily: "'Cinzel', serif", color: "#C9A84C",
                fontSize: "1rem", letterSpacing: "0.08em", whiteSpace: "nowrap",
                fontWeight: 600
              }}>
                Fate of yours
              </span>
            </button>
          </div>

          {/* Center: Step Progress */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            {step !== undefined && (
              <div
                id="Step-Progress"
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  minWidth: 0,
                }}
              >
                {STEPS.map((s, i) => (
                  <React.Fragment key={s.n}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: step >= s.n ? 1 : 0.25 }}>
                      <div style={{
                        width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                        background: step > s.n ? "linear-gradient(135deg,#C9A84C,#A8873A)" : "transparent",
                        border: step === s.n ? "1.5px solid #C9A84C" : step > s.n ? "none" : "1.5px solid rgba(240,230,211,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.68rem", fontFamily: "'Cinzel', serif",
                        color: step > s.n ? "#0A0A12" : step === s.n ? "#C9A84C" : "rgba(240,230,211,0.35)",
                        fontWeight: 700,
                      }}>
                        {step > s.n ? "✓" : s.n}
                      </div>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{
                        height: "1px", width: "30px", flexShrink: 0,
                        background: step > s.n ? "rgba(201,168,76,0.4)" : "rgba(240,230,211,0.1)",
                      }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Right: Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-end" }}>
            <LanguagePill lang={language} setLang={(l) => setLanguage(l)} />
            
            <button
              id="History-Nav-Link"
              onClick={() => navigate("/history")}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "rgba(201,168,76,0.06)",
                border: "1px solid rgba(201,168,76,0.18)",
                borderRadius: "8px", padding: "7px 12px",
                color: "rgba(201,168,76,0.7)", cursor: "pointer",
                fontFamily: "'Raleway', sans-serif", fontSize: "0.72rem",
                fontWeight: 600, letterSpacing: "0.04em", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.12)";
                (e.currentTarget as HTMLButtonElement).style.color = "#C9A84C";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.35)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.06)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(201,168,76,0.7)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.18)";
              }}
            >
              <Clock size={12} />
              <span>History</span>
            </button>

            <button
              id="Admin-Portal-Nav"
              onClick={() => setAdminOpen(true)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.22)",
                borderRadius: "8px", padding: "7px 12px",
                color: "rgba(167,139,250,0.8)", cursor: "pointer",
                fontFamily: "'Raleway', sans-serif", fontSize: "0.72rem",
                fontWeight: 600, letterSpacing: "0.04em", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.15)";
                (e.currentTarget as HTMLButtonElement).style.color = "#A78BFA";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.07)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(167,139,250,0.8)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.22)";
              }}
            >
              <Shield size={12} />
              <span>Admin</span>
            </button>

            <button
              id="Logout-Button"
              onClick={handleLogout}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(240,230,211,0.12)",
                borderRadius: "8px", padding: "7px 12px",
                color: "rgba(240,230,211,0.5)", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
                transition: "all 0.2s ease",
                fontFamily: "'Raleway', sans-serif", fontSize: "0.74rem",
                fontWeight: 600
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#C9A84C";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.4)";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,230,211,0.5)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,230,211,0.12)";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
              }}
            >
              <LogOut size={13} />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main id="Layout-Main" style={{ flex: 1 }}>{children}</main>

      {/* Admin Modal */}
      <AdminModal isOpen={adminOpen} onClose={() => setAdminOpen(false)} />

      <style>{`
        @keyframes menuOpen {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}