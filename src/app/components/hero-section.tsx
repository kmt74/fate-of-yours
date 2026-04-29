import React from "react";

interface HeroSectionProps {
  onDraw1Card: () => void;
  onDraw3Cards: () => void;
}

export function HeroSection({ onDraw1Card, onDraw3Cards }: HeroSectionProps) {
  return (
    <section
      id="Hero-Section"
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Layer */}
      <div id="Hero-Background" className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1576180525792-82cdc0e2b29e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYWxheHklMjBuZWJ1bGElMjBwdXJwbGUlMjBjb3Ntb3N8ZW58MXx8fHwxNzc3NDM5NDk0fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Cosmic background"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.35) saturate(1.4)" }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(18,18,18,0.3) 0%, rgba(18,18,18,0.5) 60%, rgba(18,18,18,1) 100%)",
          }}
        />
        {/* Radial glow center */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 65%)",
          }}
        />
      </div>

      {/* Floating particles */}
      <div id="Particle-Layer" className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              backgroundColor: i % 3 === 0 ? "#C9A84C" : i % 3 === 1 ? "#8B5CF6" : "#ffffff",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.2,
              animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div
        id="Hero-Container"
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto"
        style={{ gap: "32px" }}
      >
        {/* Decorative top ornament */}
        <div id="Hero-Ornament" className="flex items-center gap-3">
          <div
            className="h-px w-16"
            style={{ background: "linear-gradient(to right, transparent, #C9A84C)" }}
          />
          <span style={{ color: "#C9A84C", fontSize: "20px" }}>✦</span>
          <div
            className="h-px w-16"
            style={{ background: "linear-gradient(to left, transparent, #C9A84C)" }}
          />
        </div>

        {/* Heading */}
        <div id="Hero-Text" className="flex flex-col items-center" style={{ gap: "16px" }}>
          <h1
            id="Hero-Heading"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "0.04em",
              background: "linear-gradient(135deg, #ffffff 30%, #C9A84C 70%, #8B5CF6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Unveil Your Path
          </h1>
          <p
            id="Hero-Subtext"
            style={{
              fontFamily: "'Raleway', sans-serif",
              color: "rgba(226, 232, 240, 0.72)",
              fontSize: "1.125rem",
              lineHeight: 1.7,
              maxWidth: "480px",
              letterSpacing: "0.02em",
            }}
          >
            Let the ancient wisdom of the tarot illuminate your journey. Choose
            your spread and let the cards reveal what lies ahead.
          </p>
        </div>

        {/* Action Buttons */}
        <div
          id="Hero-Actions"
          className="flex flex-row items-center justify-center flex-wrap"
          style={{ gap: "16px" }}
        >
          <button
            id="Primary-Button-Draw1"
            onClick={onDraw1Card}
            style={{
              fontFamily: "'Raleway', sans-serif",
              background: "linear-gradient(135deg, #C9A84C, #A8873A)",
              color: "#121212",
              border: "none",
              borderRadius: "8px",
              padding: "14px 32px",
              letterSpacing: "0.06em",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.25s ease",
              boxShadow: "0 4px 20px rgba(201, 168, 76, 0.35)",
              fontSize: "0.95rem",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(201, 168, 76, 0.55)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(201, 168, 76, 0.35)";
            }}
          >
            Draw 1 Card
          </button>

          <button
            id="Primary-Button-Draw3"
            onClick={onDraw3Cards}
            style={{
              fontFamily: "'Raleway', sans-serif",
              background: "transparent",
              color: "#C9A84C",
              border: "1.5px solid #C9A84C",
              borderRadius: "8px",
              padding: "14px 32px",
              letterSpacing: "0.06em",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.25s ease",
              boxShadow: "0 0 0 rgba(201, 168, 76, 0)",
              fontSize: "0.95rem",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(201, 168, 76, 0.1)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(201, 168, 76, 0.25)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 rgba(201, 168, 76, 0)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            Draw 3 Cards
          </button>
        </div>

        {/* Bottom ornament */}
        <div id="Hero-Ornament-Bottom" className="flex items-center gap-3">
          <div
            className="h-px w-12"
            style={{ background: "linear-gradient(to right, transparent, rgba(139,92,246,0.6))" }}
          />
          <span style={{ color: "rgba(139,92,246,0.7)", fontSize: "14px" }}>◈</span>
          <div
            className="h-px w-12"
            style={{ background: "linear-gradient(to left, transparent, rgba(139,92,246,0.6))" }}
          />
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        id="Scroll-Indicator"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center"
        style={{ gap: "6px" }}
      >
        <span
          style={{
            fontFamily: "'Raleway', sans-serif",
            color: "rgba(226, 232, 240, 0.4)",
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
          }}
        >
          SCROLL TO READ
        </span>
        <div
          className="w-5 h-8 rounded-full border flex items-start justify-center pt-1.5"
          style={{ borderColor: "rgba(226, 232, 240, 0.25)" }}
        >
          <div
            className="w-1 h-2 rounded-full"
            style={{
              backgroundColor: "#C9A84C",
              animation: "bounce 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </section>
  );
}
