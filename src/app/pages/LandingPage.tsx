import React, { useState, useRef, useEffect } from "react";
import { Navigate, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { FormField } from "../components/FormField";
import {
  Eye, EyeOff, Shield, Globe, ChevronDown, Check,
  Star, Compass, Layers, Zap, Moon, Sun,
} from "lucide-react";

// ─── Type declarations ─────────────────────────────────────────────────────────
type Tab = "login" | "signup";
type Lang = "EN" | "VI" | "ZH";

// ─── Bilingual Content ────────────────────────────────────────────────────────
const CONTENT = {
  EN: {
    eyebrow: "AN ANCIENT ART · A MODERN JOURNEY",
    title: "FATE OF YOURS",
    subtitle: "Unveil Your Path",
    quote: "\"The cards do not tell you what will happen — they illuminate what already is within you.\"",
    features: [
      { sym: "☽", text: "78 archetypal cards, 5 centuries of wisdom" },
      { sym: "✦", text: "AI-powered personalised interpretations" },
      { sym: "◎", text: "Private, intentional, deeply personal" },
    ],
    scrollHint: "SCROLL TO EXPLORE",
    introBadge: "INTRODUCTION TO TAROT",
    introHeadline: "An Ancient Oracle,",
    introHeadline2: "Reimagined",
    introP1: "Tarot has guided seekers for over five centuries. Originating in 15th-century Europe as a card game, these 78 illustrated archetypes evolved into one of humanity's most enduring tools for self-reflection and spiritual inquiry.",
    introP2: "Each card in the deck holds a mirror to the psyche — not to predict a fixed fate, but to illuminate patterns already present within you. The cards don't speak of what must happen, but of what energies surround your current path.",
    introBullets: ["78 unique archetypal symbols", "The Major & Minor Arcana", "Centuries of collective wisdom"],
    introPullQuote: "\"Know thyself through the cards\"",
    benefitsBadge: "WHY CHOOSE US",
    benefitsTitle: "Benefits of our",
    benefitsTitleAccent: "Readings",
    benefitsSub: "Every reading is a journey inward. Here is what the experience of consulting the cards can offer you.",
    footerTitle: "Your reading awaits",
    footerSub: "Sign in or create an account above to begin your journey into the ancient wisdom of the cards.",
    footerTags: ["PRIVATE", "PERSONAL", "PROFOUND"],
    auth: {
      loginHead: "Welcome Back",
      loginSub: "The cards await your return",
      signupHead: "Begin Your Journey",
      signupSub: "Let the cosmos know who you are",
      loginTab: "Sign In",
      signupTab: "Sign Up",
      emailLabel: "EMAIL ADDRESS",
      passwordLabel: "PASSWORD",
      dobLabel: "DATE OF BIRTH",
      dobHint: "Your birth date helps personalise your reading",
      dobActive: "✦ Select your day, month, and year of birth",
      dobValid: "✓ Date confirmed",
      loginBtn: "Sign In",
      signupBtn: "Create Account",
      loggingIn: "Opening the veil...",
      signingUp: "Weaving your destiny...",
    },
  },
  VI: {
    eyebrow: "NGHỆ THUẬT CỔ XƯA · HÀNH TRÌNH HIỆN ĐẠI",
    title: "SỐ PHẬN CỦA BẠN",
    subtitle: "Khám Phá Vận Mệnh",
    quote: "\"Những lá bài không tiết lộ điều gì sẽ xảy ra — chúng soi sáng những gì đã tồn tại trong bạn.\"",
    features: [
      { sym: "☽", text: "78 lá bài cổ mẫu, 5 thế kỷ trí tuệ" },
      { sym: "✦", text: "Giải thích được cá nhân hóa bởi AI" },
      { sym: "◎", text: "Riêng tư, có chủ ý, sâu sắc" },
    ],
    scrollHint: "CUỘN ĐỂ KHÁM PHÁ",
    introBadge: "GIỚI THIỆU VỀ BÀI TAROT",
    introHeadline: "Nhà Tiên Tri Cổ Đại,",
    introHeadline2: "Được Tái Tạo",
    introP1: "Tarot đã dẫn dắt những người tìm kiếm trong hơn năm thế kỷ. Xuất phát từ châu Âu thế kỷ 15 như một trò chơi bài, 78 nguyên mẫu này đã trở thành một trong những công cụ tự nhìn lại và khám phá tâm linh lâu đời nhất của nhân loại.",
    introP2: "Mỗi lá bài trong bộ bài là một tấm gương phản chiếu tâm lý — không phải để tiên đoán số phận cố định, mà để soi sáng những mô thức đã hiện diện trong bạn. Lá bài không nói về điều gì phải xảy ra, mà về những năng lượng đang bao quanh hành trình hiện tại của bạn.",
    introBullets: ["78 biểu tượng cổ mẫu độc đáo", "Bộ Arcana Lớn & Arcana Nhỏ", "Nhiều thế kỷ trí tuệ tập thể"],
    introPullQuote: "\"Biết mình qua những lá bài\"",
    benefitsBadge: "TẠI SAO CHỌN CHÚNG TÔI",
    benefitsTitle: "Lợi Ích từ",
    benefitsTitleAccent: "Những Buổi Đọc Bài",
    benefitsSub: "Mỗi buổi đọc bài là một hành trình hướng nội. Đây là những gì trải nghiệm tham vấn lá bài có thể mang lại cho bạn.",
    footerTitle: "Buổi đọc bài của bạn đang chờ",
    footerSub: "Đăng nhập hoặc tạo tài khoản để bắt đầu hành trình vào trí tuệ cổ xưa của những lá bài.",
    footerTags: ["RIÊNG TƯ", "CÁ NHÂN", "SÂU SẮC"],
    auth: {
      loginHead: "Chào Mừng Trở Lại",
      loginSub: "Những lá bài đang chờ sự trở về của bạn",
      signupHead: "Bắt Đầu Hành Trình",
      signupSub: "Hãy để vũ trụ biết bạn là ai",
      loginTab: "Đăng Nhập",
      signupTab: "Đăng Ký",
      emailLabel: "ĐỊA CHỈ EMAIL",
      passwordLabel: "MẬT KHẨU",
      dobLabel: "NGÀY SINH",
      dobHint: "Ngày sinh của bạn giúp cá nhân hóa buổi đọc bài",
      dobActive: "✦ Chọn ngày, tháng và năm sinh của bạn",
      dobValid: "✓ Ngày sinh đã được xác nhận",
      loginBtn: "Đăng Nhập",
      signupBtn: "Tạo Tài Khoản",
      loggingIn: "Đang mở bức màn...",
      signingUp: "Đang dệt vận mệnh của bạn...",
    },
  },
  ZH: {
    eyebrow: "古老艺术 · 现代旅程",
    title: "你的命运",
    subtitle: "揭开你的道路",
    quote: "\"牌并不告诉你将要发生什么 — 而是照亮你内心已经存在的东西。\"",
    features: [
      { sym: "☽", text: "78张原型卡，5个世纪的智慧" },
      { sym: "✦", text: "AI驱动的个性化解读" },
      { sym: "◎", text: "私密、有意、深刻" },
    ],
    scrollHint: "向下滚动探索",
    introBadge: "塔罗牌简介",
    introHeadline: "古老的神谕，",
    introHeadline2: "重新诠释",
    introP1: "塔罗牌已经引导寻求者超过五个世纪。起源于15世纪欧洲的纸牌游戏，这78张插图原型演变成人类最持久的自我反思与精神探索工具之一。",
    introP2: "牌组中的每张牌都是心灵的镜子——不是预测固定的命运，而是照亮你内心已经存在的模式。",
    introBullets: ["78个独特的原型符号", "大阿卡纳与小阿卡纳", "数个世纪的集体智慧"],
    introPullQuote: "\"通过牌认识自己\"",
    benefitsBadge: "为何选择我们",
    benefitsTitle: "我们解读的",
    benefitsTitleAccent: "好处",
    benefitsSub: "每次解读都是一次向内的旅程。以下是咨询塔罗牌体验所能带给您的。",
    footerTitle: "您的解读等待着您",
    footerSub: "在上方登录或创建账户，开始您进入古老智慧的旅程。",
    footerTags: ["私密", "个性", "深刻"],
    auth: {
      loginHead: "欢迎回来",
      loginSub: "牌在等待您的归来",
      signupHead: "开始您的旅程",
      signupSub: "让宇宙知道您是谁",
      loginTab: "登录",
      signupTab: "注册",
      emailLabel: "电子邮箱",
      passwordLabel: "密码",
      dobLabel: "出生日期",
      dobHint: "您的生日有助于个性化您的解读",
      dobActive: "✦ 选择您的出生日、月和年",
      dobValid: "✓ 日期已确认",
      loginBtn: "登录",
      signupBtn: "创建账户",
      loggingIn: "正在揭开命运之幕...",
      signingUp: "正在编织您的命运...",
    },
  },
};

// Benefit card content (translated)
const BENEFITS = {
  EN: [
    { icon: <Star size={22} />, color: "#C9A84C", title: "Personal Clarity", desc: "Gain deep insight into your emotions, patterns, and subconscious drives. The cards reveal what your conscious mind may be avoiding." },
    { icon: <Compass size={22} />, color: "#8B5CF6", title: "Guided Direction", desc: "When life presents crossroads, a reading helps you weigh energies and possibilities — a compass for your intuition, not a prophecy." },
    { icon: <Layers size={22} />, color: "#7EA8E0", title: "Deep Reflection", desc: "Each spread creates a structured moment of stillness. Tarot invites you to slow down and listen to what matters most." },
    { icon: <Zap size={22} />, color: "#4ECDA4", title: "Empowered Choices", desc: "Understanding the archetypal energies around a situation helps you act with greater awareness and less reactivity." },
    { icon: <Moon size={22} />, color: "#C084FC", title: "Shadow Work", desc: "The cards bravely illuminate the parts of yourself you may have hidden. Growth begins in the places we least want to look." },
    { icon: <Sun size={22} />, color: "#E88A5A", title: "Daily Ritual", desc: "A single-card pull each morning anchors your intention for the day — a powerful mindfulness practice requiring only moments." },
  ],
  VI: [
    { icon: <Star size={22} />, color: "#C9A84C", title: "Sự Rõ Ràng Cá Nhân", desc: "Có được cái nhìn sâu sắc về cảm xúc, mô thức và động lực tiềm thức của bạn. Những lá bài tiết lộ những gì tâm trí ý thức của bạn có thể đang né tránh." },
    { icon: <Compass size={22} />, color: "#8B5CF6", title: "Định Hướng Có Chỉ Dẫn", desc: "Khi cuộc đời đặt ra những ngã rẽ, một buổi đọc bài giúp bạn cân nhắc các năng lượng và khả năng — không phải lời tiên tri mà là la bàn cho trực giác." },
    { icon: <Layers size={22} />, color: "#7EA8E0", title: "Suy Ngẫm Sâu Sắc", desc: "Mỗi trải bài tạo ra một khoảnh khắc tĩnh lặng có cấu trúc. Tarot mời bạn chậm lại và lắng nghe những điều quan trọng nhất." },
    { icon: <Zap size={22} />, color: "#4ECDA4", title: "Lựa Chọn Có Sức Mạnh", desc: "Hiểu được các năng lượng cổ mẫu xung quanh một tình huống giúp bạn hành động với sự nhận thức lớn hơn và ít phản ứng hơn." },
    { icon: <Moon size={22} />, color: "#C084FC", title: "Công Tác Bóng Tối", desc: "Những lá bài dũng cảm soi sáng những phần của bản thân bạn có thể đã che giấu. Sự phát triển bắt đầu ở những nơi chúng ta ít muốn nhìn vào nhất." },
    { icon: <Sun size={22} />, color: "#E88A5A", title: "Nghi Thức Hàng Ngày", desc: "Rút một lá bài mỗi sáng để neo đậu ý định cho ngày — một thực hành chánh niệm mạnh mẽ chỉ cần vài phút." },
  ],
  ZH: [
    { icon: <Star size={22} />, color: "#C9A84C", title: "个人清晰", desc: "深入了解您的情感、模式和潜意识动力。牌揭示您的意识心灵可能正在回避的事情。" },
    { icon: <Compass size={22} />, color: "#8B5CF6", title: "指引方向", desc: "当生活出现十字路口时，解读帮助您权衡能量和可能性——不是预言，而是直觉的指南针。" },
    { icon: <Layers size={22} />, color: "#7EA8E0", title: "深刻反思", desc: "每次展牌都创造一个结构化的静默时刻。塔罗邀请您放慢脚步，倾听最重要的事情。" },
    { icon: <Zap size={22} />, color: "#4ECDA4", title: "赋权选择", desc: "了解围绕某一情境的原型能量，帮助您以更大的意识和更少的反应性行动。" },
    { icon: <Moon size={22} />, color: "#C084FC", title: "阴影工作", desc: "牌勇敢地照亮您可能已经隐藏的自我部分。成长始于我们最不愿意审视的地方。" },
    { icon: <Sun size={22} />, color: "#E88A5A", title: "日常仪式", desc: "每天早晨抽一张牌来锚定当天的意图——这是一种只需片刻的强大正念练习。" },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgb(hex: string) {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, i) => ({ value: i+1, label: m }));
const DAYS = Array.from({ length: 31 }, (_, i) => ({ value: i+1, label: String(i+1) }));
const YEARS = Array.from({ length: 83 }, (_, i) => { const y = 2006-i; return { value: y, label: String(y) }; });

function validateDate(day: string, month: string, year: string): string | null {
  if (!day || !month || !year) return "Date of birth is required";
  const d = parseInt(day), m = parseInt(month), y = parseInt(year);
  const date = new Date(y, m-1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m-1 || date.getDate() !== d) return "Please enter a valid date";
  if (date > new Date()) return "Date of birth cannot be in the future";
  if (new Date().getFullYear() - y < 13) return "You must be at least 13 years old";
  return null;
}

function useVisible(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Language Toggle ──────────────────────────────────────────────────────────
function LanguageToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const items: { code: Lang; native: string; english: string }[] = [
    { code: "EN", native: "English", english: "English" },
    { code: "VI", native: "Tiếng Việt", english: "Vietnamese" },
    { code: "ZH", native: "中文", english: "Chinese" },
  ];
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: "6px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(240,230,211,0.12)",
        borderRadius: "8px", padding: "7px 12px",
        color: "rgba(240,230,211,0.7)", cursor: "pointer",
        fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", letterSpacing: "0.04em",
        transition: "all 0.2s ease",
      }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.35)"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,230,211,0.12)"; }}
      >
        <Globe size={13} />
        <span style={{ fontWeight: 600 }}>{lang}</span>
        <ChevronDown size={10} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "#131320", border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: "12px", padding: "6px", minWidth: "158px",
          zIndex: 300, boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
          animation: "menuOpen 0.15s ease",
        }}>
          {items.map((l) => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
              background: lang === l.code ? "rgba(201,168,76,0.1)" : "transparent",
              border: "none", borderRadius: "7px", padding: "9px 12px",
              cursor: "pointer", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem",
              color: lang === l.code ? "#C9A84C" : "rgba(240,230,211,0.55)",
              transition: "all 0.15s", textAlign: "left",
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>{l.native}</div>
                <div style={{ fontSize: "0.68rem", opacity: 0.5, marginTop: "1px" }}>{l.english}</div>
              </div>
              {lang === l.code && <Check size={12} color="#C9A84C" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Admin Modal ──────────────────────────────────────────────────────────────
function AdminModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState(""); const [pass, setPass] = useState(""); const [loading, setLoading] = useState(false); const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); setErr("Invalid credentials. Please contact your system administrator."); }, 800); };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(5,5,12,0.9)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "100%", maxWidth: "400px", background: "linear-gradient(160deg,#0F0F1E,#0B0B16)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "20px", padding: "28px", animation: "popUp 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}><Shield size={16} color="#A78BFA" /></div>
            <div><div style={{ fontFamily: "'Cinzel',serif", color: "#F0E6D3", fontSize: "1rem" }}>Admin Portal</div><div style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.35)", fontSize: "0.72rem" }}>Site & user management</div></div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "7px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(240,230,211,0.4)", cursor: "pointer", fontSize: "14px" }}>✕</button>
        </div>
        <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "8px", padding: "10px 14px", marginBottom: "18px" }}>
          <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(167,139,250,0.65)", fontSize: "0.73rem", lineHeight: 1.6 }}>⚠ Restricted access. Unauthorized attempts are logged and monitored.</p>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
          <FormField label="Admin Email" type="email" placeholder="admin@fateofyours.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <FormField label="Admin Password" type="password" placeholder="••••••••" value={pass} onChange={(e) => setPass(e.target.value)} />
          {err && <div style={{ background: "rgba(226,100,100,0.07)", border: "1px solid rgba(226,100,100,0.22)", borderRadius: "8px", padding: "10px 12px" }}><p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(226,100,100,0.85)", fontSize: "0.78rem" }}>{err}</p></div>}
          <button type="submit" disabled={loading} style={{ marginTop: "4px", background: loading ? "rgba(109,40,217,0.4)" : "linear-gradient(135deg,#7C3AED,#6D28D9)", border: "none", borderRadius: "10px", padding: "13px", color: "#fff", fontFamily: "'Raleway',sans-serif", fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.05em", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Verifying..." : "Access Admin Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── DOB Select ───────────────────────────────────────────────────────────────
function DOBSelect({ id, placeholder, options, value, hasError, isFocused, onChange, onFocus, onBlur }: {
  id: string; placeholder: string; options: { value: number | string; label: string }[];
  value: string; hasError: boolean; isFocused: boolean;
  onChange: (v: string) => void; onFocus: () => void; onBlur: () => void;
}) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} onBlur={onBlur} style={{
      flex: 1, fontFamily: "'Raleway',sans-serif",
      background: isFocused ? "#13131F" : "#0E0E1A",
      border: `1.5px solid ${hasError ? "rgba(226,100,100,0.7)" : isFocused ? "rgba(201,168,76,0.6)" : "rgba(201,168,76,0.18)"}`,
      borderRadius: "8px", padding: "11px 10px",
      color: value ? "#F0E6D3" : "rgba(240,230,211,0.3)",
      fontSize: "0.82rem", outline: "none", cursor: "pointer",
      boxShadow: hasError ? "0 0 0 3px rgba(226,100,100,0.08)" : isFocused ? "0 0 0 3px rgba(201,168,76,0.08)" : "none",
      transition: "all 0.2s ease", appearance: "none", textAlign: "center",
    }}>
      <option value="" style={{ background: "#0E0E1A" }}>{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value} style={{ background: "#0E0E1A", color: "#F0E6D3" }}>{o.label}</option>)}
    </select>
  );
}

