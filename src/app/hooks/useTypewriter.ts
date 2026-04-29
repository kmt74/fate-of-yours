import { useState, useEffect, useRef } from "react";

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  enabled?: boolean;
}

interface UseTypewriterReturn {
  displayedText: string;
  isDone: boolean;
}

export function useTypewriter({
  text,
  speed = 12,
  enabled = true,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayedText, setDisplayedText] = useState("");
  const [isDone, setIsDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || !text) return;

    let charIndex = 0;
    setDisplayedText("");
    setIsDone(false);

    intervalRef.current = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText(text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsDone(true);
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed, enabled]);

  return { displayedText, isDone };
}
