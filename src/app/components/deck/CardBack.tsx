import React from "react";

export interface CardBackProps {
  width?: number;
  height?: number;
  glowColor?: string;
  elevated?: boolean;
  selected?: boolean;
  selectionNum?: number;
  compact?: boolean;
}

export function CardBack({
  width = 88,
  height = 138,
  glowColor = "rgba(139,92,246,0.3)",
  elevated = false,
  selected = false,
  selectionNum = 0,
  compact = false,
}: CardBackProps) {
  const w = compact ? Math.round(width * 0.65) : width;
  const h = compact ? Math.round(height * 0.65) : height;
  const radius = compact ? 6 : 9;

  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{
        width: `${w}px`,
        height: `${h}px`,
        borderRadius: `${radius}px`,
        background: selected
          ? "linear-gradient(145deg, #2A1D4A 0%, #1E1235 100%)"
          : "linear-gradient(145deg, #161628 0%, #10101E 100%)",
        border: `${selected ? "1.5px" : "1px"} solid ${
          selected
            ? "#C9A84C"
            : elevated
              ? "rgba(139,92,246,0.5)"
              : "rgba(201,168,76,0.12)"
        }`,
        boxShadow: selected
          ? `0 0 18px rgba(201,168,76,0.4), 0 ${elevated ? 12 : 4}px 24px rgba(0,0,0,0.6)`
          : elevated
            ? `0 0 14px ${glowColor}, 0 10px 28px rgba(0,0,0,0.7)`
            : "0 2px 8px rgba(0,0,0,0.5)",
        transition: "box-shadow 0.25s ease, border-color 0.25s ease",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg, rgba(139,92,246,0.07) 0px, rgba(139,92,246,0.07) 1px,
            transparent 1px, transparent ${compact ? 6 : 9}px
          )`,
        }}
        aria-hidden="true"
      />

      <div
        className="absolute"
        style={{
          inset: `${compact ? 3 : 5}px`,
          border: `0.5px solid rgba(201,168,76,${selected ? "0.3" : "0.1"})`,
          borderRadius: `${compact ? 4 : 6}px`,
          transition: "border-color 0.25s",
        }}
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="select-none leading-none"
          style={{
            fontSize: `${compact ? 10 : 16}px`,
            color: selected
              ? "rgba(201,168,76,0.7)"
              : "rgba(139,92,246,0.35)",
          }}
          aria-hidden="true"
        >
          ✦
        </span>
      </div>

      {!compact && (
        <>
          <div className="absolute left-2.5 top-2.5 h-3 w-3" style={{ borderTop: "1px solid rgba(201,168,76,0.2)", borderLeft: "1px solid rgba(201,168,76,0.2)", borderRadius: "2px 0 0 0" }} />
          <div className="absolute right-2.5 top-2.5 h-3 w-3" style={{ borderTop: "1px solid rgba(201,168,76,0.2)", borderRight: "1px solid rgba(201,168,76,0.2)", borderRadius: "0 2px 0 0" }} />
          <div className="absolute bottom-2.5 left-2.5 h-3 w-3" style={{ borderBottom: "1px solid rgba(201,168,76,0.2)", borderLeft: "1px solid rgba(201,168,76,0.2)", borderRadius: "0 0 0 2px" }} />
          <div className="absolute bottom-2.5 right-2.5 h-3 w-3" style={{ borderBottom: "1px solid rgba(201,168,76,0.2)", borderRight: "1px solid rgba(201,168,76,0.2)", borderRadius: "0 0 2px 0" }} />
        </>
      )}

      {selected && (
        <div
          className="absolute flex items-center justify-center rounded-full font-bold"
          style={{
            top: compact ? "4px" : "6px",
            right: compact ? "4px" : "6px",
            width: compact ? "14px" : "18px",
            height: compact ? "14px" : "18px",
            background: "#C9A84C",
            fontSize: compact ? "7px" : "9px",
            color: "#0A0A12",
            boxShadow: "0 0 8px rgba(201,168,76,0.5)",
          }}
        >
          {selectionNum}
        </div>
      )}
    </div>
  );
}
