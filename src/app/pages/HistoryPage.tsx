import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Layout } from "../components/Layout";
import { GlobalNavBar } from "../components/GlobalNavBar";
import { CATEGORIES, CATEGORY_VI, CATEGORY_ZH } from "../data/tarot-data";
import {
  Briefcase, Heart, Users, BookOpen, Coins, Leaf, Star, Home,
  Calendar, ChevronDown, ChevronUp, Filter, ArrowUpDown, Sparkles,
} from "lucide-react";
import { MarkdownRenderer } from "../components/reading/MarkdownRenderer";
import { RevealedTarotCard } from "../components/reading/RevealedTarotCard";
import { ReadingContextCard } from "../components/reading/ReadingContextCard";
import { useLocale } from "../../hooks/useLocale";
import type { TarotCard } from "../data/tarot-data";

// ─── Shared UI Helpers ────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ReactNode> = {
  career: <Briefcase size={15} />,
  love: <Heart size={15} />,
  friendship: <Users size={15} />,
  general: <BookOpen size={15} />,
  finance: <Coins size={15} />,
  health: <Leaf size={15} />,
  spiritual: <Star size={15} />,
  family: <Home size={15} />,
};

function hexToRgb(hex: string) {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}

function formatDate(value: string | number, locale: string) {
  const d = new Date(value);
  const dateStr = d.toLocaleDateString(locale === "VI" ? "vi-VN" : locale === "ZH" ? "zh-CN" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = d.toLocaleTimeString(locale === "VI" ? "vi-VN" : locale === "ZH" ? "zh-CN" : "en-GB", { hour: "2-digit", minute: "2-digit" });
  return { date: dateStr, time: timeStr };
}

// ─── Mini Card Thumbnail ──────────────────────────────────────────────────────
function MiniCard({ card, index, language, t }: { card: any; index: number; language: string; t: any }) {
  const isGold = card.suit === "major";
  const isReversed = card.orientation === "reversed";
  const positions = [t.deck.past, t.deck.present, t.deck.future];
  const barColor = isReversed ? "#ef4444" : "#C9A84C";

  const getLocalizedName = (card: any) => {
    return card.name;
  };
  
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flexShrink: 0 }}>
      <div style={{
        width: "44px", height: "66px", borderRadius: "4px",
        background: "linear-gradient(145deg,#1A1430,#130F22)",
        border: `1px solid ${isGold ? "rgba(201,168,76,0.3)" : "rgba(139,92,246,0.3)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", position: "relative",
        boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
      }}>
        {card.image ? (
          <img 
            src={card.image} 
            alt={card.name}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transform: isReversed ? "rotate(180deg)" : "none",
              filter: "brightness(0.9) contrast(1.1)"
            }}
          />
        ) : (
          <span style={{ fontSize: "14px" }}>{card.symbol}</span>
        )}
        
        {/* Tooltip for hover */}
        <div 
          title={`${positions[index]}: ${getLocalizedName(card)} (${isReversed ? t.reading.reversed : t.reading.upright})`}
          style={{ position: "absolute", inset: 0, cursor: "help" }}
        />
      </div>

      <div style={{ 
        width: "20px",
        height: "2.5px", 
        borderRadius: "10px",
        background: barColor,
        boxShadow: `0 0 8px ${barColor}66`,
        transition: "all 0.3s ease"
      }} />
    </div>
  );
}

// ─── History Item ─────────────────────────────────────────────────────────────
function HistoryItem({ reading, language, t, onClick }: { reading: any; language: string; t: any; onClick: () => void }) {
  const category = CATEGORIES.find((c) => c.id === reading.category);
  const { date, time } = formatDate(reading.timestamp, language);
  const rgb = category ? hexToRgb(category.accentColor) : "201,168,76";
  const [hov, setHov] = useState(false);

  const HEADING_FONT = language === "VI" ? "'Playfair Display', serif" : "'Cinzel', serif";

  const getLocalizedCategory = (id: string) => {
    if (language === "VI") return CATEGORY_VI[id]?.label || id;
    if (language === "ZH") return CATEGORY_ZH[id]?.label || id;
    return CATEGORIES.find(c => c.id === id)?.label || id;
  };

  return (
    <div
      id={`History-Item-${reading.id}`}
      onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(255,255,255,0.032)" : "rgba(255,255,255,0.018)",
        border: `1px solid ${hov ? "rgba(240,230,211,0.1)" : "rgba(240,230,211,0.07)"}`,
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.22s ease",
      }}
    >
      <div style={{ padding: "18px 22px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "11px", flexShrink: 0,
          background: `rgba(${rgb},0.1)`,
          border: `1px solid rgba(${rgb},0.25)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: category?.accentColor ?? "#C9A84C",
          marginTop: "2px",
        }}>
          {ICON_MAP[reading.category]}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{
                  fontFamily: "'Raleway',sans-serif", fontSize: "0.66rem", fontWeight: 700,
                  letterSpacing: "0.14em", color: category?.accentColor ?? "#C9A84C",
                  background: `rgba(${rgb},0.1)`,
                  border: `1px solid rgba(${rgb},0.2)`,
                  borderRadius: "20px", padding: "2px 10px",
                }}>
                  {getLocalizedCategory(reading.category).toUpperCase()}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "rgba(240,230,211,0.3)" }}>
                  <Calendar size={11} />
                  <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.72rem" }}>{date} · {time}</span>
                </div>
              </div>

              <p style={{
                fontFamily: HEADING_FONT, color: "rgba(240,230,211,0.82)",
                fontSize: "0.88rem", letterSpacing: "0.02em", lineHeight: 1.5,
                maxWidth: "480px",
              }}>
                "{reading.question}"
              </p>
            </div>

            <div id="Card-Thumbnails" style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
              {reading.cards.map((card: any, i: number) => (
                <MiniCard key={card.id} card={card} index={i} language={language} t={t} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0, alignItems: "flex-end" }}>
          <button
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: hov ? `rgba(${rgb},0.12)` : "rgba(255,255,255,0.04)",
              border: `1px solid ${hov ? `rgba(${rgb},0.35)` : "rgba(240,230,211,0.1)"}`,
              borderRadius: "8px", padding: "7px 14px",
              color: hov ? (category?.accentColor ?? "#C9A84C") : "rgba(240,230,211,0.5)",
              cursor: "pointer", fontFamily: "'Raleway',sans-serif",
              fontSize: "0.76rem", fontWeight: 600, letterSpacing: "0.04em",
              transition: "all 0.2s",
            }}
          >
            <Sparkles size={12} />
            {t.history.actions.view}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ language, t }: { language: string; t: any }) {
  const navigate = useNavigate();
  const HEADING_FONT = language === "VI" ? "'Playfair Display', serif" : "'Cinzel', serif";

  return (
    <div id="Empty-State" style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: "20px", textAlign: "center", padding: "72px 24px",
    }}>
      <div style={{
        width: "80px", height: "80px", borderRadius: "50%",
        background: "linear-gradient(145deg,rgba(201,168,76,0.12),rgba(139,92,246,0.12))",
        border: "1.5px solid rgba(201,168,76,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "28px", boxShadow: "0 0 30px rgba(139,92,246,0.12)",
      }}>◌</div>
      <h3 style={{ fontFamily: HEADING_FONT, color: "#F0E6D3", fontSize: "1.2rem", fontWeight: 600, letterSpacing: "0.04em" }}>
        {t.history.empty.title}
      </h3>
      <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.4)", fontSize: "0.9rem", lineHeight: 1.8, maxWidth: "360px" }}>
        {t.history.empty.desc}
      </p>
      <button onClick={() => navigate("/setup")} style={{
        display: "flex", alignItems: "center", gap: "8px",
        background: "linear-gradient(135deg,#C9A84C,#A8873A)",
        border: "none", borderRadius: "50px", padding: "13px 28px",
        color: "#0A0A12", fontFamily: HEADING_FONT, fontSize: "0.88rem",
        fontWeight: 600, letterSpacing: "0.08em", cursor: "pointer",
        boxShadow: "0 4px 20px rgba(201,168,76,0.28)",
      }}>
        <Sparkles size={15} /> {t.history.empty.btn}
      </button>
    </div>
  );
}

