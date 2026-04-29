import { useState, useEffect } from "react";

export function useCardReveal(delayMs: number = 400): boolean {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return revealed;
}
