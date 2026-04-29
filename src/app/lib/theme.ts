// ─── Design Tokens (TypeScript mirror of tokens.css) ──────────────────────────
// Used in inline styles where Tailwind arbitrary values would be too verbose.

export const COLORS = {
  bg: {
    main: "#0A0A12",
    card: "rgba(255,255,255,0.025)",
    hover: "rgba(255,255,255,0.04)",
    cardFront: "linear-gradient(145deg, #1E1632 0%, #160F28 100%)",
    cardBack: "linear-gradient(145deg, #141420 0%, #0F0F1A 100%)",
    aiPanel: "linear-gradient(145deg, rgba(16,12,30,0.9) 0%, rgba(10,8,22,0.95) 100%)",
  },
  gold: {
    DEFAULT: "#C9A84C",
    dark: "#A8873A",
    bright: "#D4B85C",
    dim: "rgba(201,168,76,0.6)",
    border: "rgba(201,168,76,0.35)",
    glow: "rgba(201,168,76,0.28)",
  },
  violet: {
    DEFAULT: "#8B5CF6",
    light: "#A78BFA",
    dark: "#6D28D9",
    border: "rgba(139,92,246,0.38)",
    glow: "rgba(139,92,246,0.15)",
  },
  cream: {
    DEFAULT: "#F0E6D3",
    muted: "rgba(240,230,211,0.75)",
    dim: "rgba(240,230,211,0.45)",
    faint: "rgba(240,230,211,0.28)",
    ghost: "rgba(240,230,211,0.1)",
  },
  position: {
    past: "rgba(167,139,250,0.9)",
    present: "#C9A84C",
    future: "rgba(126,168,224,0.9)",
  },
} as const;

export const FONTS = {
  serif: "'Cinzel', serif",
  sans: "'Raleway', sans-serif",
} as const;

export const POSITIONS = ["Past", "Present", "Future"] as const;
export type Position = (typeof POSITIONS)[number];

export const POSITION_COLORS: Record<Position, string> = {
  Past: COLORS.position.past,
  Present: COLORS.position.present,
  Future: COLORS.position.future,
};

// ─── Utility ──────────────────────────────────────────────────────────────────
export function hexToRgbStr(hex: string): string {
  return `${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)}`;
}
