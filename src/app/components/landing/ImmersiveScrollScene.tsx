import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * ImmersiveScrollScene — Provides the unified background for the entire LandingPage.
 * Animates a deck of tarot cards through Shuffle, Draw, and Merge phases based on scroll.
 */
export function ImmersiveScrollScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardCount = 12; // More cards for a "deck" feel

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".gsap-card");
      if (cards.length === 0) return;

      const selectedIndices = [4, 5, 6]; 
      
      gsap.set(cards, {
        x: 0,
        y: 100,
        z: (i) => -i * 2,
        rotationX: 45,
        rotationY: 0,
        rotationZ: 0,
        scale: 0.8,
        opacity: 0,
        transformOrigin: "50% 50%",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current?.parentElement || "#Landing-Main",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.8,
        },
      });

      // --- STAGE 1: THE REVEAL & SHUFFLE ---
      // Cards emerge and start a chaotic shuffle
      tl.to(cards, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.05,
        ease: "power2.out"
      }, 0);

      // Shuffling motion: cards move left/right and jitter
      tl.to(cards, {
        x: (i) => (i % 2 === 0 ? 40 : -40),
        rotationZ: (i) => (i % 2 === 0 ? 5 : -5),
        duration: 1.5,
        stagger: {
          each: 0.1,
          from: "random",
          repeat: 1,
          yoyo: true
        },
        ease: "sine.inOut"
      }, 0.2);

      // --- STAGE 2: THE SACRED DRAW ---
      // Fade out non-selected cards
      const nonSelected = cards.filter((_, i) => !selectedIndices.includes(i));
      const selected = cards.filter((_, i) => selectedIndices.includes(i));

      tl.to(nonSelected, {
        opacity: 0.15,
        scale: 0.7,
        z: -200,
        duration: 1.5,
        ease: "power2.inOut"
      }, 2);

      // Draw the 3 selected cards into a fanned spread
      tl.to(selected, {
        x: (i) => (i - 1) * 220, // Spread them out
        y: (i) => Math.abs(i - 1) * -30 - 50, // Slight arc
        z: 150, // Bring to foreground
        rotationX: 0,
        rotationY: (i) => (i - 1) * 15, // Tilt towards center
        rotationZ: (i) => (i - 1) * 10,
        scale: 1.2,
        opacity: 1,
        duration: 2.5,
        ease: "expo.out"
      }, 2.2);

      // --- STAGE 3: INTERACTION & CONVERGENCE ---
      // Elegant 3D rotation of selected cards
      tl.to(selected, {
        rotationY: "+=360",
        duration: 4,
        ease: "none"
      }, 4);

      // Merge back into a single glowing stack
      tl.to(selected, {
        x: 0,
        y: -100,
        z: 300,
        rotationX: 720,
        rotationY: 0,
        rotationZ: 0,
        scale: 1.5,
        duration: 3,
        ease: "power3.inOut"
      }, 7);

      tl.to(selected, {
        scale: 0,
        opacity: 0,
        duration: 1,
        ease: "power2.in"
      }, 9.5);

    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1500px",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* ── Atmospheric Elements ── */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: "1000px", height: "1000px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 75%)",
        animation: "breathe 10s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: "600px", height: "600px", borderRadius: "50%",
        border: "1px solid rgba(139,92,246,0.12)",
        animation: "spinSlow 80s linear infinite",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: "450px", height: "450px", borderRadius: "50%",
        border: "1px solid rgba(201,168,76,0.1)",
        animation: "spinSlow 60s linear infinite reverse",
      }} />

      {/* ── Twinkling background stars ── */}
      {[...Array(50)].map((_, i) => (
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

      {/* ── The Tarot Deck ── */}
      <div style={{
        position: "relative",
        transformStyle: "preserve-3d",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        pointerEvents: "none"
      }}>
        {[...Array(cardCount)].map((_, i) => (
          <div
            key={i}
            className="gsap-card"
            style={{
              position: "absolute",
              width: "clamp(120px, 15vw, 180px)",
              aspectRatio: "150/235",
              borderRadius: "16px",
              background: "linear-gradient(145deg, #1A1428 0%, #0D0B18 100%)",
              border: "1.5px solid rgba(201,168,76,0.35)",
              boxShadow: `
                0 0 50px rgba(139,92,246,0.15),
                0 25px 60px rgba(0,0,0,0.8),
                inset 0 0 40px rgba(139,92,246,0.06)
              `,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transformStyle: "preserve-3d",
              willChange: "transform, opacity",
            }}
          >
            {/* Card Content Interior */}
            <div style={{
              width: "82%", height: "82%", borderRadius: "10px",
              border: "1px solid rgba(201,168,76,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "radial-gradient(ellipse at center, rgba(139,92,246,0.1) 0%, transparent 75%)",
            }}>
              <div style={{
                width: "60px", height: "60px", borderRadius: "50%",
                border: "1px solid rgba(201,168,76,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "24px", color: "rgba(201,168,76,0.7)",
                textShadow: "0 0 30px rgba(201,168,76,0.5)",
              }}>
                ✦
              </div>
            </div>
            
            {/* Corner Decorations */}
            <div style={{ position: "absolute", top: "14px", left: "14px", width: "18px", height: "18px", borderTop: "1px solid rgba(201,168,76,0.3)", borderLeft: "1px solid rgba(201,168,76,0.3)" }} />
            <div style={{ position: "absolute", top: "14px", right: "14px", width: "18px", height: "18px", borderTop: "1px solid rgba(201,168,76,0.3)", borderRight: "1px solid rgba(201,168,76,0.3)" }} />
            <div style={{ position: "absolute", bottom: "14px", left: "14px", width: "18px", height: "18px", borderBottom: "1px solid rgba(201,168,76,0.3)", borderLeft: "1px solid rgba(201,168,76,0.3)" }} />
            <div style={{ position: "absolute", bottom: "14px", right: "14px", width: "18px", height: "18px", borderBottom: "1px solid rgba(201,168,76,0.3)", borderRight: "1px solid rgba(201,168,76,0.3)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
