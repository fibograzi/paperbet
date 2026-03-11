"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { FlipPhase, FlipStreak } from "./flipTypes";
import {
  formatFlipMultiplier,
  getFlipMultiplierColor,
  getFlipWinTier,
  formatFlipCurrency,
  calculateProfit,
} from "./flipEngine";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FlipResultOverlayProps {
  phase: FlipPhase;
  streak: FlipStreak | null;
  betAmount: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FlipResultOverlay({
  phase,
  streak,
  betAmount,
}: FlipResultOverlayProps) {
  const isWon = phase === "won" || phase === "cashing_out";
  const isLost = phase === "lost";
  const showResult = (isWon || isLost) && streak;

  if (!showResult || !streak) return null;

  const flips = streak.flips;
  const multiplier = streak.currentMultiplier;
  const winTier = getFlipWinTier(flips);
  const color = isWon ? getFlipMultiplierColor(flips) : "#EF4444";
  const profit = isWon
    ? calculateProfit(betAmount, flips)
    : -betAmount;

  const shouldPulse = isWon && flips >= 4;
  const shouldGlow = isWon && flips >= 8;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`result-${phase}-${flips}`}
        className="flex flex-col items-center gap-1"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Multiplier */}
        {isWon && (
          <motion.div
            className={`font-mono-stats font-bold text-center leading-none ${
              shouldPulse ? "flip-multiplier-pulse" : ""
            }`}
            style={{
              fontSize: "clamp(36px, 8vw, 56px)",
              color,
              textShadow: shouldGlow
                ? `0 0 20px ${color}40, 0 0 40px ${color}20`
                : undefined,
            }}
            animate={
              shouldPulse
                ? {
                    scale: [1, 1.1, 1, 1.1, 1],
                    transition: { duration: 0.6, delay: 0.2 },
                  }
                : undefined
            }
          >
            {formatFlipMultiplier(multiplier)}
          </motion.div>
        )}

        {/* Profit */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="font-mono-stats text-xl text-center"
          style={{
            color: profit >= 0 ? "#00E5A0" : "#EF4444",
          }}
        >
          {profit >= 0 ? "+" : ""}
          {formatFlipCurrency(profit)}
        </motion.div>

        {/* Win tier badge for big wins */}
        {isWon && (winTier === "big" || winTier === "epic" || winTier === "jackpot") && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
            className="px-3 py-1 rounded-full text-xs font-body font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: `${color}20`,
              color,
              border: `1px solid ${color}40`,
            }}
          >
            {winTier === "jackpot"
              ? "JACKPOT!"
              : winTier === "epic"
                ? "EPIC WIN!"
                : "BIG WIN!"}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
