"use client";

import { ChevronUp, ChevronDown, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { HiLoPredictionInfo, Rank } from "./hiloTypes";
import {
  formatHiLoMultiplier,
  MAX_SKIPS_PER_ROUND,
  calculateProfit,
  calculatePayout,
} from "./hiloEngine";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HiLoActionButtonsProps {
  predictionInfo: HiLoPredictionInfo;
  cumulativeMultiplier: number;
  correctPredictions: number;
  betAmount: number;
  skipsUsed: number;
  currentRank: Rank;
  disabled: boolean;
  onHigher: () => void;
  onLower: () => void;
  onSkip: () => void;
  onCashOut: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HiLoActionButtons({
  predictionInfo,
  cumulativeMultiplier,
  correctPredictions,
  betAmount,
  skipsUsed,
  currentRank,
  disabled,
  onHigher,
  onLower,
  onSkip,
  onCashOut,
}: HiLoActionButtonsProps) {
  const skipsRemaining = MAX_SKIPS_PER_ROUND - skipsUsed;
  const hasStreak = correctPredictions >= 1;
  const cashOutPayout = calculatePayout(betAmount, cumulativeMultiplier);
  const cashOutProfit = calculateProfit(betAmount, cumulativeMultiplier);

  // Prospective multipliers (what cumulative would become)
  const higherCumulative =
    Math.round(cumulativeMultiplier * predictionInfo.higherMultiplier * 100) /
    100;
  const lowerCumulative =
    Math.round(cumulativeMultiplier * predictionInfo.lowerMultiplier * 100) /
    100;

  const isKing = currentRank === "K";
  const isAce = currentRank === "A";

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Edge case badges */}
      <AnimatePresence>
        {isKing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-body font-medium"
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              color: "#F59E0B",
              border: "1px solid rgba(245, 158, 11, 0.25)",
            }}
          >
            King — only Lower or Same available
          </motion.div>
        )}
        {isAce && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-body font-medium"
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              color: "#F59E0B",
              border: "1px solid rgba(245, 158, 11, 0.25)",
            }}
          >
            Ace — only Higher or Same available
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cash Out button — top, only after 1+ correct predictions */}
      <AnimatePresence>
        {hasStreak && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              type="button"
              onClick={onCashOut}
              disabled={disabled}
              animate={{ scale: [1, 1.01, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                height: 64,
                backgroundColor: "#00E5A0",
                boxShadow: "0 0 24px rgba(0, 229, 160, 0.25)",
              }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="flex items-center gap-2">
                  <span
                    className="font-body font-bold text-base"
                    style={{ color: "#0B0F1A" }}
                  >
                    Cash Out
                  </span>
                  <span
                    className="font-mono-stats font-bold text-xl"
                    style={{ color: "#0B0F1A" }}
                  >
                    {formatCurrency(cashOutPayout)}
                  </span>
                </div>
                <span
                  className="font-mono-stats text-xs"
                  style={{ color: "rgba(11, 15, 26, 0.7)" }}
                >
                  {formatHiLoMultiplier(cumulativeMultiplier)} multiplier
                </span>
              </div>
              {/* Keyboard hint */}
              <span
                className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono-stats"
                style={{
                  backgroundColor: "rgba(11, 15, 26, 0.15)",
                  color: "rgba(11, 15, 26, 0.5)",
                }}
              >
                C
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider — "or continue..." */}
      <AnimatePresence>
        {hasStreak && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 py-1"
          >
            <div className="flex-1 h-px bg-pb-border" />
            <span
              className="font-body text-[11px]"
              style={{ color: "#6B7280" }}
            >
              or continue...
            </span>
            <div className="flex-1 h-px bg-pb-border" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Higher or Same button — hidden when King */}
      <AnimatePresence>
        {!isKing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            <button
              type="button"
              onClick={onHigher}
              disabled={disabled}
              className="relative w-full rounded-[10px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                height: 56,
                backgroundColor: "rgba(0, 229, 160, 0.1)",
                border: "2px solid #00E5A0",
              }}
              onMouseEnter={(e) => {
                if (!disabled)
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "rgba(0, 229, 160, 0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "rgba(0, 229, 160, 0.1)";
              }}
            >
              <div className="flex items-center justify-between h-full px-4">
                <div className="flex items-center gap-2">
                  <ChevronUp size={20} color="#00E5A0" />
                  <span
                    className="font-body font-bold text-sm"
                    style={{ color: "#00E5A0" }}
                  >
                    Higher or Same
                  </span>
                </div>
                <span
                  className="font-mono-stats text-sm px-3 py-1 rounded-full"
                  style={{
                    color: "#00E5A0",
                    backgroundColor: "rgba(0, 229, 160, 0.15)",
                  }}
                >
                  {(predictionInfo.higherProbability * 100).toFixed(1)}%
                </span>
              </div>
              {/* Keyboard hint */}
              <span
                className="absolute top-1 right-1 px-1 py-0.5 rounded text-[9px] font-mono-stats"
                style={{ color: "rgba(0, 229, 160, 0.4)" }}
              >
                Q
              </span>
            </button>
            {/* Multiplier preview */}
            <div
              className="text-center mt-1 font-mono-stats text-xs"
              style={{ color: "#6B7280" }}
            >
              {formatHiLoMultiplier(predictionInfo.higherMultiplier)} →{" "}
              {formatHiLoMultiplier(higherCumulative)} cumulative
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lower or Same button — hidden when Ace */}
      <AnimatePresence>
        {!isAce && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            <button
              type="button"
              onClick={onLower}
              disabled={disabled}
              className="relative w-full rounded-[10px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                height: 56,
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "2px solid #EF4444",
              }}
              onMouseEnter={(e) => {
                if (!disabled)
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "rgba(239, 68, 68, 0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "rgba(239, 68, 68, 0.1)";
              }}
            >
              <div className="flex items-center justify-between h-full px-4">
                <div className="flex items-center gap-2">
                  <ChevronDown size={20} color="#EF4444" />
                  <span
                    className="font-body font-bold text-sm"
                    style={{ color: "#EF4444" }}
                  >
                    Lower or Same
                  </span>
                </div>
                <span
                  className="font-mono-stats text-sm px-3 py-1 rounded-full"
                  style={{
                    color: "#EF4444",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                  }}
                >
                  {(predictionInfo.lowerProbability * 100).toFixed(1)}%
                </span>
              </div>
              {/* Keyboard hint */}
              <span
                className="absolute top-1 right-1 px-1 py-0.5 rounded text-[9px] font-mono-stats"
                style={{ color: "rgba(239, 68, 68, 0.4)" }}
              >
                W
              </span>
            </button>
            {/* Multiplier preview */}
            <div
              className="text-center mt-1 font-mono-stats text-xs"
              style={{ color: "#6B7280" }}
            >
              {formatHiLoMultiplier(predictionInfo.lowerMultiplier)} →{" "}
              {formatHiLoMultiplier(lowerCumulative)} cumulative
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Card button — hidden at 0 skips remaining */}
      <AnimatePresence>
        {skipsRemaining > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            <button
              type="button"
              onClick={onSkip}
              disabled={disabled}
              className="relative w-full rounded-[10px] transition-all hover:text-pb-text-primary active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                height: 40,
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
              }}
              onMouseEnter={(e) => {
                if (!disabled)
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "#374151";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "#1F2937";
              }}
            >
              <div className="flex items-center justify-between h-full px-4">
                <div className="flex items-center gap-2">
                  <SkipForward size={16} color="#9CA3AF" />
                  <span
                    className="font-body text-[13px]"
                    style={{ color: "#9CA3AF" }}
                  >
                    Skip Card
                  </span>
                </div>
                <span
                  className="font-mono-stats text-[11px]"
                  style={{ color: "#6B7280" }}
                >
                  {skipsRemaining}/{MAX_SKIPS_PER_ROUND}
                </span>
              </div>
              {/* Keyboard hint */}
              <span
                className="absolute top-1 right-1 px-1 py-0.5 rounded text-[9px] font-mono-stats"
                style={{ color: "rgba(156, 163, 175, 0.4)" }}
              >
                E
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
