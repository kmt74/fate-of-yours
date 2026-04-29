import React, { useState } from "react";
import { X } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  return (
    <div
      id="Modal-Overlay"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="Admin-Modal"
        className="relative w-full max-w-md mx-4 rounded-2xl p-8 flex flex-col"
        style={{
          background: "linear-gradient(145deg, #1A1A2E 0%, #12121E 100%)",
          border: "1px solid rgba(201, 168, 76, 0.25)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(139,92,246,0.08)",
          gap: "24px",
        }}
      >
        {/* Close button */}
        <button
          id="Modal-Close"
          onClick={onClose}
          className="absolute top-5 right-5 flex items-center justify-center w-8 h-8 rounded-full"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(226,232,240,0.6)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)";
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(226,232,240,0.6)";
          }}
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div id="Modal-Header" className="flex flex-col items-center" style={{ gap: "8px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(139,92,246,0.2))",
              border: "1px solid rgba(201, 168, 76, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            🔮
          </div>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              color: "#E2E8F0",
              fontSize: "1.25rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            Admin Portal
          </h2>
          <p
            style={{
              fontFamily: "'Raleway', sans-serif",
              color: "rgba(226, 232, 240, 0.5)",
              fontSize: "0.85rem",
              textAlign: "center",
            }}
          >
            Enter your credentials to access the admin panel
          </p>
        </div>

        {/* Form */}
        <div id="Admin-Form" className="flex flex-col" style={{ gap: "14px" }}>
          <div className="flex flex-col" style={{ gap: "6px" }}>
            <label
              style={{
                fontFamily: "'Raleway', sans-serif",
                color: "rgba(226, 232, 240, 0.7)",
                fontSize: "0.8rem",
                letterSpacing: "0.08em",
              }}
            >
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@arcanaread.com"
              style={{
                fontFamily: "'Raleway', sans-serif",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(201, 168, 76, 0.2)",
                borderRadius: "8px",
                padding: "12px 16px",
                color: "#E2E8F0",
                fontSize: "0.9rem",
                outline: "none",
                transition: "border-color 0.2s ease",
                width: "100%",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(201, 168, 76, 0.5)";
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(201, 168, 76, 0.2)";
              }}
            />
          </div>

          <div className="flex flex-col" style={{ gap: "6px" }}>
            <label
              style={{
                fontFamily: "'Raleway', sans-serif",
                color: "rgba(226, 232, 240, 0.7)",
                fontSize: "0.8rem",
                letterSpacing: "0.08em",
              }}
            >
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                fontFamily: "'Raleway', sans-serif",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(201, 168, 76, 0.2)",
                borderRadius: "8px",
                padding: "12px 16px",
                color: "#E2E8F0",
                fontSize: "0.9rem",
                outline: "none",
                transition: "border-color 0.2s ease",
                width: "100%",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(201, 168, 76, 0.5)";
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(201, 168, 76, 0.2)";
              }}
            />
          </div>

          <button
            id="Admin-Submit"
            style={{
              fontFamily: "'Raleway', sans-serif",
              background: "linear-gradient(135deg, #C9A84C, #A8873A)",
              color: "#121212",
              border: "none",
              borderRadius: "8px",
              padding: "13px 24px",
              letterSpacing: "0.08em",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: "4px",
              fontSize: "0.9rem",
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
          >
            Sign In to Admin
          </button>
        </div>

        {/* Footer */}
        <p
          style={{
            fontFamily: "'Raleway', sans-serif",
            color: "rgba(226, 232, 240, 0.3)",
            fontSize: "0.75rem",
            textAlign: "center",
          }}
        >
          Forgot password? Contact your system administrator.
        </p>
      </div>
    </div>
  );
}
