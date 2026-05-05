import React, { useState } from "react";
import { X, Shield, KeyRound, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();
  const { language } = useApp();
  const HEADING_FONT = language === "VI" ? "'Playfair Display', serif" : "'Cinzel', serif";

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");
    
    setTimeout(() => {
      setLoading(false);
      if (pass === "oracle2024") {
        sessionStorage.setItem("isAdminAuthenticated", "true");
        onClose();
        navigate("/admin");
      } else {
        setErrMsg("The Oracle does not recognize this cipher. Access denied.");
      }
    }, 600);
  };

  return (
    <div
      id="Modal-Overlay"
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backgroundColor: "rgba(5,5,12,0.9)", backdropFilter: "blur(12px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="Admin-Modal"
        className="relative w-full max-w-md mx-4 rounded-[30px] p-10 flex flex-col animate-fade-in"
        style={{
          background: "linear-gradient(160deg, #0F0F1E 0%, #0B0B16 100%)",
          border: "1px solid rgba(139,92,246,0.3)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(139,92,246,0.1)",
          gap: "28px",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rgba(139,92,246,0.1) border border-[rgba(139,92,246,0.2)] flex items-center justify-center">
              <Shield size={22} className="text-[#A78BFA]" />
            </div>
             <div>
              <h2 className="text-[#F0E6D3] text-xl tracking-wider" style={{ fontFamily: HEADING_FONT }}>Oracle Portal</h2>
              <p className="font-raleway text-[rgba(240,230,211,0.4)] text-[0.75rem]">Administrative Sanctuary</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/30 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-3">
             <label className="font-raleway text-[0.65rem] uppercase tracking-[0.2em] text-[rgba(240,230,211,0.5)] font-bold block ml-1">
               Oracle Cipher
             </label>
             <div className="relative">
                <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10" />
                <input 
                  type="password" 
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-[0.9rem] focus:outline-none focus:border-[#C9A84C]/40 transition-all placeholder:text-white/5"
                  style={{ fontFamily: "'Raleway', sans-serif" }}
                />
             </div>
          </div>

          {errMsg && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
               <p className="font-raleway text-red-400 text-[0.75rem]">{errMsg}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
             className="w-full group bg-[#F0E6D3] hover:bg-white text-[#070710] py-4 rounded-2xl font-bold tracking-[0.1em] transition-all flex items-center justify-center gap-3 relative overflow-hidden"
            style={{ fontFamily: HEADING_FONT }}
          >
            {loading ? "Decrypting..." : "Unveil Insights"}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="text-center opacity-20 flex items-center justify-center gap-2">
           <Sparkles size={12} />
           <span className="text-[0.6rem] uppercase tracking-widest font-bold">Authenticated Access Only</span>
        </div>
      </div>

      <style>{`
         .font-raleway { font-family: 'Raleway', sans-serif; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}
