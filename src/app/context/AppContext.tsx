import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { TarotCard } from "../data/tarot-data";

interface User {
  email: string;
  dob: string;
}

interface ReadingSetup {
  category: string;
  question: string;
}

interface Reading extends ReadingSetup {
  id: string;
  cards: TarotCard[];
  timestamp: number;
}

type Language = "EN" | "VI" | "ZH";

interface AdminUser {
  id: string;
  email: string;
  joinDate: string;
  status: string;
}

interface Analytics {
  totalVisits: number;
  totalReadings: number;
  readingTrends: { day: string; count: number }[];
}

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  readingSetup: ReadingSetup | null;
  selectedCards: TarotCard[];
  language: Language;
  history: Reading[];
  adminUsers: AdminUser[];
  analytics: Analytics;

  login: (email: string, password: string) => void;
  signup: (email: string, password: string, dob: string) => void;
  logout: () => void;
  setReadingSetup: (setup: ReadingSetup) => void;
  setSelectedCards: (cards: TarotCard[]) => void;
  addReadingToHistory: (reading: Omit<Reading, "id" | "timestamp">) => void;
  resetReading: () => void;
  setLanguage: (lang: Language) => void;
  banUser: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

import { DB } from "../lib/db";

const DB_LOCAL = {
  getHistory: (email: string): Reading[] => {
    const data = localStorage.getItem(`history_${email}`);
    return data ? JSON.parse(data) : [];
  },
  saveHistory: (email: string, reading: Reading) => {
    const current = DB_LOCAL.getHistory(email);
    localStorage.setItem(`history_${email}`, JSON.stringify([reading, ...current]));
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [readingSetup, setReadingSetupState] = useState<ReadingSetup | null>(null);
  const [selectedCards, setSelectedCardsState] = useState<TarotCard[]>([]);
  const [language, setLanguageState] = useState<Language>("EN");
  const [history, setHistory] = useState<Reading[]>([]);

  useEffect(() => {
    DB.recordVisit();
    if (user) {
      setHistory(DB_LOCAL.getHistory(user.email));
    } else {
      setHistory([]);
    }
  }, [user]);

  const ADMIN_EMAIL = "admin@fate-of-yours.com";

  const login = (email: string, _password: string) => {
    setIsAuthenticated(true);
    if (email === ADMIN_EMAIL) {
      setUser({ email, dob: "1990-01-01", isAdmin: true });
    } else {
      setUser({ email, dob: "" });
    }
  };

  const signup = (email: string, _password: string, dob: string) => {
    setIsAuthenticated(true);
    setUser({ email, dob });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setReadingSetupState(null);
    setSelectedCardsState([]);
  };

  const [adminUsers, setAdminUsers] = useState(DB.getUsers());
  const [analytics] = useState({
    totalVisits: 12540,
    totalReadings: 8420,
    readingTrends: []
  });

  const banUser = (id: string) => {
    DB.banUser(id);
    setAdminUsers(DB.getUsers());
  };

  const setReadingSetup = (setup: ReadingSetup) => setReadingSetupState(setup);
  const setSelectedCards = (cards: TarotCard[]) => setSelectedCardsState(cards);
  const setLanguage = (lang: Language) => setLanguageState(lang);

  const addReadingToHistory = (readingData: Omit<Reading, "id" | "timestamp">) => {
    if (!user) return;
    const newReading: Reading = {
      ...readingData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    DB_LOCAL.saveHistory(user.email, newReading);
    DB.addReading(user.email, readingData.category || 'general');
    setHistory(prev => [newReading, ...prev]);
  };

  const resetReading = () => {
    setReadingSetupState(null);
    setSelectedCardsState([]);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated, user, readingSetup, selectedCards, language, history,
        adminUsers, analytics, banUser,
        login, signup, logout, setReadingSetup, setSelectedCards, addReadingToHistory, resetReading, setLanguage,
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