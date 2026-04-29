import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * ImmersiveScrollScene — Provides the unified background for the entire LandingPage.
 * Animates tarot cards and atmospheric elements based on global scroll position.
 */
export function ImmersiveScrollScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".gsap-card");

      // Set initial state: cards are stacked, flat, invisible
      gsap.set(cards, {
        y: 120,
        rotationX: 45,
        rotationY: 0,
        rotationZ: 0,
        scale: 0.6,
        opacity: 0,
        transformOrigin: "50% 100%",
      });

      // Unified Timeline for the entire page scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        },
      });

      // Stage 1: Initial Reveal (After Hero Section)
      // We start animating cards once user scrolls past the hero (approx 15% of scroll)
      tl.to(cards, {
        y: 0,
        rotationX: 0,
        opacity: 1,
        scale: 1,
        duration: 2,
        stagger: 0.15,
        ease: "power2.out",
      }, 0.1); 

      // Stage 2: Fan out into a spread
      tl.to(cards, {
        rotationZ: (i: number) => (i - 1) * 22,
        x: (i: number) => (i - 1) * 20, // Reduced translation since container now uses flex gap
        y: (i: number) => Math.abs(i - 1) * -20,
        scale: 1.1,
        duration: 3,
        ease: "power3.inOut",
      }, 0.3);

      // Stage 3: Float and rotate in place
      tl.to(cards, {
        y: (i: number) => (i - 1) * -10 - 40,
        rotationY: (i: number) => (i - 1) * 10,
        opacity: 0.5,
        scale: 0.95,
        duration: 4,
        ease: "none",
      }, 0.7);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1200px",
        overflow: "hidden",
      }}
    >
      {/* ── Atmospheric Elements ── */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: "800px", height: "800px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
        animation: "breathe 8s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: "500px", height: "500px", borderRadius: "50%",
        border: "1px solid rgba(139,92,246,0.1)",
        animation: "spinSlow 60s linear infinite",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: "350px", height: "350px", borderRadius: "50%",
        border: "1px solid rgba(201,168,76,0.08)",
        animation: "spinSlow 45s linear infinite reverse",
      }} />

      {/* ── Twinkling background stars ── */}
      {[...Array(30)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: `${1 + (i % 3)}px`, height: `${1 + (i % 3)}px`,
          borderRadius: "50%",
          background: i % 3 === 0 ? "#C9A84C" : i % 3 === 1 ? "#8B5CF6" : "#ffffff",
          opacity: 0.2 + (i % 5) * 0.1,
          top: `${(i * 13 + 7) % 100}%`,
          left: `${(i * 17 + 11) % 100}%`,
          animation: `twinkle ${3 + (i % 4)}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}

      {/* ── The 3 Tarot Card Backs ── */}
      <div style={{
        position: "relative",
        transformStyle: "preserve-3d",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "40px",
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        pointerEvents: "none"
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="gsap-card"
            style={{
              position: "relative",
              width: "clamp(100px, 20vw, 180px)",
              aspectRatio: "150/235",
              borderRadius: "14px",
              background: "linear-gradient(145deg, #1A1428 0%, #0D0B18 100%)",
              border: "1.5px solid rgba(201,168,76,0.3)",
              boxShadow: `
                0 0 50px rgba(139,92,246,0.2),
                0 30px 80px rgba(0,0,0,0.7),
                inset 0 0 40px rgba(139,92,246,0.08)
              `,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transformStyle: "preserve-3d",
              willChange: "transform, opacity",
              flexShrink: 0,
            }}
          >
            <div style={{
              width: "80%", height: "80%", borderRadius: "10px",
              border: "1px solid rgba(201,168,76,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, transparent 70%)",
            }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                border: "1px solid rgba(201,168,76,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", color: "rgba(201,168,76,0.6)",
                textShadow: "0 0 25px rgba(201,168,76,0.4)",
              }}>
                ✦
              </div>
            </div>
            
            <div style={{ position: "absolute", top: "12px", left: "12px", width: "15px", height: "15px", borderTop: "1px solid rgba(201,168,76,0.25)", borderLeft: "1px solid rgba(201,168,76,0.25)" }} />
            <div style={{ position: "absolute", top: "12px", right: "12px", width: "15px", height: "15px", borderTop: "1px solid rgba(201,168,76,0.25)", borderRight: "1px solid rgba(201,168,76,0.25)" }} />
            <div style={{ position: "absolute", bottom: "12px", left: "12px", width: "15px", height: "15px", borderBottom: "1px solid rgba(201,168,76,0.25)", borderLeft: "1px solid rgba(201,168,76,0.25)" }} />
            <div style={{ position: "absolute", bottom: "12px", right: "12px", width: "15px", height: "15px", borderBottom: "1px solid rgba(201,168,76,0.25)", borderRight: "1px solid rgba(201,168,76,0.25)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
