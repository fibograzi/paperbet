"use client";

import { motion } from "framer-motion";
import type { FlipPhase, FlipStreak } from "./flipTypes";
import {
  formatFlipMultiplier,
  formatFlipCurrency,
  getMultiplier,
  calculatePayout,
  MAX_FLIPS,
} from "./flipEngine";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FlipCashOutPanelProps {
  phase: FlipPhase;
  streak: FlipStreak | null;
  betAmount: number;
  onCashOut: () => void;
  onFlipAgain: () => void;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FlipCashOutPanel({
  phase,
  streak,
  betAmount,
  onCashOut,
  onFlipAgain,
  disabled = false,
}: FlipCashOutPanelProps) {
  if (phase !== "won" || !streak) return null;

  const currentPayout = calculatePayout(betAmount, streak.flips);
  const nextMultiplier = streak.flips < MAX_FLIPS ? getMultiplier(streak.flips + 1) : null;
  const atMaxFlips = streak.flips >= MAX_FLIPS;

  return (
    <motion.div
      className="flex gap-3 w-full max-w-[400px] mx-auto"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Cash Out button */}
      <button
        type="button"
        onClick={onCashOut}
        disabled={disabled}
        className={`
          flex flex-col items-center justify-center rounded-xl py-3 px-4
          transition-all hover:brightness-110 active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${atMaxFlips ? "flex-1" : "w-[45%]"}
        `}
        style={{
          backgroundColor: "#1F2937",
          border: "2px solid #00E5A0",
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              "rgba(0, 229, 160, 0.15)";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "#1F2937";
        }}
      >
        <span
          className="font-body text-sm font-bold"
          style={{ color: "#00E5A0" }}
        >
          Cash Out
        </span>
        <span
          className="font-mono-stats text-lg font-bold"
          style={{ color: "#00E5A0" }}
        >
          {formatFlipCurrency(currentPayout)}
        </span>
      </button>

      {/* Flip Again button (not shown at max flips) */}
      {!atMaxFlips && (
        <button
          type="button"
          onClick={onFlipAgain}
          disabled={disabled}
          className="w-[55%] flex flex-col items-center justify-center rounded-xl py-3 px-4 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flip-btn-pulse"
          style={{
            backgroundColor: "#00E5A0",
            boxShadow: "0 0 30px rgba(0, 229, 160, 0.3)",
          }}
        >
          <span
            className="font-body text-base font-bold"
            style={{ color: "#0B0F1A" }}
          >
            Flip Again
          </span>
          {nextMultiplier && (
            <span
              className="font-mono-stats text-sm"
              style={{ color: "#0B0F1A", opacity: 0.7 }}
            >
              &rarr; {formatFlipMultiplier(nextMultiplier)}
            </span>
          )}
        </button>
      )}
    </motion.div>
  );
}
