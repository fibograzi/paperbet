"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Gem } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TileVisualState = "default" | "selected" | "hit" | "miss" | "not_drawn_selected";

interface KenoTileProps {
  number: number;
  visualState: TileVisualState;
  disabled: boolean;
  onClick: (num: number) => void;
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const TILE_STYLES: Record<TileVisualState, {
  bg: string;
  shadow: string;
  textColor: string;
  border?: string;
}> = {
  default: {
    bg: "#1F2937",
    shadow: "0 3px 0 #374151",
    textColor: "#F9FAFB",
  },
  selected: {
    bg: "#A855F7",
    shadow: "0 3px 0 #7C3AED",
    textColor: "#FFFFFF",
  },
  hit: {
    bg: "#0B0F1A",
    shadow: "0 3px 0 #7C3AED, inset 0 0 0 3px #A855F7",
    textColor: "#00E5A0",
    border: "none",
  },
  miss: {
    bg: "#0B0F1A",
    shadow: "inset 0 3px 0 #000D14",
    textColor: "#EF4444",
  },
  not_drawn_selected: {
    bg: "#A855F7",
    shadow: "0 3px 0 #7C3AED",
    textColor: "#FFFFFF",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function KenoTileInner({ number, visualState, disabled, onClick }: KenoTileProps) {
  const style = TILE_STYLES[visualState];
  const isHit = visualState === "hit";
  const isMiss = visualState === "miss";
  const isRevealed = isHit || isMiss;
  const isInteractive = !disabled && !isRevealed;

  return (
    <motion.button
      type="button"
      onClick={() => isInteractive && onClick(number)}
      disabled={disabled && !isRevealed}
      className="relative flex flex-col items-center justify-center aspect-square rounded-lg font-mono-stats text-base sm:text-lg font-bold select-none"
      style={{
        backgroundColor: style.bg,
        boxShadow: style.shadow,
        color: style.textColor,
        opacity: isMiss ? 0.6 : 1,
        cursor: isInteractive ? "pointer" : "default",
        textShadow: "rgba(0, 0, 0, 0.15) 0 2px 2px",
        fontVariantNumeric: "lining-nums tabular-nums",
        minWidth: 44,
        minHeight: 44,
        transition: "background-color 150ms ease, box-shadow 150ms ease, opacity 150ms ease",
      }}
      whileHover={isInteractive ? {
        backgroundColor: visualState === "selected" ? "#C084FC" : "#374151",
        boxShadow: visualState === "selected"
          ? "0 4px 0 #9333EA"
          : "0 4px 0 #4B5563",
      } : undefined}
      whileTap={isInteractive ? { scale: 0.95 } : undefined}
      aria-checked={visualState === "selected" || visualState === "not_drawn_selected"}
      role="checkbox"
    >
      <span>{number}</span>
      {isHit && (
        <Gem
          className="absolute bottom-0.5 sm:bottom-1 w-4 h-4 sm:w-5 sm:h-5"
          style={{
            color: "#00E5A0",
            filter: "drop-shadow(0 0 6px rgba(0, 229, 160, 0.5))",
          }}
        />
      )}
    </motion.button>
  );
}

export default memo(KenoTileInner);
