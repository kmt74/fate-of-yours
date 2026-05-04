import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
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

interface AiInterpretation {
  interpretation: string;
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
  aiInterpretation: AiInterpretation | null;

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
  fetchAiInterpretation: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

import { DB } from "../lib/db";
import { getTarotReading } from "../../lib/ai";

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("fate_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("fate_user");
  });
  const [readingSetup, setReadingSetupState] = useState<ReadingSetup | null>(null);
  const [selectedCards, setSelectedCardsState] = useState<TarotCard[]>([]);
  const [language, setLanguageState] = useState<Language>("EN");
  const [history, setHistory] = useState<Reading[]>([]);
  const [aiInterpretation, setAiInterpretation] = useState<AiInterpretation | null>(null);
  const [isFetchingAi, setIsFetchingAi] = useState(false);

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
    localStorage.setItem("fate_user", JSON.stringify(userData));
  };

  const signup = (userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("fate_user", JSON.stringify(userData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setReadingSetupState(null);
    setSelectedCardsState([]);
    localStorage.removeItem("fate_user");
    sessionStorage.removeItem("isAdminAuthenticated");
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

  const addReadingToHistory = useCallback(async (readingData: Omit<Reading, "id" | "timestamp">) => {
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
  }, [user]);

  const resetReading = useCallback(() => {
    setReadingSetupState(null);
    setSelectedCardsState([]);
    setAiInterpretation(null);
  }, []);

  // Track the inputs of the last successful reading to avoid unnecessary re-fetches
  const [lastReadingInputs, setLastReadingInputs] = useState<{
    cardsKey: string;
    question: string;
    category: string;
    language: string;
  } | null>(null);

  const fetchAiInterpretation = useCallback(async () => {
    if (!readingSetup || selectedCards.length < 3 || isFetchingAi) return;
    
    const cardsKey = selectedCards.map(c => c.id).sort().join(",");
    const currentInputs = {
      cardsKey,
      question: readingSetup.question,
      category: readingSetup.category,
      language: language
    };

    // If inputs are identical to last successful reading, skip re-fetch
    if (
      aiInterpretation && 
      lastReadingInputs &&
      lastReadingInputs.cardsKey === currentInputs.cardsKey &&
      lastReadingInputs.question === currentInputs.question &&
      lastReadingInputs.category === currentInputs.category &&
      lastReadingInputs.language === currentInputs.language
    ) {
      return;
    }
    
    setIsFetchingAi(true);
    // Clear old interpretation immediately so UI shows loading/skeleton instead of previous answer
    setAiInterpretation(null); 
    
    try {
      const text = await getTarotReading(selectedCards, readingSetup.category, readingSetup.question, language);
      setAiInterpretation({ interpretation: text });
      setLastReadingInputs(currentInputs);
      
      // Save to history automatically
      if (user) {
        await addReadingToHistory({
          category: readingSetup.category,
          question: readingSetup.question,
          cards: selectedCards,
          summary: text
        });
      }
    } catch (err) {
      console.error("AI Fetch Error:", err);
      throw err;
    } finally {
      setIsFetchingAi(false);
    }
  }, [readingSetup, selectedCards, isFetchingAi, aiInterpretation, lastReadingInputs, language, user, addReadingToHistory]);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated, user, readingSetup, selectedCards, language, history,
        adminUsers, analytics, banUser, deleteUser,
        login, signup, logout, setReadingSetup, setSelectedCards, addReadingToHistory, resetReading, setLanguage,
        aiInterpretation, fetchAiInterpretation
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