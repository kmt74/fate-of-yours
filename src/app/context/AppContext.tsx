import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { TarotCard } from "../data/tarot-data";

// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
  id?: string;
  email: string;
  dob?: string;
  isAdmin?: boolean;
}

interface ReadingSetup {
  category: string;
  question: string;
}

interface Reading extends ReadingSetup {
  id: string;
  cards: TarotCard[];
  summary: string;
  timestamp: number;
}

type Language = "EN" | "VI" | "ZH";

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  readingSetup: ReadingSetup | null;
  selectedCards: TarotCard[];
  language: Language;
  history: Reading[];

  login: (userData: any) => void;
  signup: (userData: any) => void;
  logout: () => void;
  setReadingSetup: (setup: ReadingSetup) => void;
  setSelectedCards: (cards: TarotCard[]) => void;
  addReadingToHistory: (reading: Omit<Reading, "id" | "timestamp">) => void;
  resetReading: () => void;
  setLanguage: (lang: Language) => void;
}

const AppContext = createContext<AppState | null>(null);

// ─── LocalStorage DB ─────────────────────────────────────────────────────────
const DB = {
  getHistory: (email: string): Reading[] => {
    try {
      const data = localStorage.getItem(`history_${email}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveHistory: (email: string, reading: Reading) => {
    try {
      const current = DB.getHistory(email);
      localStorage.setItem(`history_${email}`, JSON.stringify([reading, ...current].slice(0, 50)));
    } catch {
      // silently fail if localStorage is unavailable
    }
  },
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [readingSetup, setReadingSetupState] = useState<ReadingSetup | null>(null);
  const [selectedCards, setSelectedCardsState] = useState<TarotCard[]>([]);
  const [language, setLanguageState] = useState<Language>("EN");
  const [history, setHistory] = useState<Reading[]>([]);

  // Load history from localStorage when user changes
  useEffect(() => {
    if (user?.email) {
      setHistory(DB.getHistory(user.email));
    } else {
      setHistory([]);
    }
  }, [user]);

  const login = (userData: any) => {
    setIsAuthenticated(true);
    setUser({
      id: userData.id,
      email: userData.email,
      dob: userData.user_metadata?.date_of_birth || userData.dob,
      isAdmin: userData.email === "admin@fate-of-yours.com",
    });
  };

  const signup = (userData: any) => {
    setIsAuthenticated(true);
    setUser({
      id: userData.id,
      email: userData.email,
      dob: userData.user_metadata?.date_of_birth || userData.dob,
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setReadingSetupState(null);
    setSelectedCardsState([]);
  };

  const setReadingSetup = (setup: ReadingSetup) => setReadingSetupState(setup);
  const setSelectedCards = (cards: TarotCard[]) => setSelectedCardsState(cards);
  const setLanguage = (lang: Language) => setLanguageState(lang);

  const addReadingToHistory = (readingData: Omit<Reading, "id" | "timestamp">) => {
    if (!user?.email) return;
    const newReading: Reading = {
      ...readingData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    DB.saveHistory(user.email, newReading);
    setHistory((prev) => [newReading, ...prev]);
  };

  const resetReading = () => {
    setReadingSetupState(null);
    setSelectedCardsState([]);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated, user, readingSetup, selectedCards, language, history,
        login, signup, logout, setReadingSetup, setSelectedCards,
        addReadingToHistory, resetReading, setLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}