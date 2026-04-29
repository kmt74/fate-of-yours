import React, { createContext, useContext, useState, ReactNode } from "react";
import { TarotCard } from "../data/tarot-data";

interface User {
  email: string;
  dob: string;
}

interface ReadingSetup {
  category: string;
  question: string;
}

type Language = "EN" | "VI" | "ZH";

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  readingSetup: ReadingSetup | null;
  selectedCards: TarotCard[];
  language: Language;

  login: (email: string, password: string) => void;
  signup: (email: string, password: string, dob: string) => void;
  logout: () => void;
  setReadingSetup: (setup: ReadingSetup) => void;
  setSelectedCards: (cards: TarotCard[]) => void;
  resetReading: () => void;
  setLanguage: (lang: Language) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [readingSetup, setReadingSetupState] = useState<ReadingSetup | null>(null);
  const [selectedCards, setSelectedCardsState] = useState<TarotCard[]>([]);
  const [language, setLanguageState] = useState<Language>("EN");

  const login = (email: string, _password: string) => {
    setIsAuthenticated(true);
    setUser({ email, dob: "" });
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

  const setReadingSetup = (setup: ReadingSetup) => setReadingSetupState(setup);
  const setSelectedCards = (cards: TarotCard[]) => setSelectedCardsState(cards);
  const setLanguage = (lang: Language) => setLanguageState(lang);
  const resetReading = () => {
    setReadingSetupState(null);
    setSelectedCardsState([]);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated, user, readingSetup, selectedCards, language,
        login, signup, logout, setReadingSetup, setSelectedCards, resetReading, setLanguage,
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