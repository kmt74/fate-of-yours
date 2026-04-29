import React from "react";
import { CardBack } from "./CardBack";

export function SpreadingDeck() {
  return (
    <div id="Deck-State-Spreading" className="flex min-h-[480px] flex-col items-center justify-center gap-9 overflow-hidden">
      <p style={{ fontFamily: "'Cinzel', serif", color: "rgba(201,168,76,0.6)", fontSize: "0.82rem", letterSpacing: "0.18em" }}>─ CARDS ARE SPREADING ─</p>
      <div className="relative flex w-full items-end justify-center" style={{ maxWidth: "700px", height: "200px" }}>
        {[...Array(24)].map((_, i) => {
          const total = 24;
          const angleRange = 60;
          const angle = -angleRange / 2 + (i / (total - 1)) * angleRange;
          const radius = 360;
          const x = Math.sin((angle * Math.PI) / 180) * radius;
          const y = -Math.cos((angle * Math.PI) / 180) * radius + radius - 80;
          return (
            <div key={i} className="absolute" style={{ bottom: "0", left: "50%", transform: `translateX(calc(-50% + ${x}px)) translateY(${y}px) rotate(${angle}deg)`, animation: `spreadCard 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 20}ms both`, zIndex: i }}>
              <CardBack width={55} height={86} />
            </div>
          );
        })}
      </div>
      <p style={{ fontFamily: "'Raleway', sans-serif", color: "rgba(240,230,211,0.35)", fontSize: "0.8rem", animation: "pulse 0.9s ease infinite alternate" }}>Preparing your selection...</p>
    </div>
  );
}
