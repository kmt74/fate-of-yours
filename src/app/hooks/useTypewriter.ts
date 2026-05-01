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
  const charIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textRef = useRef(text);
  const isDoneRef = useRef(false); // Ref mirrors isDone to avoid stale closure in event handler

  // Keep refs in sync with latest values
  useEffect(() => { textRef.current = text; }, [text]);
  useEffect(() => { isDoneRef.current = isDone; }, [isDone]);

  useEffect(() => {
    if (!enabled || !text) return;

    charIndexRef.current = 0;
    isDoneRef.current = false;
    setDisplayedText("");
    setIsDone(false);

    // ── Helpers defined inside effect — no stale closure, no dep-array issues ──
    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const snapToEnd = () => {
      stopInterval();
      setDisplayedText(textRef.current);
      isDoneRef.current = true;
      setIsDone(true);
    };

    // ── Main typewriter interval ──────────────────────────────────────────────
    intervalRef.current = setInterval(() => {
      const idx = charIndexRef.current;
      if (idx < text.length) {
        setDisplayedText(text.slice(0, idx + 1));
        charIndexRef.current++;
      } else {
        stopInterval();
        isDoneRef.current = true;
        setIsDone(true);
      }
    }, speed);

    // ── Page Visibility API: snap to end when tab comes back into focus ───────
    // isDoneRef (not isDone state) avoids the stale closure problem
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isDoneRef.current) {
        snapToEnd();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopInterval();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [text, speed, enabled]);

  return { displayedText, isDone };
}
