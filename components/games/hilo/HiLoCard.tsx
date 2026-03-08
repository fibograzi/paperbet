"use client";

import { memo } from "react";
import type { PlayingCard } from "./hiloTypes";
import { SUIT_SYMBOLS } from "./hiloEngine";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HiLoCardProps {
  card: PlayingCard | null;
  isFlipping?: boolean;
  isCurrent?: boolean;
  showBack?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// ---------------------------------------------------------------------------
// Size config
// ---------------------------------------------------------------------------

const SIZE_CONFIG = {
  sm: {
    width: 88,
    height: 123,
    rankSize: 14,
    cornerSuitSize: 10,
    centerSuitSize: 28,
    padding: 6,
  },
  md: {
    width: 100,
    height: 140,
    rankSize: 16,
    cornerSuitSize: 12,
    centerSuitSize: 32,
    padding: 7,
  },
  lg: {
    width: 120,
    height: 168,
    rankSize: 18,
    cornerSuitSize: 14,
    centerSuitSize: 36,
    padding: 8,
  },
} as const;

// ---------------------------------------------------------------------------
// Card back pattern (diagonal lines at 10% opacity)
// ---------------------------------------------------------------------------

function CardBack({ size }: { size: "sm" | "md" | "lg" }) {
  const cfg = SIZE_CONFIG[size];

  return (
    <div
      className="absolute inset-0 rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #6366F1, #4F46E5)",
        border: "1px solid #6366F1",
        width: cfg.width,
        height: cfg.height,
      }}
    >
      {/* Diagonal line pattern */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.1 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="hilo-card-back-lines"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="8" stroke="#fff" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hilo-card-back-lines)" />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card face
// ---------------------------------------------------------------------------

function CardFace({
  card,
  size,
}: {
  card: PlayingCard;
  size: "sm" | "md" | "lg";
}) {
  const cfg = SIZE_CONFIG[size];
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const color = card.suitColor === "red" ? "#EF4444" : "#1F2937";

  return (
    <div
      className="absolute inset-0 rounded-xl flex flex-col justify-between font-mono-stats select-none"
      style={{
        backgroundColor: "#F9FAFB",
        border: "1px solid #374151",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        padding: cfg.padding,
        width: cfg.width,
        height: cfg.height,
        color,
      }}
    >
      {/* Top-left: rank + suit */}
      <div className="flex flex-col items-start leading-none">
        <span
          className="font-bold"
          style={{ fontSize: cfg.rankSize }}
        >
          {card.rank}
        </span>
        <span style={{ fontSize: cfg.cornerSuitSize }}>
          {suitSymbol}
        </span>
      </div>

      {/* Center suit */}
      <div className="flex items-center justify-center flex-1">
        <span style={{ fontSize: cfg.centerSuitSize, lineHeight: 1 }}>
          {suitSymbol}
        </span>
      </div>

      {/* Bottom-right: suit + rank (rotated 180°) */}
      <div
        className="flex flex-col items-end leading-none"
        style={{ transform: "rotate(180deg)" }}
      >
        <span
          className="font-bold"
          style={{ fontSize: cfg.rankSize }}
        >
          {card.rank}
        </span>
        <span style={{ fontSize: cfg.cornerSuitSize }}>
          {suitSymbol}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function HiLoCardInner({
  card,
  isFlipping = false,
  isCurrent = false,
  showBack = false,
  size = "lg",
  className = "",
}: HiLoCardProps) {
  const cfg = SIZE_CONFIG[size];
  const displayBack = showBack || !card;

  return (
    <div
      className={`hilo-card-container ${className}`}
      style={{
        width: cfg.width,
        height: cfg.height,
        perspective: 800,
      }}
      aria-label={
        displayBack
          ? "Face-down card"
          : card
            ? `${card.rank} of ${card.suit}`
            : "Card"
      }
    >
      <div
        className="hilo-card-inner"
        style={{
          width: cfg.width,
          height: cfg.height,
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 250ms ease-in-out",
          transform: isFlipping ? "rotateY(180deg)" : "rotateY(0deg)",
          ...(isCurrent
            ? {
                boxShadow: "0 0 20px rgba(99,102,241,0.25)",
                transform: isFlipping
                  ? "rotateY(180deg) scale(1.05)"
                  : "scale(1.05)",
                borderRadius: 12,
              }
            : {}),
        }}
      >
        {/* Front face */}
        <div
          className="hilo-card-face"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: 12,
          }}
        >
          {card ? (
            <CardFace card={card} size={size} />
          ) : (
            <CardBack size={size} />
          )}
        </div>

        {/* Back face (shown when flipped) */}
        <div
          className="hilo-card-back"
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: 12,
          }}
        >
          <CardBack size={size} />
        </div>
      </div>
    </div>
  );
}

const HiLoCard = memo(HiLoCardInner);
export default HiLoCard;