// ─── History Page ─────────────────────────────────────────────────────────────
type SortKey = "date_desc" | "date_asc" | "category";
type FilterKey = "all" | "love" | "career" | "finance" | "health" | "spiritual" | "family" | "friendship" | "general";

export default function HistoryPage() {
  const { user, history, language } = useApp();
  const navigate = useNavigate();
  const t = useLocale();

  const [sort, setSort] = useState<SortKey>("date_desc");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedReading, setSelectedReading] = useState<any>(null);

  const HEADING_FONT = language === "VI" ? "'Playfair Display', serif" : "'Cinzel', serif";

  const readings = history;

  const filtered = useMemo(() => {
    let arr = [...readings];
    if (filter !== "all") arr = arr.filter((r) => r.category === filter);
    arr.sort((a, b) => {
      if (sort === "date_desc") return b.timestamp - a.timestamp;
      if (sort === "date_asc") return a.timestamp - b.timestamp;
      return (a.category || "").localeCompare(b.category || "");
    });
    return arr;
  }, [readings, sort, filter]);

  const sortLabels: Record<SortKey, string> = { 
    date_desc: t.history.sort.newest, 
    date_asc: t.history.sort.oldest, 
    category: t.history.sort.category 
  };

  const getLocalizedCategory = (id: string) => {
    if (language === "VI") return CATEGORY_VI[id]?.label || id;
    if (language === "ZH") return CATEGORY_ZH[id]?.label || id;
    return CATEGORIES.find(c => c.id === id)?.label || id;
  };

  if (selectedReading) {
    const categoryObj = CATEGORIES.find(c => c.id === selectedReading.category);
    const rgb = categoryObj ? hexToRgb(categoryObj.accentColor) : "201,168,76";
    
    return (
      <Layout>
        <div style={{ 
          minHeight: "calc(100vh - 64px)", 
          backgroundColor: "#0A0A12", 
          backgroundImage: `radial-gradient(ellipse at 50% 0%,rgba(${rgb},0.06) 0%,transparent 55%)`, 
          padding: "48px 24px 120px" 
        }}>
          <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "40px", alignItems: "center" }}>
            
            <div style={{ width: "100%", maxWidth: "600px", animation: "slideDown 0.4s ease" }}>
              {categoryObj && <ReadingContextCard category={categoryObj} question={selectedReading.question} />}
            </div>

            <div style={{ 
              display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center",
              animation: "slideDown 0.5s ease"
            }}>
              {selectedReading.cards.map((card: any, i: number) => (
                <RevealedTarotCard 
                  key={card.id} 
                  card={card} 
                  position={["past", "present", "future"][i] as any} 
                  positionIndex={i} 
                  revealed={true} 
                  delay={i * 100} 
                />
              ))}
            </div>

            <div style={{ 
              width: "100%", 
              background: `rgba(${rgb},0.04)`, 
              borderRadius: "16px", 
              padding: "32px", 
              border: `1px solid rgba(${rgb},0.15)`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(${rgb},0.1)`,
              animation: "slideDown 0.6s ease"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <Sparkles size={18} color={categoryObj?.accentColor ?? "#C9A84C"} />
                <h3 style={{ fontFamily: HEADING_FONT, color: categoryObj?.accentColor ?? "#C9A84C", fontSize: "1.1rem", letterSpacing: "0.08em" }}>
                  {t.reading.aiSummary}
                </h3>
              </div>
              <MarkdownRenderer text={selectedReading.summary} />
            </div>

          </div>
        </div>

        <GlobalNavBar
          onBack={() => setSelectedReading(null)}
          onNext={() => navigate("/setup")}
          nextLabel={t.reading.newReading}
        />
        
        <style>{`
          @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </Layout>
    );
  }

  return (
    <Layout>
      <div id="History-Page" style={{ minHeight: "calc(100vh - 64px)", backgroundColor: "#0A0A12", backgroundImage: "radial-gradient(ellipse at 50% 0%,rgba(139,92,246,0.06) 0%,transparent 55%)", padding: "48px 24px 80px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "36px" }}>

          {/* ── Page Header ── */}
          <div id="History-Header" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ height: "1px", width: "32px", background: "linear-gradient(to right,transparent,rgba(201,168,76,0.5))" }} />
              <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(201,168,76,0.6)", fontSize: "0.67rem", letterSpacing: "0.22em", fontWeight: 600 }}>{t.history.step}</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <h1 style={{ fontFamily: HEADING_FONT, color: "#F0E6D3", fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 600, letterSpacing: "0.04em", marginBottom: "6px" }}>
                  {t.history.heading}
                </h1>
                <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.38)", fontSize: "0.85rem" }}>
                  {t.history.welcome.replace("{name}", user?.email?.split("@")[0] ?? "Seeker")}
                  {" · "}
                  <span style={{ color: "rgba(240,230,211,0.45)" }}>{t.history.count.replace("{n}", String(readings.length))}</span>
                </p>
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: "10px" }}>
                {[
                  { label: t.history.stats.total, value: String(readings.length) },
                  { label: t.history.stats.month, value: String(readings.filter((r) => r.timestamp > Date.now() - 30*24*60*60*1000).length) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(240,230,211,0.08)", borderRadius: "12px", padding: "10px 18px", textAlign: "center" }}>
                    <div style={{ fontFamily: HEADING_FONT, color: "#C9A84C", fontSize: "1.3rem", fontWeight: 600 }}>{value}</div>
                    <div style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.3)", fontSize: "0.65rem", letterSpacing: "0.1em", marginTop: "2px" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Filter & Sort Bar ── */}
          <div id="Filter-Sort-Bar" style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }} style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: filter !== "all" ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${filter !== "all" ? "rgba(139,92,246,0.35)" : "rgba(240,230,211,0.1)"}`,
                borderRadius: "8px", padding: "8px 14px",
                color: filter !== "all" ? "#A78BFA" : "rgba(240,230,211,0.5)",
                cursor: "pointer", fontFamily: "'Raleway',sans-serif",
                fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.04em",
                transition: "all 0.2s",
              }}>
                <Filter size={12} />
                {filter === "all" ? t.history.filters.all : getLocalizedCategory(filter)}
                <ChevronDown size={11} style={{ transform: showFilterMenu ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {showFilterMenu && (
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50,
                  background: "#131320", border: "1px solid rgba(139,92,246,0.2)",
                  borderRadius: "12px", padding: "6px", minWidth: "180px",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                  animation: "menuOpen 0.15s ease",
                }}>
                  {(["all", ...CATEGORIES.map((c) => c.id)] as FilterKey[]).map((id) => (
                    <button key={id} onClick={() => { setFilter(id); setShowFilterMenu(false); }} style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "8px",
                      background: filter === id ? "rgba(139,92,246,0.1)" : "transparent",
                      border: "none", borderRadius: "7px", padding: "8px 11px",
                      cursor: "pointer", fontFamily: "'Raleway',sans-serif",
                      fontSize: "0.8rem", color: filter === id ? "#A78BFA" : "rgba(240,230,211,0.5)",
                      transition: "all 0.15s", textAlign: "left",
                    }}>
                      {id === "all" ? (
                        <><span style={{ fontSize: "12px" }}>◎</span> {t.history.filters.all}</>
                      ) : (
                        <><span style={{ color: CATEGORIES.find(c => c.id === id)?.accentColor, fontSize: "12px" }}>{ICON_MAP[id]}</span> {getLocalizedCategory(id)}</>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <button onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }} style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(240,230,211,0.1)",
                borderRadius: "8px", padding: "8px 14px",
                color: "rgba(240,230,211,0.5)", cursor: "pointer",
                fontFamily: "'Raleway',sans-serif", fontSize: "0.78rem",
                fontWeight: 600, letterSpacing: "0.04em", transition: "all 0.2s",
              }}>
                <ArrowUpDown size={12} />
                {sortLabels[sort]}
                <ChevronDown size={11} style={{ transform: showSortMenu ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {showSortMenu && (
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50,
                  background: "#131320", border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: "12px", padding: "6px", minWidth: "160px",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                  animation: "menuOpen 0.15s ease",
                }}>
                  {(Object.entries(sortLabels) as [SortKey, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => { setSort(key); setShowSortMenu(false); }} style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "8px",
                      background: sort === key ? "rgba(201,168,76,0.1)" : "transparent",
                      border: "none", borderRadius: "7px", padding: "9px 12px",
                      cursor: "pointer", fontFamily: "'Raleway',sans-serif",
                      fontSize: "0.8rem", color: sort === key ? "#C9A84C" : "rgba(240,230,211,0.5)",
                      transition: "all 0.15s", textAlign: "left", letterSpacing: "0.02em",
                    }}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.25)", fontSize: "0.75rem", marginLeft: "4px" }}>
              {filtered.length} {t.history.filters.all.toLowerCase()}
            </span>

            {filter !== "all" && (
              <button onClick={() => { setFilter("all"); setSort("date_desc"); }} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: "0.73rem", color: "rgba(226,100,100,0.55)", letterSpacing: "0.04em", transition: "color 0.2s" }}>
                {t.history.filters.clear}
              </button>
            )}
          </div>

          <div id="Readings-List" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px" }}>
                <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.3)", fontSize: "0.9rem" }}>{t.history.filters.noMatch}</p>
                <button onClick={() => setFilter("all")} style={{ marginTop: "12px", background: "none", border: "none", cursor: "pointer", color: "#C9A84C", fontFamily: "'Raleway',sans-serif", fontSize: "0.82rem" }}>{t.history.filters.showAll}</button>
              </div>
            ) : (
              filtered.map((r) => <HistoryItem key={r.id} reading={r} onClick={() => setSelectedReading(r)} language={language} t={t} />)
            )}
          </div>

          {readings.length === 0 && <EmptyState language={language} t={t} />}
        </div>
      </div>

      <GlobalNavBar
        onBack={() => navigate(-1)}
        onNext={() => navigate("/setup")}
        nextLabel={t.reading.newReading}
        helperText={t.history.count.replace("{n}", String(filtered.length))}
      />

      <style>{`
        @keyframes menuOpen { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </Layout>
  );
}