import React from "react";
import { Navigate } from "react-router";
import { Shield } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useApp();

  // Not logged in at all → back to landing
  if (!isAuthenticated) return <Navigate to="/" replace />;

  // Logged in but not admin → back to setup
  if (!user?.isAdmin) return <Navigate to="/setup" replace />;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#070710",
      color: "#F0E6D3",
      fontFamily: "'Raleway', sans-serif",
      padding: "80px 32px 40px",
    }}>
      {/* Header */}
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px",
            background: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Shield size={20} color="#A78BFA" />
          </div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.6rem", fontWeight: 700, color: "#F0E6D3", letterSpacing: "0.04em" }}>
            Admin Dashboard
          </h1>
        </div>
        <p style={{ color: "rgba(240,230,211,0.45)", fontSize: "0.88rem", marginBottom: "40px", paddingLeft: "58px" }}>
          Signed in as <span style={{ color: "#C9A84C" }}>{user.email}</span>
        </p>

        {/* Stats cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          {[
            { label: "Total Users", value: "—", icon: "👤" },
            { label: "Total Readings", value: "—", icon: "🃏" },
            { label: "Active Today", value: "—", icon: "🔥" },
          ].map((card) => (
            <div key={card.label} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: "16px", padding: "22px 24px"
            }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "8px" }}>{card.icon}</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "#C9A84C", marginBottom: "4px" }}>{card.value}</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(240,230,211,0.4)", letterSpacing: "0.08em" }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Placeholder content */}
        <div style={{
          background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.18)",
          borderRadius: "16px", padding: "28px"
        }}>
          <p style={{ color: "rgba(167,139,250,0.7)", fontSize: "0.85rem", lineHeight: 1.7 }}>
            🛠️ Admin features (user management, reading logs, content moderation) will be implemented here.
            Connect a real database (Supabase / Prisma) to activate live stats.
          </p>
        </div>
      </div>
    </div>
  );
}
