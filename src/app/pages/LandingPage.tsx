import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { Shield, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import { AuthModule, AdminModal } from "../components/auth/AuthModal";
import { ImmersiveScrollScene } from "../components/landing/ImmersiveScrollScene";
import { useLocale } from "../../hooks/useLocale";

type Lang = "EN" | "VI" | "ZH";

// ─── Language Toggle ──────────────────────────────────────────────────────────
function LanguageToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const labels: { code: Lang; native: string }[] = [
    { code: "EN", native: "EN" },
    { code: "VI", native: "VI" },
    { code: "ZH", native: "ZH" },
  ];

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(240,230,211,0.12)", borderRadius: "8px",
          padding: "7px 12px", color: "rgba(240,230,211,0.5)", cursor: "pointer",
          fontFamily: "'Raleway',sans-serif", fontSize: "0.78rem", fontWeight: 600,
          display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s"
        }}
      >
        <span>{lang}</span>
        <span style={{ fontSize: "10px", opacity: 0.5 }}>▼</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "6px", background: "#131320", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "8px", overflow: "hidden", zIndex: 200, minWidth: "80px" }}>
          {labels.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }} style={{ width: "100%", padding: "10px", background: lang === l.code ? "rgba(201,168,76,0.1)" : "transparent", border: "none", color: lang === l.code ? "#C9A84C" : "#F0E6D3", fontSize: "0.75rem", cursor: "pointer", textAlign: "center" }}>{l.native}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared UI ───
