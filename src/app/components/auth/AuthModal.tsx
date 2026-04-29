import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useApp } from "../../context/AppContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, i) => ({ value: i+1, label: m }));
const DAYS = Array.from({ length: 31 }, (_, i) => ({ value: i+1, label: String(i+1) }));
const YEARS = Array.from({ length: 83 }, (_, i) => { const y = 2006-i; return { value: y, label: String(y) }; });

type Tab = "login" | "signup";

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function validateDate(day: string, month: string, year: string): string | null {
  if (!day || !month || !year) return "Date of birth is required";
  const d = parseInt(day), m = parseInt(month), y = parseInt(year);
  const date = new Date(y, m-1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m-1 || date.getDate() !== d) return "Please enter a valid date";
  if (date > new Date()) return "Date of birth cannot be in the future";
  if (new Date().getFullYear() - y < 13) return "You must be at least 13 years old";
  return null;
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

// ─── Auth Module ──────────────────────────────────────────────────────────────
export function AuthModule({ c }: { c: any }) {
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

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!loginEmail) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(loginEmail)) errs.email = "Invalid email";
    if (!loginPass) errs.pass = "Password is required";
    setLoginErrs(errs);
    if (Object.keys(errs).length) return;
    
    setLoading(true);
    const success = await login(loginEmail, loginPass);
    setLoading(false);
    if (success) {
      navigate("/setup");
    } else {
      setLoginErrs({ auth: "Invalid email or password" });
    }
  };

  const doSignup = async (e: React.FormEvent) => {
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
    const dob = `${dobYear}-${String(dobMonth).padStart(2,"0")}-${String(dobDay).padStart(2,"0")}`;
    const success = await signup(signEmail, signPass, dob);
    setLoading(false);
    if (success) {
      navigate("/setup");
    } else {
      setSignErrs({ auth: "Email already exists" });
    }
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
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,rgba(201,168,76,0.2),rgba(139,92,246,0.2))", border: "1.5px solid rgba(201,168,76,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", boxShadow: "0 0 14px rgba(139,92,246,0.2)" }}>✦</div>
        <h3 style={{ fontFamily: "'Cinzel',serif", color: "#F0E6D3", fontSize: "1rem", letterSpacing: "0.04em" }}>
          {tab === "login" ? c.loginHead : c.signupHead}
        </h3>
      </div>
      <p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(240,230,211,0.38)", fontSize: "0.79rem", paddingLeft: "42px", marginBottom: "20px" }}>
        {tab === "login" ? c.loginSub : c.signupSub}
      </p>

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

      {tab === "login" && (
        <form onSubmit={doLogin} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
          <div>
            <label style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.69rem", letterSpacing: "0.14em", fontWeight: 600, color: "rgba(240,230,211,0.45)", display: "block", marginBottom: "6px" }}>{c.emailLabel}</label>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="your@email.com" style={inputStyle(!!loginErrs.email)} />
            {loginErrs.email && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.72rem", color: "rgba(226,100,100,0.85)", marginTop: "4px", display: "block" }}>{loginErrs.email}</span>}
          </div>
          <div style={{ position: "relative" }}>
            <label style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.69rem", letterSpacing: "0.14em", fontWeight: 600, color: "rgba(240,230,211,0.45)", display: "block", marginBottom: "6px" }}>{c.passwordLabel}</label>
            <input type={showLoginPass?"text":"password"} value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="••••••••" style={inputStyle(!!loginErrs.pass)} />
            <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} style={{ position: "absolute", right: "13px", top: "34px", background: "none", border: "none", cursor: "pointer", color: "rgba(240,230,211,0.35)", padding: 0 }}>{showLoginPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            {loginErrs.pass && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.72rem", color: "rgba(226,100,100,0.85)", marginTop: "4px", display: "block" }}>{loginErrs.pass}</span>}
          </div>
          {loginErrs.auth && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.78rem", color: "rgba(226,100,100,0.9)", textAlign: "center", display: "block" }}>{loginErrs.auth}</span>}
          <button type="submit" disabled={loading} style={{ marginTop: "6px", background: loading ? "rgba(201,168,76,0.35)" : "linear-gradient(135deg,#C9A84C,#A8873A)", border: "none", borderRadius: "10px", padding: "14px", color: "#0A0A12", fontFamily: "'Raleway',sans-serif", fontSize: "0.92rem", fontWeight: 700, letterSpacing: "0.06em", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 20px rgba(201,168,76,0.3)" }}>
            {loading ? c.loggingIn : c.loginBtn}
          </button>
        </form>
      )}

      {tab === "signup" && (
        <form onSubmit={doSignup} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
          <div>
            <label style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.69rem", letterSpacing: "0.14em", fontWeight: 600, color: "rgba(240,230,211,0.45)", display: "block", marginBottom: "6px" }}>{c.emailLabel}</label>
            <input type="email" value={signEmail} onChange={(e) => setSignEmail(e.target.value)} placeholder="your@email.com" style={inputStyle(!!signErrs.email)} />
            {signErrs.email && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.72rem", color: "rgba(226,100,100,0.85)", marginTop: "4px", display: "block" }}>{signErrs.email}</span>}
          </div>
          <div style={{ position: "relative" }}>
            <label style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.69rem", letterSpacing: "0.14em", fontWeight: 600, color: "rgba(240,230,211,0.45)", display: "block", marginBottom: "6px" }}>{c.passwordLabel}</label>
            <input type={showSignPass?"text":"password"} value={signPass} onChange={(e) => setSignPass(e.target.value)} placeholder="Min. 8 characters" style={inputStyle(!!signErrs.pass)} />
            <button type="button" onClick={() => setShowSignPass(!showSignPass)} style={{ position: "absolute", right: "13px", top: "34px", background: "none", border: "none", cursor: "pointer", color: "rgba(240,230,211,0.35)", padding: 0 }}>{showSignPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            {signErrs.pass && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.72rem", color: "rgba(226,100,100,0.85)", marginTop: "4px", display: "block" }}>{signErrs.pass}</span>}
          </div>

          <div>
            <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.69rem", letterSpacing: "0.14em", fontWeight: 600, display: "block", marginBottom: "6px", color: dobError ? "rgba(226,100,100,0.9)" : dobFocused ? "#C9A84C" : "rgba(240,230,211,0.45)", transition: "color 0.2s" }}>
              {c.dobLabel}
            </span>
            <div style={{ display: "flex", gap: "7px" }}>
              <DOBSelect id="dob-day" placeholder="Day" options={DAYS} value={dobDay} hasError={!!dobError && dobTouched} isFocused={dobFocused} onChange={(v) => { setDobDay(v); setDobTouched(true); }} onFocus={() => setDobFocused(true)} onBlur={() => setDobFocused(false)} />
              <DOBSelect id="dob-month" placeholder="Month" options={MONTHS} value={dobMonth} hasError={!!dobError && dobTouched} isFocused={dobFocused} onChange={(v) => { setDobMonth(v); setDobTouched(true); }} onFocus={() => setDobFocused(true)} onBlur={() => setDobFocused(false)} />
              <DOBSelect id="dob-year" placeholder="Year" options={YEARS} value={dobYear} hasError={!!dobError && dobTouched} isFocused={dobFocused} onChange={(v) => { setDobYear(v); setDobTouched(true); }} onFocus={() => setDobFocused(true)} onBlur={() => setDobFocused(false)} />
            </div>
            {!dobTouched && !dobFocused && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.71rem", color: "rgba(240,230,211,0.22)", marginTop: "5px", display: "block" }}>{c.dobHint}</span>}
            {dobFocused && !dobError && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.71rem", color: "rgba(201,168,76,0.7)", marginTop: "5px", display: "block" }}>{c.dobActive}</span>}
            {dobError && dobTouched && <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "5px" }}><span style={{ color: "rgba(226,100,100,0.85)", fontSize: "11px" }}>⚠</span><span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.72rem", color: "rgba(226,100,100,0.9)" }}>{dobError}</span></div>}
            {dobTouched && !dobError && dobDay && dobMonth && dobYear && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.71rem", color: "rgba(78,205,164,0.8)", marginTop: "5px", display: "block" }}>{c.dobValid}</span>}
          </div>

          {signErrs.auth && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.78rem", color: "rgba(226,100,100,0.9)", textAlign: "center", display: "block" }}>{signErrs.auth}</span>}

          <button type="submit" disabled={loading} style={{ marginTop: "6px", background: loading ? "rgba(201,168,76,0.35)" : "linear-gradient(135deg,#C9A84C,#A8873A)", border: "none", borderRadius: "10px", padding: "14px", color: "#0A0A12", fontFamily: "'Raleway',sans-serif", fontSize: "0.92rem", fontWeight: 700, letterSpacing: "0.06em", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 20px rgba(201,168,76,0.3)" }}>
            {loading ? c.signingUp : c.signupBtn}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Admin Modal ──────────────────────────────────────────────────────────────
export function AdminModal({ onClose }: { onClose: () => void }) {
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
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.7rem", color: "rgba(240,230,211,0.45)", letterSpacing: "0.1em" }}>Admin Email</label>
            <input type="email" placeholder="admin@fateofyours.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ background: "#080810", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "8px", padding: "10px 12px", color: "#F0E6D3", outline: "none" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.7rem", color: "rgba(240,230,211,0.45)", letterSpacing: "0.1em" }}>Admin Password</label>
            <input type="password" placeholder="••••••••" value={pass} onChange={(e) => setPass(e.target.value)} style={{ background: "#080810", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "8px", padding: "10px 12px", color: "#F0E6D3", outline: "none" }} />
          </div>
          {err && <div style={{ background: "rgba(226,100,100,0.07)", border: "1px solid rgba(226,100,100,0.22)", borderRadius: "8px", padding: "10px 12px" }}><p style={{ fontFamily: "'Raleway',sans-serif", color: "rgba(226,100,100,0.85)", fontSize: "0.78rem" }}>{err}</p></div>}
          <button type="submit" disabled={loading} style={{ marginTop: "4px", background: loading ? "rgba(109,40,217,0.4)" : "linear-gradient(135deg,#7C3AED,#6D28D9)", border: "none", borderRadius: "10px", padding: "13px", color: "#fff", fontFamily: "'Raleway',sans-serif", fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.05em", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Verifying..." : "Access Admin Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
