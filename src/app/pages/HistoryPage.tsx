import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Layout } from "../components/Layout";
import { GlobalNavBar } from "../components/GlobalNavBar";
import { CATEGORIES } from "../data/tarot-data";
import {
  Briefcase, Heart, Users, BookOpen, Coins, Leaf, Star, Home,
  Calendar, ChevronDown, ChevronUp, Filter, ArrowUpDown, Sparkles,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_HISTORY = [
  {
    id: "r1",
    date: "2026-04-28T14:32:00",
    categoryId: "love",
    question: "Will I find true love this year?",
    cards: [
      { id: 3, name: "The Empress", symbol: "❋", suit: "major" },
      { id: 17, name: "The Star", symbol: "✧", suit: "major" },
      { id: 6, name: "The Lovers", symbol: "♡", suit: "major" },
    ],
    summary: "The Empress opens with abundance and nurturing energy, suggesting fertile ground for love. The Star brings hope and divine timing. The Lovers calls you toward authentic choice.",
  },
  {
    id: "r2",
    date: "2026-04-21T09:15:00",
    categoryId: "career",
    question: "Should I accept the new job offer?",
    cards: [
      { id: 7, name: "The Chariot", symbol: "◇", suit: "major" },
      { id: 22, name: "Ace of Wands", symbol: "✤", suit: "wands" },
      { id: 1, name: "The Magician", symbol: "✦", suit: "major" },
    ],
    summary: "The Chariot signals victory through determined action. The Ace of Wands ignites a powerful new creative spark. The Magician urges you to trust your full skill set.",
  },
  {
    id: "r3",
    date: "2026-04-14T19:48:00",
    categoryId: "finance",
    question: "How can I attract more prosperity?",
    cards: [
      { id: 10, name: "Wheel of Fortune", symbol: "⊛", suit: "major" },
      { id: 64, name: "Ace of Pentacles", symbol: "✡", suit: "pentacles" },
      { id: 74, name: "Nine of Pentacles", symbol: "✡", suit: "pentacles" },
    ],
    summary: "The Wheel of Fortune marks a turning point in your financial cycle. The Ace of Pentacles opens a door to new abundance. Nine of Pentacles rewards self-sufficiency.",
  },
  {
    id: "r4",
    date: "2026-04-08T11:20:00",
    categoryId: "spiritual",
    question: "What is my soul's true purpose?",
    cards: [
      { id: 2, name: "The High Priestess", symbol: "☽", suit: "major" },
      { id: 9, name: "The Hermit", symbol: "✵", suit: "major" },
      { id: 20, name: "Judgement", symbol: "⊙", suit: "major" },
    ],
    summary: "The High Priestess calls you to trust your intuition above all. The Hermit invites profound solitude and inner work. Judgement heralds a spiritual awakening and rebirth.",
  },
  {
    id: "r5",
    date: "2026-03-30T16:02:00",
    categoryId: "health",
    question: "What do I need to heal within myself?",
    cards: [
      { id: 14, name: "Temperance", symbol: "≋", suit: "major" },
      { id: 8, name: "Strength", symbol: "♾", suit: "major" },
      { id: 19, name: "The Sun", symbol: "☀", suit: "major" },
    ],
    summary: "Temperance calls for balance and healing integration. Strength affirms your inner courage is more than sufficient. The Sun promises vitality and renewed clarity.",
  },
  {
    id: "r6",
    date: "2026-03-18T20:35:00",
    categoryId: "family",
    question: "How can I strengthen family bonds?",
    cards: [
      { id: 5, name: "The Hierophant", symbol: "✝", suit: "major" },
      { id: 36, name: "Ace of Cups", symbol: "◉", suit: "cups" },
      { id: 4, name: "The Emperor", symbol: "◈", suit: "major" },
    ],
    summary: "The Hierophant highlights the importance of tradition and shared values. The Ace of Cups opens a new flow of emotional connection. The Emperor grounds your role with stability.",
  },
];

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

function formatDate(isoString: string) {
  const d = new Date(isoString);
  const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return { date: dateStr, time: timeStr };
}

// ─── Mini Card Thumbnail ──────────────────────────────────────────────────────
function MiniCard({ symbol, suit }: { symbol: string; suit: string }) {
  const isGold = suit === "major";
  return (
    <div style={{
      width: "34px", height: "52px", borderRadius: "5px",
      background: "linear-gradient(145deg,#1A1430,#130F22)",
      border: `1px solid ${isGold ? "rgba(201,168,76,0.25)" : "rgba(139,92,246,0.25)"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
      flexShrink: 0,
    }}>
      {symbol}
    </div>
  );
}

// ─── History Item ─────────────────────────────────────────────────────────────
function HistoryItem({ reading }: { reading: typeof MOCK_HISTORY[0] }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const category = CATEGORIES.find((c) => c.id === reading.categoryId);
  const { date, time } = formatDate(reading.date);
  const rgb = category ? hexToRgb(category.accentColor) : "201,168,76";
  const [hov, setHov] = useState(false);

  return (
    <div
      id={`History-Item-${reading.id}`}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov || expanded ? "rgba(255,255,255,0.032)" : "rgba(255,255,255,0.018)",
        border: `1px solid ${expanded ? `rgba(${rgb},0.3)` : hov ? "rgba(240,230,211,0.1)" : "rgba(240,230,211,0.07)"}`,
        borderRadius: "16px",
        overflow: "hidden",
        transition: "all 0.22s ease",
        boxShadow: expanded ? `0 0 30px rgba(${rgb},0.08)` : "none",
      }}
    >
      {/* ── Main Row ── */}
      <div style={{ padding: "18px 22px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {/* Category icon badge */}
        <div style={{
          width: "40px", height: "40px", borderRadius: "11px", flexShrink: 0,
          background: `rgba(${rgb},0.1)`,
          border: `1px solid rgba(${rgb},0.25)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: category?.accentColor ?? "#C9A84C",
          marginTop: "2px",
        }}>
          {ICON_MAP[reading.categoryId]}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {/* Category + Date */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{
                  fontFamily: "'Raleway',sans-serif", fontSize: "0.66rem", fontWeight: 700,
                  letterSpacing: "0.14em", color: category?.accentColor ?? "#C9A84C",
                  background: `rgba(${rgb},0.1)`,
                  border: `1px solid rgba(${rgb},0.2)`,
                  borderRadius: "20px", padding: "2px 10px",
                }}>
                  {category?.label.toUpperCase() ?? "GENERAL"}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "rgba(240,230,211,0.3)" }}>
                  <Calendar size={11} />
                  <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.72rem" }}>{date} · {time}</span>
                </div>
              </div>

              {/* Question */}
              <p style={{
                fontFamily: "'Cinzel',serif", color: "rgba(240,230,211,0.82)",
                fontSize: "0.88rem", letterSpacing: "0.02em", lineHeight: 1.5,
                maxWidth: "480px",
              }}>
                "{reading.question}"
              </p>
            </div>

            {/* Card thumbnails */}
            <div id="Card-Thumbnails" style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
              {reading.cards.map((card) => (
                <MiniCard key={card.id} symbol={card.symbol} suit={card.suit} />
              ))}
            </div>
          </div>

          {/* Card names (compact) */}
          <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
            {reading.cards.map((card, i) => {
              const COLORS = ["rgba(167,139,250,0.7)", "#C9A84C", "rgba(126,168,224,0.7)"];
              const POSITIONS = ["Past", "Present", "Future"];
              return (
                <div key={card.id} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.63rem", letterSpacing: "0.1em", color: COLORS[i], fontWeight: 600 }}>{POSITIONS[i]}</span>
                  <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.7rem", color: "rgba(240,230,211,0.38)" }}>{card.name}</span>
                  {i < 2 && <span style={{ color: "rgba(240,230,211,0.15)", fontSize: "10px" }}>·</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0, alignItems: "flex-end" }}>
          <button
            id={`View-Reading-${reading.id}`}
            onClick={() => setExpanded(!expanded)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: expanded ? `rgba(${rgb},0.12)` : "rgba(255,255,255,0.04)",
              border: `1px solid ${expanded ? `rgba(${rgb},0.35)` : "rgba(240,230,211,0.1)"}`,
              borderRadius: "8px", padding: "7px 14px",
              color: expanded ? (category?.accentColor ?? "#C9A84C") : "rgba(240,230,211,0.5)",
              cursor: "pointer", fontFamily: "'Raleway',sans-serif",
              fontSize: "0.76rem", fontWeight: 600, letterSpacing: "0.04em",
              transition: "all 0.2s",
            }}
          >
            <Sparkles size={12} />
            {expanded ? "Collapse" : "View Reading"}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* ── Expanded Detail Panel ── */}
      {expanded && (
        <div style={{
          padding: "0 22px 20px",
          animation: "slideDown 0.25s ease",
        }}>
          <div style={{ height: "1px", background: `linear-gradient(to right, rgba(${rgb},0.3), transparent)`, marginBottom: "18px" }} />

          {/* Summary */}
          <div style={{
            background: `rgba(${rgb},0.05)`,
            border: `1px solid rgba(${rgb},0.14)`,
            borderRadius: "12px", padding: "18px 20px",
            marginBottom: "16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "7px", background: `rgba(${rgb},0.12)`, border: `1px solid rgba(${rgb},0.25)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={12} color={category?.accentColor ?? "#C9A84C"} />
              </div>
              <span style={{ fontFamily: "'Cinzel',serif", color: category?.accentColor ?? "#C9A84C", fontSize: "0.72rem", letterSpacing: "0.12em" }}>AI READING SUMMARY</span>
            </div>
            <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.6)", fontSize: "0.87rem", lineHeight: 1.8 }}>
              {reading.summary}
            </p>
          </div>

          {/* Full reading button */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button onClick={() => setExpanded(false)} style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.78rem", background: "none", border: "none", color: "rgba(240,230,211,0.28)", cursor: "pointer", letterSpacing: "0.04em" }}>
              Close
            </button>
            <button
              id={`Full-Reading-${reading.id}`}
              onClick={() => navigate("/reading")}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                background: `linear-gradient(135deg, ${category?.accentColor ?? "#C9A84C"}, rgba(${rgb},0.7))`,
                border: "none", borderRadius: "8px", padding: "9px 18px",
                color: "#0A0A12", fontFamily: "'Cinzel',serif", fontSize: "0.78rem",
                fontWeight: 600, letterSpacing: "0.06em", cursor: "pointer",
                boxShadow: `0 4px 16px rgba(${rgb},0.25)`,
              }}
            >
              View Full Reading <Sparkles size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  const navigate = useNavigate();
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
      <h3 style={{ fontFamily: "'Cinzel',serif", color: "#F0E6D3", fontSize: "1.2rem", fontWeight: 600, letterSpacing: "0.04em" }}>
        No readings yet
      </h3>
      <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.4)", fontSize: "0.9rem", lineHeight: 1.8, maxWidth: "360px" }}>
        You haven't drawn any cards yet. When you do, your readings will appear here so you can reflect on them over time.
      </p>
      <button onClick={() => navigate("/setup")} style={{
        display: "flex", alignItems: "center", gap: "8px",
        background: "linear-gradient(135deg,#C9A84C,#A8873A)",
        border: "none", borderRadius: "50px", padding: "13px 28px",
        color: "#0A0A12", fontFamily: "'Cinzel',serif", fontSize: "0.88rem",
        fontWeight: 600, letterSpacing: "0.08em", cursor: "pointer",
        boxShadow: "0 4px 20px rgba(201,168,76,0.28)",
      }}>
        <Sparkles size={15} /> Start Your Journey
      </button>
    </div>
  );
}

// ─── History Page ─────────────────────────────────────────────────────────────
type SortKey = "date_desc" | "date_asc" | "category";
type FilterKey = "all" | "love" | "career" | "finance" | "health" | "spiritual" | "family" | "friendship" | "general";

export default function HistoryPage() {
  const { user } = useApp();
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Use mock data — in production this would come from Supabase
  const readings = MOCK_HISTORY;

  const filtered = useMemo(() => {
    let arr = [...readings];
    if (filter !== "all") arr = arr.filter((r) => r.categoryId === filter);
    arr.sort((a, b) => {
      if (sort === "date_desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sort === "date_asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
      return a.categoryId.localeCompare(b.categoryId);
    });
    return arr;
  }, [readings, sort, filter]);

  const sortLabels: Record<SortKey, string> = { date_desc: "Newest First", date_asc: "Oldest First", category: "By Category" };
  const filterCategories = ["all", ...CATEGORIES.map((c) => c.id)] as FilterKey[];

  return (
    <Layout>
      <div id="History-Page" style={{ minHeight: "calc(100vh - 64px)", backgroundColor: "#0A0A12", backgroundImage: "radial-gradient(ellipse at 50% 0%,rgba(139,92,246,0.06) 0%,transparent 55%)", padding: "48px 24px 80px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "36px" }}>

          {/* ── Page Header ── */}
          <div id="History-Header" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ height: "1px", width: "32px", background: "linear-gradient(to right,transparent,rgba(201,168,76,0.5))" }} />
              <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(201,168,76,0.6)", fontSize: "0.67rem", letterSpacing: "0.22em", fontWeight: 600 }}>YOUR ARCHIVE</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <h1 style={{ fontFamily: "'Cinzel',serif", color: "#F0E6D3", fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 600, letterSpacing: "0.04em", marginBottom: "6px" }}>
                  Reading History
                </h1>
                <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.38)", fontSize: "0.85rem" }}>
                  Welcome back, <span style={{ color: "rgba(201,168,76,0.65)" }}>{user?.email?.split("@")[0] ?? "Seeker"}</span>
                  {" · "}
                  <span style={{ color: "rgba(240,230,211,0.45)" }}>{readings.length} readings in your archive</span>
                </p>
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: "10px" }}>
                {[
                  { label: "Total Reads", value: String(readings.length) },
                  { label: "This Month", value: String(readings.filter((r) => new Date(r.date) > new Date("2026-04-01")).length) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(240,230,211,0.08)", borderRadius: "12px", padding: "10px 18px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Cinzel',serif", color: "#C9A84C", fontSize: "1.3rem", fontWeight: 600 }}>{value}</div>
                    <div style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.3)", fontSize: "0.65rem", letterSpacing: "0.1em", marginTop: "2px" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Filter & Sort Bar ── */}
          <div id="Filter-Sort-Bar" style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            {/* Filter by category */}
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
                {filter === "all" ? "All Categories" : (CATEGORIES.find((c) => c.id === filter)?.label ?? "Filter")}
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
                  {(["all", ...CATEGORIES.map((c) => c.id)] as FilterKey[]).map((id) => {
                    const cat = CATEGORIES.find((c) => c.id === id);
                    return (
                      <button key={id} onClick={() => { setFilter(id); setShowFilterMenu(false); }} style={{
                        width: "100%", display: "flex", alignItems: "center", gap: "8px",
                        background: filter === id ? "rgba(139,92,246,0.1)" : "transparent",
                        border: "none", borderRadius: "7px", padding: "8px 11px",
                        cursor: "pointer", fontFamily: "'Raleway',sans-serif",
                        fontSize: "0.8rem", color: filter === id ? "#A78BFA" : "rgba(240,230,211,0.5)",
                        transition: "all 0.15s", textAlign: "left",
                      }}>
                        {id === "all" ? (
                          <><span style={{ fontSize: "12px" }}>◎</span> All Categories</>
                        ) : (
                          <><span style={{ color: cat?.accentColor, fontSize: "12px" }}>{ICON_MAP[id]}</span> {cat?.label}</>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sort */}
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

            {/* Result count */}
            <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.25)", fontSize: "0.75rem", marginLeft: "4px" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>

            {/* Clear filters */}
            {filter !== "all" && (
              <button onClick={() => { setFilter("all"); setSort("date_desc"); }} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: "0.73rem", color: "rgba(226,100,100,0.55)", letterSpacing: "0.04em", transition: "color 0.2s" }}>
                × Clear filter
              </button>
            )}
          </div>

          {/* ── Readings List ── */}
          <div id="Readings-List" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px" }}>
                <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.3)", fontSize: "0.9rem" }}>No readings match the selected filter.</p>
                <button onClick={() => setFilter("all")} style={{ marginTop: "12px", background: "none", border: "none", cursor: "pointer", color: "#C9A84C", fontFamily: "'Raleway',sans-serif", fontSize: "0.82rem" }}>Show all readings</button>
              </div>
            ) : (
              filtered.map((r) => <HistoryItem key={r.id} reading={r} />)
            )}
          </div>
        </div>
      </div>

      {/* ─── Global Nav Bar ─────────────────────────────────────────────── */}
      <GlobalNavBar
        onBack={() => navigate("/setup")}
        onNext={() => navigate("/setup")}
        nextLabel="New Reading"
        helperText={`${filtered.length} reading${filtered.length !== 1 ? "s" : ""} in your archive`}
      />

      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes menuOpen { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </Layout>
  );
}