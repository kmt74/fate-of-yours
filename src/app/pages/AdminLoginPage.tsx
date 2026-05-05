import React, { useState } from "react";
import { ShieldCheck, Sparkles, KeyRound, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded for demo/user requirement
    if (password === "oracle2024") {
      sessionStorage.setItem("isAdminAuthenticated", "true");
      navigate("/admin");
    } else {
      setError("The Oracle does not recognize this key.");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#070710] flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1)_0%,transparent_70%)] animate-pulse" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C9A84C] opacity-[0.03] blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8B5CF6] opacity-[0.03] blur-[120px] rounded-full" />

      {/* Login Portal */}
      <div className="relative w-full max-w-md z-10">
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#C9A84C] to-[#8B5CF6] p-[1px] mb-6 group transition-all duration-500 hover:shadow-[0_0_30px_rgba(201,168,76,0.4)]">
              <div className="w-full h-full bg-[#070710] rounded-2xl flex items-center justify-center relative overflow-hidden">
                 <ShieldCheck className="text-[#C9A84C] group-hover:scale-110 transition-transform duration-500" size={32} />
                 <Sparkles className="absolute top-2 right-2 text-white/20" size={12} />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-[0.2em] mb-2" style={{ fontFamily: "'Cinzel', serif", color: "#F0E6D3" }}>
              ORACLE PORTAL
            </h1>
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-[rgba(240,230,211,0.4)] font-bold" style={{ fontFamily: "'Raleway', sans-serif" }}>
              Unlock the Administrative Insight
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[0.6rem] uppercase tracking-[0.2em] text-[rgba(240,230,211,0.4)] ml-2 font-bold" style={{ fontFamily: "'Raleway', sans-serif" }}>
                Secret Cipher
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(240,230,211,0.2)] group-focus-within:text-[#C9A84C] transition-colors">
                  <KeyRound size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-[0.9rem] focus:outline-none focus:border-[#C9A84C]/40 transition-all text-[#F0E6D3] placeholder:text-white/10"
                  style={{ fontFamily: "'Raleway', sans-serif" }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(240,230,211,0.2)] hover:text-[#C9A84C] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && (
                <div className="text-red-400 text-[0.65rem] font-bold mt-2 ml-2 animate-shake" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  {error}
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="w-full group bg-[#F0E6D3] hover:bg-white text-[#070710] py-4 rounded-2xl font-bold tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              <span className="relative z-10">ENTER THE VOID</span>
              <ArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform duration-500" size={18} />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </button>
          </form>

          <div className="mt-10 text-center">
             <button 
               onClick={() => navigate("/")}
               className="text-[0.6rem] uppercase tracking-[0.2em] text-[rgba(240,230,211,0.2)] hover:text-[#C9A84C] transition-colors font-bold" 
               style={{ fontFamily: "'Raleway', sans-serif" }}
             >
               Return to the mortal realm
             </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