// ─── Auth Module (centered glass card) ───────────────────────────────────────
function AuthModule({ c }: { c: typeof CONTENT.EN.auth }) {
  const { login, signup } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("login");
  const [loginEmail, setLoginEmail] = useState(""); const [loginPass, setLoginPass] = useState(""); const [showLoginPass, setShowLoginPass] = useState(false);
  const [signEmail, setSignEmail] = useState(""); const [signPass, setSignPass] = useState(""); const [showSignPass, setShowSignPass] = useState(false);
  const [dobDay, setDobDay] = useState(""); const [dobMonth, setDobMonth] = useState(""); const [dobYear, setDobYear] = useState("");
  const [dobFocused, setDobFocused] = useState(false); const [dobTouched, setDobTouched] = useState(false);
  const [loginErrs, setLoginErrs] = useState<Record<string, string>>({});
  const [signErrs, setSignErrs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const dobError = dobTouched ? validateDate(dobDay, dobMonth, dobYear) : null;

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!loginEmail) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(loginEmail)) errs.email = "Invalid email";
    if (!loginPass) errs.pass = "Password is required";
    setLoginErrs(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => { login(loginEmail, loginPass); navigate("/setup"); }, 700);
  };

  const doSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setDobTouched(true);
    const errs: Record<string, string> = {};
    if (!signEmail) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(signEmail)) errs.email = "Invalid email";
    if (!signPass) errs.pass = "Password required";
    else if (signPass.length < 8) errs.pass = "Min. 8 characters";
    const dobErr = validateDate(dobDay, dobMonth, dobYear);
    if (dobErr) errs.dob = dobErr;
    setSignErrs(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => {
      const dob = `${dobYear}-${String(dobMonth).padStart(2,"0")}-${String(dobDay).padStart(2,"0")}`;
      signup(signEmail, signPass, dob);
      navigate("/setup");
    }, 700);
  };

  const inputStyle = (hasErr?: boolean, focused?: boolean): React.CSSProperties => ({
    fontFamily: "'Raleway',sans-serif",
    background: focused ? "#13131F" : "#0E0E1A",
    border: `1.5px solid ${hasErr ? "rgba(226,100,100,0.65)" : focused ? "rgba(201,168,76,0.6)" : "rgba(201,168,76,0.18)"}`,
    borderRadius: "8px", padding: "12px 14px",
    color: "#F0E6D3", fontSize: "0.9rem", outline: "none", width: "100%", boxSizing: "border-box",
    transition: "all 0.2s",
    boxShadow: hasErr ? "0 0 0 3px rgba(226,100,100,0.07)" : focused ? "0 0 0 3px rgba(201,168,76,0.07)" : "none",
  });

  return (
    <div id="Auth-Module" style={{
      background: "linear-gradient(160deg, rgba(16,14,30,0.94) 0%, rgba(10,10,20,0.96) 100%)",
      border: "1px solid rgba(201,168,76,0.18)",
      borderRadius: "22px", padding: "32px 30px",
      backdropFilter: "blur(24px)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 80px rgba(139,92,246,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
      width: "100%", maxWidth: "440px",
    }}>
      {/* Module header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,rgba(201,168,76,0.2),rgba(139,92,246,0.2))", border: "1.5px solid rgba(201,168,76,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", boxShadow: "0 0 14px rgba(139,92,246,0.2)" }}>✦</div>
        <h3 style={{ fontFamily: "'Cinzel',serif", color: "#F0E6D3", fontSize: "1rem", letterSpacing: "0.04em" }}>
          {tab === "login" ? c.loginHead : c.signupHead}
        </h3>
      </div>
      <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.38)", fontSize: "0.79rem", paddingLeft: "42px", marginBottom: "20px" }}>
        {tab === "login" ? c.loginSub : c.signupSub}
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "4px", gap: "4px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "22px" }}>
        {(["login","signup"] as Tab[]).map((t) => (
          <button key={t} onClick={() => { setTab(t); setLoginErrs({}); setSignErrs({}); setDobTouched(false); }} style={{
            flex: 1, padding: "9px 16px", borderRadius: "7px", border: "none", cursor: "pointer",
            fontFamily: "'Raleway',sans-serif", fontSize: "0.84rem", fontWeight: 600, letterSpacing: "0.04em",
            background: tab === t ? "linear-gradient(135deg,rgba(201,168,76,0.18),rgba(139,92,246,0.1))" : "transparent",
            color: tab === t ? "#C9A84C" : "rgba(240,230,211,0.38)",
            boxShadow: tab === t ? "inset 0 0 0 1px rgba(201,168,76,0.25)" : "none",
            transition: "all 0.2s",
          }}>
            {t === "login" ? c.loginTab : c.signupTab}
          </button>
        ))}
      </div>

      {/* Login Form */}
      {tab === "login" && (
        <form onSubmit={doLogin} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
          <div>
            <label style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.69rem", letterSpacing: "0.14em", fontWeight: 600, color: "rgba(240,230,211,0.45)", display: "block", marginBottom: "6px" }}>{c.emailLabel}</label>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="your@email.com" style={inputStyle(!!loginErrs.email)} onFocus={(e) => Object.assign(e.target.style,{borderColor:"rgba(201,168,76,0.6)",boxShadow:"0 0 0 3px rgba(201,168,76,0.07)",background:"#13131F"})} onBlur={(e) => Object.assign(e.target.style,{borderColor:loginErrs.email?"rgba(226,100,100,0.65)":"rgba(201,168,76,0.18)",boxShadow:"none",background:"#0E0E1A"})} />
            {loginErrs.email && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.72rem", color: "rgba(226,100,100,0.85)", marginTop: "4px", display: "block" }}>{loginErrs.email}</span>}
          </div>
          <div style={{ position: "relative" }}>
            <label style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.69rem", letterSpacing: "0.14em", fontWeight: 600, color: "rgba(240,230,211,0.45)", display: "block", marginBottom: "6px" }}>{c.passwordLabel}</label>
            <input type={showLoginPass?"text":"password"} value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="••••••••" style={inputStyle(!!loginErrs.pass)} onFocus={(e) => Object.assign(e.target.style,{borderColor:"rgba(201,168,76,0.6)",boxShadow:"0 0 0 3px rgba(201,168,76,0.07)",background:"#13131F"})} onBlur={(e) => Object.assign(e.target.style,{borderColor:loginErrs.pass?"rgba(226,100,100,0.65)":"rgba(201,168,76,0.18)",boxShadow:"none",background:"#0E0E1A"})} />
            <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} style={{ position: "absolute", right: "13px", top: "34px", background: "none", border: "none", cursor: "pointer", color: "rgba(240,230,211,0.35)", padding: 0 }}>{showLoginPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            {loginErrs.pass && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.72rem", color: "rgba(226,100,100,0.85)", marginTop: "4px", display: "block" }}>{loginErrs.pass}</span>}
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: "6px", background: loading ? "rgba(201,168,76,0.35)" : "linear-gradient(135deg,#C9A84C,#A8873A)", border: "none", borderRadius: "10px", padding: "14px", color: "#0A0A12", fontFamily: "'Raleway',sans-serif", fontSize: "0.92rem", fontWeight: 700, letterSpacing: "0.06em", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 20px rgba(201,168,76,0.3)" }}>
            {loading ? c.loggingIn : c.loginBtn}
          </button>
        </form>
      )}

      {/* Signup Form */}
      {tab === "signup" && (
        <form onSubmit={doSignup} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
          <div>
            <label style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.69rem", letterSpacing: "0.14em", fontWeight: 600, color: "rgba(240,230,211,0.45)", display: "block", marginBottom: "6px" }}>{c.emailLabel}</label>
            <input type="email" value={signEmail} onChange={(e) => setSignEmail(e.target.value)} placeholder="your@email.com" style={inputStyle(!!signErrs.email)} onFocus={(e) => Object.assign(e.target.style,{borderColor:"rgba(201,168,76,0.6)",boxShadow:"0 0 0 3px rgba(201,168,76,0.07)",background:"#13131F"})} onBlur={(e) => Object.assign(e.target.style,{borderColor:signErrs.email?"rgba(226,100,100,0.65)":"rgba(201,168,76,0.18)",boxShadow:"none",background:"#0E0E1A"})} />
            {signErrs.email && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.72rem", color: "rgba(226,100,100,0.85)", marginTop: "4px", display: "block" }}>{signErrs.email}</span>}
          </div>
          <div style={{ position: "relative" }}>
            <label style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.69rem", letterSpacing: "0.14em", fontWeight: 600, color: "rgba(240,230,211,0.45)", display: "block", marginBottom: "6px" }}>{c.passwordLabel}</label>
            <input type={showSignPass?"text":"password"} value={signPass} onChange={(e) => setSignPass(e.target.value)} placeholder="Min. 8 characters" style={inputStyle(!!signErrs.pass)} onFocus={(e) => Object.assign(e.target.style,{borderColor:"rgba(201,168,76,0.6)",boxShadow:"0 0 0 3px rgba(201,168,76,0.07)",background:"#13131F"})} onBlur={(e) => Object.assign(e.target.style,{borderColor:signErrs.pass?"rgba(226,100,100,0.65)":"rgba(201,168,76,0.18)",boxShadow:"none",background:"#0E0E1A"})} />
            <button type="button" onClick={() => setShowSignPass(!showSignPass)} style={{ position: "absolute", right: "13px", top: "34px", background: "none", border: "none", cursor: "pointer", color: "rgba(240,230,211,0.35)", padding: 0 }}>{showSignPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            {signErrs.pass && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.72rem", color: "rgba(226,100,100,0.85)", marginTop: "4px", display: "block" }}>{signErrs.pass}</span>}
          </div>

          {/* Date of Birth — with 3 validation states */}
          <div>
            <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.69rem", letterSpacing: "0.14em", fontWeight: 600, display: "block", marginBottom: "6px", color: dobError ? "rgba(226,100,100,0.9)" : dobFocused ? "#C9A84C" : "rgba(240,230,211,0.45)", transition: "color 0.2s" }}>
              {c.dobLabel}
            </span>
            <div style={{ display: "flex", gap: "7px" }}>
              <DOBSelect id="dob-day" placeholder="Day" options={DAYS} value={dobDay} hasError={!!dobError && dobTouched} isFocused={dobFocused} onChange={(v) => { setDobDay(v); setDobTouched(true); }} onFocus={() => setDobFocused(true)} onBlur={() => setDobFocused(false)} />
              <DOBSelect id="dob-month" placeholder="Month" options={MONTHS} value={dobMonth} hasError={!!dobError && dobTouched} isFocused={dobFocused} onChange={(v) => { setDobMonth(v); setDobTouched(true); }} onFocus={() => setDobFocused(true)} onBlur={() => setDobFocused(false)} />
              <DOBSelect id="dob-year" placeholder="Year" options={YEARS} value={dobYear} hasError={!!dobError && dobTouched} isFocused={dobFocused} onChange={(v) => { setDobYear(v); setDobTouched(true); }} onFocus={() => setDobFocused(true)} onBlur={() => setDobFocused(false)} />
            </div>
            {/* State: Normal */}
            {!dobTouched && !dobFocused && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.71rem", color: "rgba(240,230,211,0.22)", marginTop: "5px", display: "block" }}>{c.dobHint}</span>}
            {/* State: Active/Focus */}
            {dobFocused && !dobError && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.71rem", color: "rgba(201,168,76,0.7)", marginTop: "5px", display: "block" }}>{c.dobActive}</span>}
            {/* State: Error */}
            {dobError && dobTouched && <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "5px" }}><span style={{ color: "rgba(226,100,100,0.85)", fontSize: "11px" }}>⚠</span><span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.72rem", color: "rgba(226,100,100,0.9)" }}>{dobError}</span></div>}
            {/* State: Valid */}
            {dobTouched && !dobError && dobDay && dobMonth && dobYear && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.71rem", color: "rgba(78,205,164,0.8)", marginTop: "5px", display: "block" }}>{c.dobValid}</span>}
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: "6px", background: loading ? "rgba(201,168,76,0.35)" : "linear-gradient(135deg,#C9A84C,#A8873A)", border: "none", borderRadius: "10px", padding: "14px", color: "#0A0A12", fontFamily: "'Raleway',sans-serif", fontSize: "0.92rem", fontWeight: 700, letterSpacing: "0.06em", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 20px rgba(201,168,76,0.3)" }}>
            {loading ? c.signingUp : c.signupBtn}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Below-Fold: 3D Canvas + Glass Panels ─────────────────────────────────────
function BelowFold({ t, lang }: { t: typeof CONTENT.EN; lang: Lang }) {
  const benefits = BENEFITS[lang] ?? BENEFITS.EN;

  return (
    <div id="Below-Fold" style={{ position: "relative" }}>

      {/* ═══ LAYER 1: Sticky 3D Canvas Background ═══════════════════════════
          Developer note: Mount Three.js scene / Spline canvas on this element.
          Pin this element with GSAP ScrollTrigger while panels scroll over it.
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        id="ThreeJS-Canvas-Layer"
        style={{
          position: "sticky", top: 0, height: "100vh", zIndex: 1,
          marginBottom: "-100vh",
          background: "linear-gradient(145deg, #070710 0%, #0B0918 50%, #080810 100%)",
          overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {/* Animated placeholder for the 3D canvas */}
        <div style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", animation: "breathe 6s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "400px", height: "400px", borderRadius: "50%", border: "1px solid rgba(139,92,246,0.08)", animation: "spinSlow 40s linear infinite" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "250px", height: "250px", borderRadius: "50%", border: "1px solid rgba(201,168,76,0.06)", animation: "spinSlow 25s linear infinite reverse" }} />
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              position: "absolute", width: "2px", height: "2px", borderRadius: "50%",
              background: i%2===0 ? "#C9A84C" : "#8B5CF6", opacity: 0.4,
              top: `${15+Math.sin(i*Math.PI/4)*40}%`,
              left: `${50+Math.cos(i*Math.PI/4)*38}%`,
              animation: `twinkle ${2+i*0.5}s ease-in-out infinite alternate`,
              animationDelay: `${i*0.3}s`,
            }} />
          ))}
        </div>

        <div style={{ position: "relative", textAlign: "center", padding: "24px 32px", border: "1.5px dashed rgba(139,92,246,0.22)", borderRadius: "20px", background: "rgba(139,92,246,0.03)", maxWidth: "420px" }}>
          <p style={{ fontFamily: "'Cinzel',serif", color: "rgba(139,92,246,0.55)", fontSize: "1.05rem", letterSpacing: "0.1em", marginBottom: "10px" }}>
            [ Three.js / Spline 3D Canvas ]
          </p>
          <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.2)", fontSize: "0.75rem", lineHeight: 1.7, letterSpacing: "0.05em" }}>
            Mount immersive scroll-triggered<br />3D scene here via GSAP ScrollTrigger
          </p>
        </div>
      </div>

      {/* ═══ LAYER 2: Scrolling Glass-Morphism Content Panels ═══════════════
          Developer note: These panels scroll over the pinned 3D canvas.
          Use GSAP ScrollTrigger to animate each panel's entrance.
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        id="Glass-Panels-Layer"
        style={{ position: "relative", zIndex: 10, marginTop: "-100vh", paddingTop: "90vh" }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 120px", display: "flex", flexDirection: "column", gap: "40px" }}>

          {/* Glass Panel 1: Introduction to Tarot */}
          <GlassIntroPanel t={t} />

          {/* Spacer to let the canvas breathe between panels */}
          <div style={{ height: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ height: "1px", width: "60px", background: "linear-gradient(to right, transparent, rgba(201,168,76,0.25))" }} />
              <span style={{ color: "rgba(201,168,76,0.25)", fontSize: "10px", letterSpacing: "6px" }}>◈ ◈ ◈</span>
              <div style={{ height: "1px", width: "60px", background: "linear-gradient(to left, transparent, rgba(201,168,76,0.25))" }} />
            </div>
          </div>

          {/* Glass Panel 2: Benefits */}
          <GlassBenefitsPanel t={t} benefits={benefits} />

          {/* Footer CTA */}
          <GlassFooterCTA t={t} />

        </div>
      </div>
    </div>
  );
}

function GlassPanel({ children, id }: { children: React.ReactNode; id?: string }) {
  const { ref, visible } = useVisible(0.05);
  return (
    <div ref={ref} id={id} style={{
      background: "rgba(8,8,20,0.78)",
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",
      border: "1px solid rgba(240,230,211,0.07)",
      borderRadius: "22px",
      padding: "40px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(40px)",
      transition: "opacity 0.8s ease, transform 0.8s ease",
    }}>
      {children}
    </div>
  );
}

function GlassIntroPanel({ t }: { t: typeof CONTENT.EN }) {
  return (
    <GlassPanel id="Glass-Intro-Panel">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "40px", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(201,168,76,0.6)", fontSize: "0.67rem", letterSpacing: "0.22em", fontWeight: 600 }}>{t.introBadge}</span>
          <h2 style={{ fontFamily: "'Cinzel',serif", color: "#F0E6D3", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 600, letterSpacing: "0.03em", lineHeight: 1.3 }}>
            {t.introHeadline}<br />
            <span style={{ color: "#C9A84C" }}>{t.introHeadline2}</span>
          </h2>
          <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.52)", fontSize: "0.9rem", lineHeight: 1.85 }}>{t.introP1}</p>
          <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.42)", fontSize: "0.87rem", lineHeight: 1.85 }}>{t.introP2}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {t.introBullets.map((b) => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "linear-gradient(135deg,#C9A84C,#8B5CF6)", flexShrink: 0 }} />
                <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.45)", fontSize: "0.84rem" }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", aspectRatio: "3/4", minHeight: "240px" }}>
          <img src="https://images.unsplash.com/photo-1603162496424-afdc5011767a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600" alt="Ancient esoteric library" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45) saturate(0.6)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,20,0.9) 0%, transparent 50%)" }} />
          <div style={{ position: "absolute", bottom: "20px", left: "20px", right: "20px", fontFamily: "'Cinzel',serif", color: "rgba(201,168,76,0.65)", fontSize: "0.75rem", letterSpacing: "0.1em", textAlign: "center" }}>{t.introPullQuote}</div>
        </div>
      </div>
    </GlassPanel>
  );
}

