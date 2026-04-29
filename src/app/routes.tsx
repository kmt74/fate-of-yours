import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { useApp } from "./context/AppContext";
import LandingPage from "./pages/LandingPage";
import SetupPage from "./pages/SetupPage";
import DeckPage from "./pages/DeckPage";
import ReadingPage from "./pages/ReadingPage";
import HistoryPage from "./pages/HistoryPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function SetupRoute() { return <ProtectedRoute><SetupPage /></ProtectedRoute>; }
function DeckRoute() { return <ProtectedRoute><DeckPage /></ProtectedRoute>; }
function ReadingRoute() { return <ProtectedRoute><ReadingPage /></ProtectedRoute>; }
function HistoryRoute() { return <ProtectedRoute><HistoryPage /></ProtectedRoute>; }

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/setup", Component: SetupRoute },
  { path: "/deck", Component: DeckRoute },
  { path: "/reading", Component: ReadingRoute },
  { path: "/history", Component: HistoryRoute },
  { path: "*", Component: () => <Navigate to="/" replace /> },
]);