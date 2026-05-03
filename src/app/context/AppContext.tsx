import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { TarotCard } from "../data/tarot-data";

interface User {
  id?: string;
  email: string;
  dob?: string;
  status?: string;
  isAdmin?: boolean;
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

  login: (user: User) => void;
  signup: (user: User) => void;
  logout: () => void;
  setReadingSetup: (setup: ReadingSetup) => void;
  setSelectedCards: (cards: TarotCard[]) => void;
  addReadingToHistory: (reading: Omit<Reading, "id" | "timestamp">) => void;
  resetReading: () => void;
  setLanguage: (lang: Language) => void;
  banUser: (id: string) => void;
  deleteUser: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

import { DB } from "../lib/db";

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
      fetch(`http://localhost:5000/api/readings/${user.email}`)
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(err => {
          console.error("Failed to fetch history", err);
          setHistory([]);
        });
    } else {
      setHistory([]);
    }
  }, [user]);

  const login = (userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const signup = (userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setReadingSetupState(null);
    setSelectedCardsState([]);
  };

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/users")
      .then(res => res.json())
      .then(data => setAdminUsers(data))
      .catch(err => console.error("Failed to fetch users", err));
  }, [isAuthenticated]); // Refetch when someone logs in/registers so admin sees it if they navigate

  const [analytics] = useState({
    totalVisits: 12540,
    totalReadings: 0,
    readingTrends: []
  });

  const banUser = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/${id}/ban`, { method: 'PUT' });
      if (res.ok) {
        const fetchRes = await fetch("http://localhost:5000/api/auth/users");
        const data = await fetchRes.json();
        setAdminUsers(data);
      }
    } catch (err) {
      console.error("Failed to ban user", err);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAdminUsers(prev => prev.filter(u => u.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const setReadingSetup = (setup: ReadingSetup) => setReadingSetupState(setup);
  const setSelectedCards = (cards: TarotCard[]) => setSelectedCardsState(cards);
  const setLanguage = (lang: Language) => setLanguageState(lang);

  const addReadingToHistory = async (readingData: Omit<Reading, "id" | "timestamp">) => {
    if (!user) return;
    try {
      const payload = {
        email: user.email,
        category: readingData.category,
        question: readingData.question,
        cards: readingData.cards,
        summary: readingData.summary
      };
      
      const res = await fetch("http://localhost:5000/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setHistory(prev => [data.reading, ...prev]);
      }
    } catch (error) {
      console.error("Failed to save reading", error);
    }
  };

  const resetReading = () => {
    setReadingSetupState(null);
    setSelectedCardsState([]);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated, user, readingSetup, selectedCards, language, history,
        adminUsers, analytics, banUser, deleteUser,
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