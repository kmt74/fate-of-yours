import React from "react";

interface NavBarProps {
  onAdminLogin?: () => void;
}

export function NavBar({ onAdminLogin }: NavBarProps) {
  return (
    <nav
      id="Nav-Bar"
      style={{
        backgroundColor: "rgba(18, 18, 18, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(201, 168, 76, 0.2)",
      }}
      className="fixed top-0 left-0 right-0 z-50 w-full"
    >
      <div
        id="Nav-Inner"
        className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
      >
        {/* Brand Logo */}
        <div id="Brand-Logo" className="flex items-center gap-3">
          <div
            id="Logo-Icon"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #8B5CF6)",
              boxShadow: "0 0 16px rgba(139, 92, 246, 0.4)",
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z"
                fill="white"
                fillOpacity="0.95"
              />
            </svg>
          </div>
          <span
            id="Brand-Name"
            style={{
              fontFamily: "'Cinzel', serif",
              color: "#C9A84C",
              letterSpacing: "0.08em",
            }}
            className="text-lg"
          >
            ArcanaRead
          </span>
        </div>

        {/* Nav Links */}
        <div id="Nav-Links" className="flex items-center gap-8">
          <button
            id="Admin-Login"
            onClick={onAdminLogin}
            style={{
              fontFamily: "'Raleway', sans-serif",
              color: "rgba(226, 232, 240, 0.7)",
              letterSpacing: "0.04em",
              transition: "color 0.2s ease",
            }}
            className="text-sm hover:text-white bg-transparent border-none cursor-pointer"
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "#C9A84C")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color =
                "rgba(226, 232, 240, 0.7)")
            }
          >
            Admin Login
          </button>
        </div>
      </div>
    </nav>
  );
}