function GlassPanel({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <div id={id} style={{
      background: "rgba(10,10,25,0.45)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      border: "1px solid rgba(240,230,211,0.06)",
      borderRadius: "24px",
      padding: "32px",
      width: "100%",
    }}>
      {children}
    </div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isAuthenticated, user, language, setLanguage } = useApp();
  const [adminOpen, setAdminOpen] = useState(false);
  const locale = useLocale();
  const navigate = useNavigate();
  const t = locale.landing;

  const lang = language as Lang;
  const HEADING_FONT = lang === "VI" ? "'Playfair Display', serif" : "'Cinzel', serif";

  return (
    <div id="Landing-Page" style={{ backgroundColor: "#070710", minHeight: "100vh" }}>
      
      {/* Unified Background Layer */}
      <div
        id="Unified-Background"
        style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1,
          background: "linear-gradient(145deg, #070710 0%, #0B0918 50%, #080810 100%)",
          overflow: "hidden"
        }}
      >
        {/* The scene is now moved inside the main scroller for better trigger sync */}
      </div>

      <nav id="Nav-Bar" style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 100, backgroundColor: "rgba(7,7,16,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(201,168,76,0.06)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div 
            id="Nav-Logo" 
            onClick={() => navigate(isAuthenticated ? "/setup" : "/")}
            style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
          >
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "linear-gradient(135deg,#C9A84C,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>✦</div>
            <span style={{ 
              fontFamily: HEADING_FONT, color: "#C9A84C", fontSize: "1rem", 
              letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 
            }}>Fate of Yours</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <LanguageToggle lang={lang} setLang={(l) => setLanguage(l)} />
            <button id="Admin-Portal-Button" onClick={() => setAdminOpen(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "8px", padding: "7px 14px", color: "rgba(167,139,250,0.7)", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", transition: "all 0.2s" }}>
              <Shield size={12} /><span>Admin</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main id="Landing-Main" style={{ 
        position: "relative", 
        zIndex: 10, 
        paddingTop: "64px"
      }}>
        <ImmersiveScrollScene />
        <style>{`
          html {
            scroll-snap-type: y mandatory;
            scroll-behavior: smooth;
          }
          #Landing-Main section {
            scroll-snap-align: start;
            min-height: 100vh;
          }
        `}</style>
        <div id="Landing-Content-Wrapper" style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column" }}>
          
          {/* Hero */}
          <section id="Hero-Section" style={{ 
            minHeight: "calc(100vh - 64px)", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            textAlign: "center", 
            gap: "32px",
            scrollSnapAlign: "start",
            padding: "40px 24px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ height: "1px", width: "40px", background: "linear-gradient(to right,transparent,rgba(201,168,76,0.4))" }} />
              <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(201,168,76,0.5)", fontSize: "0.65rem", letterSpacing: "0.25em", fontWeight: 600 }}>{t.eyebrow}</span>
              <div style={{ height: "1px", width: "40px", background: "linear-gradient(to left,transparent,rgba(201,168,76,0.4))" }} />
            </div>
            <h1 style={{
              fontFamily: HEADING_FONT, fontSize: "clamp(2.5rem, 8vw, 6rem)",
              fontWeight: 700, lineHeight: 1.1, letterSpacing: "0.04em", maxWidth: "900px",
              background: "linear-gradient(135deg, #FACC15 0%, #C9A84C 30%, #8B5CF6 70%, #D8B4FE 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "glimmer 4s linear infinite"
            }}>{t.title}</h1>
            <p style={{ fontFamily: HEADING_FONT, color: "#C9A84C", fontSize: "clamp(1rem, 2.5vw, 1.25rem)", letterSpacing: "0.1em" }}>{t.subtitle}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ height: "1px", width: "60px", background: "linear-gradient(to right,transparent,rgba(139,92,246,0.3))" }} />
              <Sparkles size={14} color="rgba(139,92,246,0.4)" />
              <div style={{ height: "1px", width: "60px", background: "linear-gradient(to left,transparent,rgba(139,92,246,0.3))" }} />
            </div>
            <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.45)", fontSize: "clamp(0.85rem, 1.8vw, 1rem)", lineHeight: 1.8, fontStyle: "italic", maxWidth: "560px" }}>{t.quote}</p>
            <button onClick={() => document.getElementById("Auth-Section")?.scrollIntoView({ behavior: "smooth" })} style={{ marginTop: "20px", background: "linear-gradient(135deg, rgba(201,168,76,0.1), transparent)", border: "1.5px solid rgba(201,168,76,0.25)", borderRadius: "50px", padding: "14px 32px", color: "#C9A84C", fontFamily: HEADING_FONT, fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.3s" }}>{t.cta}</button>
          </section>

          {/* Intro to Tarot */}
          <section id="Intro-Tarot" style={{ 
            scrollMarginTop: "64px", 
            scrollSnapAlign: "start",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            padding: "40px 24px"
          }}>
            <GlassPanel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "60px", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(201,168,76,0.6)", fontSize: "0.7rem", letterSpacing: "0.25em", fontWeight: 600 }}>{t.introBadge}</span>
                  <h2 style={{ fontFamily: HEADING_FONT, color: "#F0E6D3", fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 600, letterSpacing: "0.04em", lineHeight: 1.3 }}>{t.introHeadline}<br /><span style={{ color: "#C9A84C" }}>{t.introHeadline2}</span></h2>
                  <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.55)", fontSize: "1rem", lineHeight: 1.8 }}>{t.introP1}</p>
                  <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.45)", fontSize: "0.95rem", lineHeight: 1.8 }}>{t.introP2}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {t.introBullets.map((b: string) => (
                      <div key={b} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "linear-gradient(135deg,#C9A84C,#8B5CF6)" }} />
                        <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.5)", fontSize: "0.9rem" }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", aspectRatio: "4/5", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
                  <img src="https://images.unsplash.com/photo-1603162496424-afdc5011767a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800" alt="Ancient esoteric library" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.6) saturate(0.8)" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,25,0.9) 0%, transparent 60%)" }} />
                  <div style={{ position: "absolute", bottom: "30px", left: "30px", right: "30px", fontFamily: HEADING_FONT, color: "#C9A84C", fontSize: "0.85rem", letterSpacing: "0.15em", textAlign: "center", fontStyle: "italic" }}>{t.introPullQuote}</div>
                </div>
              </div>
            </GlassPanel>
          </section>

          {/* Benefits */}
          <section id="Benefits-Section" style={{ 
            scrollMarginTop: "64px", 
            scrollSnapAlign: "start",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            padding: "40px 24px"
          }}>
            <GlassPanel>
              <div style={{ textAlign: "center", marginBottom: "50px" }}>
                <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(201,168,76,0.6)", fontSize: "0.7rem", letterSpacing: "0.25em", fontWeight: 600, display: "block", marginBottom: "12px" }}>{t.benefitsBadge}</span>
                <h2 style={{ fontFamily: HEADING_FONT, color: "#F0E6D3", fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 600, letterSpacing: "0.04em" }}>{t.benefitsTitle} <span style={{ color: "#C9A84C" }}>{t.benefitsTitleAccent}</span></h2>
                <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.45)", fontSize: "1rem", maxWidth: "560px", margin: "16px auto 0", lineHeight: 1.7 }}>{t.benefitsSub}</p>
              </div>
              <div className="benefits-grid" style={{ display: "grid", gap: "32px" }}>
                {t.benefits.map((b: any, i: number) => {
                  const colors = [
                    { accent: "#8B5CF6", glow: "rgba(139, 92, 246, 0.5)" }, // Amethyst
                    { accent: "#3B82F6", glow: "rgba(59, 130, 246, 0.5)" },  // Sapphire
                    { accent: "#10B981", glow: "rgba(16, 185, 129, 0.5)" },  // Emerald
                    { accent: "#4B5563", glow: "rgba(75, 85, 99, 0.5)" },   // Obsidian
                    { accent: "#EF4444", glow: "rgba(239, 68, 68, 0.5)" },   // Ruby
                    { accent: "#1E40AF", glow: "rgba(30, 64, 175, 0.5)" },   // Twilight
                  ];
                  const c = colors[i % colors.length];
                  return (
                    <div key={i} className="benefit-card" style={{
                      background: "rgba(255,255,255,0.03)", 
                      border: `1px solid rgba(240,230,211,0.08)`, 
                      borderRadius: "16px", padding: "24px", 
                      display: "flex", flexDirection: "column", gap: "16px",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      // @ts-ignore
                      "--accent-color": c.accent,
                      "--glow-color": c.glow
                    }}>
                      <div style={{ 
                        width: "40px", height: "40px", borderRadius: "10px", 
                        background: `rgba(${parseInt(c.accent.slice(1,3),16)}, ${parseInt(c.accent.slice(3,5),16)}, ${parseInt(c.accent.slice(5,7),16)}, 0.1)`, 
                        border: `1px solid ${c.accent}40`, 
                        display: "flex", alignItems: "center", justifyContent: "center", 
                        color: c.accent 
                      }}>✦</div>
                      <div>
                        <h3 style={{ fontFamily: HEADING_FONT, color: "#F0E6D3", fontSize: "0.95rem", fontWeight: 600, marginBottom: "8px" }}>{b.title}</h3>
                        <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.4)", fontSize: "0.85rem", lineHeight: 1.7 }}>{b.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassPanel>
          </section>

          <section id="Auth-Section" style={{ 
            minHeight: "100vh", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            scrollMarginTop: "64px",
            scrollSnapAlign: "start",
            padding: "40px 24px"
          }}>
            {isAuthenticated ? (
              <div style={{ textAlign: "center", padding: "48px 30px", background: "linear-gradient(160deg, rgba(16,14,30,0.94) 0%, rgba(10,10,20,0.96) 100%)", borderRadius: "22px", border: "1px solid rgba(201,168,76,0.18)", maxWidth: "440px", width: "100%", boxShadow: "0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                 <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg,rgba(201,168,76,0.2),rgba(139,92,246,0.2))", border: "1.5px solid rgba(201,168,76,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "0 0 14px rgba(139,92,246,0.2)", margin: "0 auto 20px" }}>✦</div>
                 <h2 style={{ fontFamily: HEADING_FONT, color: "#F0E6D3", fontSize: "1.8rem", marginBottom: "10px", letterSpacing: "0.04em" }}>{t.welcomeBack}</h2>
                 <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.45)", fontSize: "0.9rem", marginBottom: "30px" }}>{t.welcomeSub}</p>
                 <button onClick={() => navigate(user?.isAdmin ? "/admin" : "/setup")} style={{ background: "linear-gradient(135deg,#C9A84C,#A8873A)", border: "none", borderRadius: "10px", padding: "14px 28px", color: "#0A0A12", fontFamily: HEADING_FONT, fontSize: "0.92rem", fontWeight: 700, letterSpacing: "0.06em", cursor: "pointer", boxShadow: "0 4px 20px rgba(201,168,76,0.3)", width: "100%" }}>
                   {t.continueBtn}
                 </button>
              </div>
            ) : (
              <AuthModule c={t.auth} />
            )}
          </section>

          {/* Footer CTA */}
          <section id="Footer-CTA" style={{ 
            padding: "80px 24px", 
            textAlign: "center", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            gap: "24px",
            scrollSnapAlign: "start",
            minHeight: "100vh",
            justifyContent: "center"
          }}>
            <div style={{
              background: "rgba(10, 10, 25, 0.3)",
              backdropFilter: "blur(12px)",
              border: "1.5px solid rgba(201, 168, 76, 0.12)",
              borderRadius: "28px",
              padding: "60px 40px",
              width: "100%",
              maxWidth: "800px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
              animation: "frameEntrance 1s ease-out"
            }}>
              <div style={{ fontSize: "20px", letterSpacing: "10px", color: "rgba(201,168,76,0.4)" }}>✦ ✦ ✦</div>
              <h2 style={{ fontFamily: HEADING_FONT, color: "#F0E6D3", fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 600, letterSpacing: "0.06em" }}>{t.footerTitle}</h2>
              <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.45)", fontSize: "1rem", maxWidth: "460px", lineHeight: 1.8 }}>{t.footerSub}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "rgba(201,168,76,0.3)", fontSize: "0.75rem", fontFamily: "'Raleway',sans-serif", letterSpacing: "0.2em", fontWeight: 600 }}>
                {t.footerTags.map((tag: string, i: number) => (
                  <React.Fragment key={tag}>{i > 0 && <span>·</span>}<span>{tag}</span></React.Fragment>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>

      {adminOpen && <AdminModal onClose={() => setAdminOpen(false)} />}

      <style>{`
        @keyframes twinkle { from{opacity:0.05;transform:scale(0.8)} to{opacity:0.7;transform:scale(1.2)} }
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(5px)} }
        @keyframes menuOpen { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popUp { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes breathe { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.08)} }
        @keyframes spinSlow { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes glimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes frameEntrance {
          from { opacity: 0; transform: scale(0.98) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .benefits-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 1024px) {
          .benefits-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .benefits-grid { grid-template-columns: 1fr; }
        }
        .benefit-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-color) !important;
          box-shadow: 0 10px 30px -10px var(--glow-color);
          background: rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
    </div>
  );
}
