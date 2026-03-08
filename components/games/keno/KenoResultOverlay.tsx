"use client";

import { motion } from "framer-motion";
import { getBadgeColor, getWinTier, formatKenoMultiplier } from "./kenoEngine";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface KenoResultOverlayProps {
  multiplier: number;
  profit: number;
  matchCount: number;
  picks: number;
}

// ---------------------------------------------------------------------------
// Win tier labels
// ---------------------------------------------------------------------------

const TIER_LABELS: Record<string, string | null> = {
  loss: null,
  micro: null,
  breakeven: null,
  small: "Nice!",
  good: "Great Win!",
  big: "BIG WIN!",
  epic: "EPIC WIN!",
  jackpot: "JACKPOT!",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function KenoResultOverlay({
  multiplier,
  profit,
  matchCount,
  picks,
}: KenoResultOverlayProps) {
  const tier = getWinTier(multiplier);
  const colors = getBadgeColor(multiplier);
  const isLoss = multiplier === 0;
  const isBigWin = multiplier >= 50;
  const isJackpot = multiplier >= 800;
  const tierLabel = TIER_LABELS[tier];

  const profitColor = profit > 0 ? "#00E5A0" : profit < 0 ? "#EF4444" : "#6B7280";
  const profitPrefix = profit > 0 ? "+" : "";

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          backgroundColor: isJackpot
            ? "rgba(245, 158, 11, 0.08)"
            : "rgba(0, 0, 0, 0.6)",
        }}
      />

      {/* Content */}
      <motion.div
        className="relative text-center"
        animate={
          isBigWin
            ? { scale: [1, 1.1, 1, 1.1, 1] }
            : undefined
        }
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Tier label */}
        {tierLabel && (
          <motion.p
            className="font-heading font-bold text-sm sm:text-base mb-1"
            style={{
              color: isJackpot ? "#F59E0B" : colors.bg,
              textShadow: isJackpot
                ? "0 0 20px rgba(245, 158, 11, 0.6)"
                : `0 0 12px ${colors.bg}80`,
            }}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {tierLabel}
          </motion.p>
        )}

        {/* Multiplier */}
        <motion.p
          className="font-mono-stats font-bold leading-none"
          style={{
            fontSize: isLoss ? "32px" : isBigWin ? "48px" : "40px",
            color: isLoss ? "#6B7280" : colors.bg,
            textShadow: isBigWin
              ? `0 0 24px ${colors.bg}80`
              : "none",
          }}
        >
          {formatKenoMultiplier(multiplier)}
        </motion.p>

        {/* Profit */}
        <motion.p
          className="font-mono-stats text-lg sm:text-xl mt-1"
          style={{
            color: profitColor,
            opacity: isLoss ? 0.6 : 1,
          }}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: isLoss ? 0.6 : 1 }}
          transition={{ delay: 0.15 }}
        >
          {profitPrefix}{formatCurrency(profit)}
        </motion.p>

        {/* Match summary */}
        <motion.p
          className="font-body text-xs sm:text-sm mt-1"
          style={{ color: "#9CA3AF" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {matchCount} / {picks} hit{matchCount !== 1 ? "s" : ""}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
