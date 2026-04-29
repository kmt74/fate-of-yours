import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { LogOut, Sparkles, Shield, Globe, ChevronDown, Check, Clock } from "lucide-react";

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
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: "12px",
          }}
        >
          {/* Brand */}
          <button
            id="Header-Brand"
            onClick={() => navigate("/")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "10px", padding: 0, flexShrink: 0,
            }}
          >
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: "linear-gradient(135deg, #C9A84C, #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 12px rgba(139,92,246,0.35)",
            }}>
              <Sparkles size={13} color="white" />
            </div>
            <span style={{
              fontFamily: "'Cinzel', serif", color: "#C9A84C",
              fontSize: "0.95rem", letterSpacing: "0.06em", whiteSpace: "nowrap",
            }}>
              Fate of yours
            </span>
          </button>

          {/* Step Progress */}
          {step !== undefined && (
            <div
              id="Step-Progress"
              style={{
                display: "flex", alignItems: "center", gap: "4px",
                flex: 1, justifyContent: "center", minWidth: 0,
              }}
            >
              {STEPS.map((s, i) => (
                <React.Fragment key={s.n}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", opacity: step >= s.n ? 1 : 0.3 }}>
                    <div style={{
                      width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                      background: step > s.n ? "linear-gradient(135deg,#C9A84C,#A8873A)" : "transparent",
                      border: step === s.n ? "1.5px solid #C9A84C" : step > s.n ? "none" : "1.5px solid rgba(240,230,211,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.62rem", fontFamily: "'Cinzel', serif",
                      color: step > s.n ? "#0A0A12" : step === s.n ? "#C9A84C" : "rgba(240,230,211,0.35)",
                      fontWeight: 600,
                    }}>
                      {step > s.n ? "✓" : s.n}
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{
                      height: "1px", width: "24px", flexShrink: 0,
                      background: step > s.n ? "rgba(201,168,76,0.5)" : "rgba(240,230,211,0.1)",
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <LanguagePill lang={language} setLang={(l) => setLanguage(l)} />

            {/* History link */}
            <button
              id="History-Nav-Link"
              onClick={() => navigate("/history")}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                background: "rgba(201,168,76,0.06)",
                border: "1px solid rgba(201,168,76,0.18)",
                borderRadius: "8px", padding: "6px 10px",
                color: "rgba(201,168,76,0.65)", cursor: "pointer",
                fontFamily: "'Raleway', sans-serif", fontSize: "0.72rem",
                fontWeight: 600, letterSpacing: "0.04em", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.12)";
                (e.currentTarget as HTMLButtonElement).style.color = "#C9A84C";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.06)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(201,168,76,0.65)";
              }}
            >
              <Clock size={11} />
              <span>History</span>
            </button>

            <button
              id="Admin-Portal-Nav"
              onClick={() => setAdminOpen(true)}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.22)",
                borderRadius: "8px", padding: "6px 10px",
                color: "rgba(167,139,250,0.7)", cursor: "pointer",
                fontFamily: "'Raleway', sans-serif", fontSize: "0.72rem",
                fontWeight: 600, letterSpacing: "0.04em", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.14)";
                (e.currentTarget as HTMLButtonElement).style.color = "#A78BFA";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.07)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(167,139,250,0.7)";
              }}
            >
              <Shield size={11} />
              <span>Admin</span>
            </button>

            <button
              id="Logout-Button"
              onClick={handleLogout}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(240,230,211,0.09)",
                borderRadius: "8px", padding: "6px 11px",
                color: "rgba(240,230,211,0.45)", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "5px",
                transition: "all 0.2s ease",
                fontFamily: "'Raleway', sans-serif", fontSize: "0.74rem",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#C9A84C";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,230,211,0.45)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,230,211,0.09)";
              }}
            >
              <LogOut size={12} />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main id="Layout-Main" style={{ flex: 1 }}>{children}</main>

      {/* Admin Modal */}
      {adminOpen && <AdminModal onClose={() => setAdminOpen(false)} />}

      <style>{`
        @keyframes menuOpen {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Admin Modal ──────────────────────────────────────────────────────────────
function AdminModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");
    setTimeout(() => {
      setLoading(false);
      setErrMsg("Invalid admin credentials. Please contact your system administrator.");
    }, 800);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(5,5,12,0.88)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: "400px",
        background: "linear-gradient(160deg, #0F0F1E 0%, #0B0B16 100%)",
        border: "1px solid rgba(139,92,246,0.28)",
        borderRadius: "20px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(139,92,246,0.08)",
        padding: "28px", animation: "adminOpen 0.3s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "10px",
              background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Shield size={17} color="#A78BFA" />
            </div>
            <div>
              <div style={{ fontFamily: "'Cinzel', serif", color: "#F0E6D3", fontSize: "1rem", letterSpacing: "0.04em" }}>Admin Portal</div>
              <div style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.35)", fontSize: "0.72rem", marginTop: "2px" }}>Site & user management</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "7px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(240,230,211,0.4)", cursor: "pointer", fontSize: "14px" }}>✕</button>
        </div>

        <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.14)", borderRadius: "8px", padding: "10px 14px", marginBottom: "20px" }}>
          <p style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(167,139,250,0.65)", fontSize: "0.73rem", lineHeight: 1.6 }}>
            ⚠ Restricted access. Unauthorized entry attempts are logged and monitored.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.7rem", letterSpacing: "0.14em", fontWeight: 600, color: "rgba(240,230,211,0.45)", display: "block", marginBottom: "6px" }}>ADMIN EMAIL</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@fateofyours.com"
              style={{ fontFamily: "'Raleway', sans-serif", background: "#0E0E1A", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "8px", padding: "11px 14px", color: "#F0E6D3", fontSize: "0.88rem", outline: "none", width: "100%", boxSizing: "border-box" }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(139,92,246,0.5)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(139,92,246,0.2)"; }}
            />
          </div>
          <div>
            <label style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.7rem", letterSpacing: "0.14em", fontWeight: 600, color: "rgba(240,230,211,0.45)", display: "block", marginBottom: "6px" }}>ADMIN PASSWORD</label>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••"
              style={{ fontFamily: "'Raleway', sans-serif", background: "#0E0E1A", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "8px", padding: "11px 14px", color: "#F0E6D3", fontSize: "0.88rem", outline: "none", width: "100%", boxSizing: "border-box" }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(139,92,246,0.5)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(139,92,246,0.2)"; }}
            />
          </div>

          {errMsg && (
            <div style={{ background: "rgba(226,100,100,0.07)", border: "1px solid rgba(226,100,100,0.22)", borderRadius: "8px", padding: "10px 12px" }}>
              <p style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(226,100,100,0.85)", fontSize: "0.78rem" }}>{errMsg}</p>
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop: "4px",
            background: loading ? "rgba(109,40,217,0.4)" : "linear-gradient(135deg, #7C3AED, #6D28D9)",
            border: "none", borderRadius: "10px", padding: "13px",
            color: "#fff", fontFamily: "'Raleway', sans-serif", fontSize: "0.88rem",
            fontWeight: 700, letterSpacing: "0.05em", cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 18px rgba(109,40,217,0.4)",
          }}>
            {loading ? "Verifying..." : "Access Admin Dashboard"}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes adminOpen {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}