function GlassBenefitsPanel({ t, benefits }: { t: typeof CONTENT.EN; benefits: typeof BENEFITS.EN }) {
  return (
    <GlassPanel id="Glass-Benefits-Panel">
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(201,168,76,0.6)", fontSize: "0.67rem", letterSpacing: "0.22em", fontWeight: 600, display: "block", marginBottom: "10px" }}>{t.benefitsBadge}</span>
          <h2 style={{ fontFamily: "'Cinzel',serif", color: "#F0E6D3", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 600, letterSpacing: "0.03em" }}>
            {t.benefitsTitle} <span style={{ color: "#C9A84C" }}>{t.benefitsTitleAccent}</span>
          </h2>
          <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.38)", fontSize: "0.88rem", maxWidth: "460px", lineHeight: 1.75, margin: "10px auto 0" }}>{t.benefitsSub}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "14px" }}>
          {benefits.map((b, i) => (
            <BenefitItem key={i} item={b} />
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}

function BenefitItem({ item }: { item: { icon: React.ReactNode; color: string; title: string; desc: string } }) {
  const [hov, setHov] = useState(false);
  const rgb = hexToRgb(item.color);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: hov ? `rgba(${rgb},0.07)` : "rgba(255,255,255,0.02)",
      border: `1px solid ${hov ? `rgba(${rgb},0.3)` : "rgba(240,230,211,0.07)"}`,
      borderRadius: "14px", padding: "20px",
      display: "flex", flexDirection: "column", gap: "12px",
      transition: "all 0.25s ease",
      transform: hov ? "translateY(-3px)" : "none",
      cursor: "default",
    }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.22)`, display: "flex", alignItems: "center", justifyContent: "center", color: item.color, boxShadow: hov ? `0 0 14px rgba(${rgb},0.2)` : "none", transition: "box-shadow 0.25s" }}>{item.icon}</div>
      <div>
        <h3 style={{ fontFamily: "'Cinzel',serif", color: hov ? item.color : "#F0E6D3", fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.04em", marginBottom: "7px", transition: "color 0.25s" }}>{item.title}</h3>
        <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.42)", fontSize: "0.8rem", lineHeight: 1.75 }}>{item.desc}</p>
      </div>
    </div>
  );
}

function GlassFooterCTA({ t }: { t: typeof CONTENT.EN }) {
  return (
    <div style={{ background: "rgba(8,8,20,0.78)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(201,168,76,0.14)", borderRadius: "22px", padding: "50px 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
      <div style={{ fontSize: "22px", letterSpacing: "8px", color: "rgba(201,168,76,0.4)" }}>✦ ✦ ✦</div>
      <h2 style={{ fontFamily: "'Cinzel',serif", color: "#F0E6D3", fontSize: "clamp(1.3rem,3vw,1.8rem)", fontWeight: 600, letterSpacing: "0.04em" }}>{t.footerTitle}</h2>
      <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.42)", fontSize: "0.9rem", maxWidth: "400px", lineHeight: 1.75 }}>{t.footerSub}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "rgba(240,230,211,0.18)", fontSize: "0.68rem", fontFamily: "'Raleway',sans-serif", letterSpacing: "0.12em" }}>
        {t.footerTags.map((tag, i) => (
          <React.Fragment key={tag}>{i > 0 && <span>·</span>}<span>{tag}</span></React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isAuthenticated, language, setLanguage } = useApp();
  const [adminOpen, setAdminOpen] = useState(false);

  if (isAuthenticated) return <Navigate to="/setup" replace />;

  const lang = language as Lang;
  const t = CONTENT[lang] ?? CONTENT.EN;

  return (
    <div id="Landing-Page" style={{ backgroundColor: "#070710", minHeight: "100vh" }}>

      {/* ── Top Navigation ──────────────────────────────────────────────────── */}
      <nav id="Nav-Bar" style={{ position: "sticky", top: 0, zIndex: 100, backgroundColor: "rgba(7,7,16,0.94)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(201,168,76,0.09)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <div id="Nav-Logo" style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#C9A84C,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", boxShadow: "0 0 14px rgba(139,92,246,0.4)" }}>✦</div>
            <div>
              <span style={{ fontFamily: "'Cinzel',serif", color: "#C9A84C", fontSize: "0.95rem", letterSpacing: "0.06em", display: "block", lineHeight: 1.2 }}>Fate of yours</span>
              <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.28)", fontSize: "0.55rem", letterSpacing: "0.18em" }}>TAROT · DIVINATION · INSIGHT</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <LanguageToggle lang={lang} setLang={(l) => setLanguage(l)} />
            <button id="Admin-Portal-Button" onClick={() => setAdminOpen(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.22)", borderRadius: "8px", padding: "7px 12px", color: "rgba(167,139,250,0.75)", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", transition: "all 0.2s" }} onMouseEnter={(e) => { Object.assign((e.currentTarget as HTMLElement).style, { background: "rgba(139,92,246,0.14)", borderColor: "rgba(139,92,246,0.4)", color: "#A78BFA" }); }} onMouseLeave={(e) => { Object.assign((e.currentTarget as HTMLElement).style, { background: "rgba(139,92,246,0.07)", borderColor: "rgba(139,92,246,0.22)", color: "rgba(167,139,250,0.75)" }); }}>
              <Shield size={12} /><span>Admin Portal</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section — Strict Z-index Layering ────────────────────────── */}
      <section
        id="Hero-Section"
        style={{ position: "relative", minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px 100px", overflow: "hidden" }}
      >
        {/* ════════════════════════════════════════════════════════
            LAYER 0 — Background (Z-index: 0)
            Developer: Replace the image src with the Three.js / Spline
            canvas element. The blur + overlay maintain foreground contrast.
            ════════════════════════════════════════════════════════ */}
        <div
          id="Hero-Background-Layer"
          style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}
        >
          {/* Background image — extended -30px on all sides to hide blur edges */}
          <div
            id="BG-Image"
            style={{
              position: "absolute",
              top: "-30px", left: "-30px", right: "-30px", bottom: "-30px",
              backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600')",
              backgroundSize: "cover", backgroundPosition: "center",
              // Blur radius 100–150px equivalent via CSS filter (matches Figma layer blur)
              filter: "blur(16px) brightness(0.18) saturate(0.3)",
              transform: "scale(1.06)",
            }}
          />
          {/* Dark overlay — rgba(0,0,0) at 62% opacity, guarantees text contrast */}
          <div id="BG-Overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.62)" }} />
          {/* Atmospheric purple radial */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 38%, rgba(139,92,246,0.13) 0%, transparent 62%)" }} />
          {/* Warm gold horizon glow */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "35%", background: "linear-gradient(to top, rgba(201,168,76,0.05) 0%, transparent 100%)" }} />
          {/* Star particles — belong to atmosphere, live in Layer 0 */}
          {[...Array(26)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: `${1 + (i % 3) * 0.7}px`, height: `${1 + (i % 3) * 0.7}px`,
              borderRadius: "50%",
              backgroundColor: i % 3 === 0 ? "#C9A84C" : i % 3 === 1 ? "#8B5CF6" : "#ffffff",
              top: `${(i * 19 + 5) % 100}%`, left: `${(i * 23 + 7) % 100}%`,
              opacity: 0.06 + (i % 5) * 0.09,
              animation: `twinkle ${3 + (i % 4)}s ease-in-out infinite alternate`,
              animationDelay: `${(i * 0.38) % 5}s`,
            }} />
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════
            LAYER 10 — Foreground Typography Container (Z-index: 10)
            overflow: visible — title white-space:nowrap must not clip.
            ════════════════════════════════════════════════════════ */}
        <div
          id="Hero-Foreground-Layer"
          style={{ position: "relative", zIndex: 10, overflow: "visible", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
        >
          {/* Vertical Auto Layout: gap-72 between Hero Text + Auth Form */}
          <div
            id="Hero-Vertical-Container"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "72px", width: "100%", maxWidth: "660px", overflow: "visible" }}
          >
            {/* ── Hero Text Group ────────────────────────────────────────── */}
            <div
              id="Hero-Text-Group"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "22px", textAlign: "center", overflow: "visible" }}
            >
              {/* Eyebrow */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ height: "1px", width: "40px", background: "linear-gradient(to right,transparent,rgba(201,168,76,0.5))" }} />
                <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(201,168,76,0.6)", fontSize: "0.64rem", letterSpacing: "0.24em", fontWeight: 600, whiteSpace: "nowrap" }}>{t.eyebrow}</span>
                <div style={{ height: "1px", width: "40px", background: "linear-gradient(to left,transparent,rgba(201,168,76,0.5))" }} />
              </div>

              {/* ── TITLE FRAME — overflow:visible, title on one unbreakable line ── */}
              <div
                id="Hero-Title-Frame"
                style={{ overflow: "visible", width: "100%", display: "flex", justifyContent: "center" }}
              >
                <h1
                  id="Hero-Title"
                  style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: "clamp(2.4rem,7.5vw,7rem)",
                    fontWeight: 700, lineHeight: 1.04, letterSpacing: "0.07em",
                    textAlign: "center",
                    // ── Single, unbreakable horizontal line ──
                    whiteSpace: "nowrap",
                    // Hug contents — no fixed width, display:inline-block
                    display: "inline-block",
                    maxWidth: "none",
                    background: "linear-gradient(135deg,#F0E6D3 5%,#C9A84C 35%,#F0E6D3 55%,#A78BFA 85%,#C9A84C 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    filter: "drop-shadow(0 0 52px rgba(201,168,76,0.22))",
                  }}
                >
                  {t.title}
                </h1>
              </div>

              <p id="Hero-Subtitle" style={{ fontFamily: "'Cinzel',serif", color: "rgba(240,230,211,0.65)", fontSize: "clamp(0.9rem,2.5vw,1.35rem)", letterSpacing: "0.1em", fontWeight: 400, lineHeight: 1.5 }}>
                {t.subtitle}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ height: "1px", width: "50px", background: "linear-gradient(to right,transparent,rgba(139,92,246,0.4))" }} />
                <span style={{ color: "rgba(139,92,246,0.4)", fontSize: "9px", letterSpacing: "5px" }}>◈ ◈ ◈</span>
                <div style={{ height: "1px", width: "50px", background: "linear-gradient(to left,transparent,rgba(139,92,246,0.4))" }} />
              </div>

              {/* Quote — no fixed height, hug contents vertically, 1.95 line-height for diacritics */}
              <p id="Hero-Quote" style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.45)", fontSize: "clamp(0.85rem,2vw,1rem)", lineHeight: 1.95, fontStyle: "italic", maxWidth: "520px" }}>
                {t.quote}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", justifyContent: "center" }}>
                {t.features.map(({ sym, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "rgba(201,168,76,0.55)", fontSize: "11px" }}>{sym}</span>
                    <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.35)", fontSize: "0.78rem", lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Auth Form — glass card, 72px below title group ── */}
            <AuthModule c={t.auth} />
          </div>
        </div>

        {/* ════ Z-index 11 — Scroll Hint (above all layers) ════ */}
        <div id="Scroll-Hint" style={{ position: "absolute", bottom: "28px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 11 }}>
          <span style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.18)", fontSize: "0.62rem", letterSpacing: "0.18em" }}>{t.scrollHint}</span>
          <ChevronDown size={13} color="rgba(240,230,211,0.18)" style={{ animation: "bounce 2s ease-in-out infinite" }} />
        </div>
      </section>

      {/* ── Below the Fold ─────────────────────────────────────────────────── */}
      <BelowFold t={t} lang={lang} />

      {adminOpen && <AdminModal onClose={() => setAdminOpen(false)} />}

      <style>{`
        @keyframes twinkle { from{opacity:0.05;transform:scale(0.8)} to{opacity:0.7;transform:scale(1.2)} }
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(5px)} }
        @keyframes menuOpen { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popUp { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes breathe { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.08)} }
        @keyframes spinSlow { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
      `}</style>
    </div>
  );
}
