"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DicePhase } from "./diceTypes";
import { formatDiceResult, getWinTier } from "./diceEngine";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DiceResultDisplayProps {
  phase: DicePhase;
  result: number | null;
  isWin: boolean | null;
  profit: number | null;
  multiplier: number;
  isOnTheLine: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DiceResultDisplay({
  phase,
  result,
  isWin,
  profit,
  multiplier,
  isOnTheLine,
}: DiceResultDisplayProps) {
  const [showProfit, setShowProfit] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  // Stagger profit and badge display after result
  useEffect(() => {
    setShowProfit(false);
    setShowBadge(false);

    if (phase === "result" && result !== null) {
      const profitTimer = setTimeout(() => setShowProfit(true), 100);
      const badgeTimer = setTimeout(() => setShowBadge(true), 200);
      return () => {
        clearTimeout(profitTimer);
        clearTimeout(badgeTimer);
      };
    }
  }, [phase, result]);

  // Result color
  const resultColor = isWin === true ? "#00E5A0" : isWin === false ? "#EF4444" : "#6B7280";

  // Win tier for celebrations
  const winTier = isWin && multiplier > 0 ? getWinTier(multiplier) : null;
  const isJackpot = winTier === "jackpot";
  const isBigWin = winTier === "big" || winTier === "huge" || isJackpot;

  const hasResult = result !== null && phase === "result";
  const isIdleNoResult = phase === "idle" && result === null;
  const isIdleWithResult = phase === "idle" && result !== null;

  return (
    <div
      className="dice-result-display relative rounded-xl flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundColor: "#0B0F1A",
        border: "1px solid #374151",
        padding: "24px",
        minHeight: 160,
      }}
    >
      {/* Idle state — no previous result */}
      {isIdleNoResult && (
        <motion.p
          className="font-body font-semibold select-none"
          style={{ fontSize: 20, color: "#6B7280" }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          ROLL THE DICE
        </motion.p>
      )}

      {/* Rolling state */}
      {phase === "rolling" && (
        <motion.div
          className="font-mono-stats font-bold"
          style={{ fontSize: 72, color: "#6B7280" }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 0.4, repeat: Infinity }}
        >
          <span className="hidden md:inline" style={{ fontSize: 72 }}>--.-​-</span>
          <span className="md:hidden" style={{ fontSize: 48 }}>--.-​-</span>
        </motion.div>
      )}

      {/* Result display */}
      <AnimatePresence>
        {hasResult && result !== null && (
          <>
            {/* Big win glow */}
            {isBigWin && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: isJackpot
                    ? "radial-gradient(circle, rgba(245,158,11,0.12), transparent 70%)"
                    : "radial-gradient(circle, rgba(0,229,160,0.08), transparent 70%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Edge glow for win/loss */}
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                boxShadow: isWin
                  ? "inset 0 0 40px rgba(0,229,160,0.08)"
                  : "inset 0 0 40px rgba(239,68,68,0.06)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />

            {/* Result number */}
            <motion.div
              key={`result-${result}-${profit}`}
              className="font-mono-stats font-bold"
              style={{
                color: isOnTheLine ? "#F59E0B" : resultColor,
                textShadow: `0 0 20px ${isJackpot ? "rgba(245,158,11,0.4)" : isWin ? "rgba(0,229,160,0.3)" : "rgba(239,68,68,0.2)"}`,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <span className="hidden md:inline" style={{ fontSize: 72 }}>
                {formatDiceResult(result)}
              </span>
              <span className="md:hidden" style={{ fontSize: 48 }}>
                {formatDiceResult(result)}
              </span>
            </motion.div>

            {/* On the line indicator */}
            {isOnTheLine && (
              <motion.span
                className="text-xs font-body font-semibold mt-1"
                style={{ color: "#F59E0B" }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                On the line!
              </motion.span>
            )}

            {/* Profit/loss display */}
            {showProfit && profit !== null && (
              <motion.p
                className="font-mono-stats font-bold mt-2"
                style={{
                  fontSize: 24,
                  color: isWin ? "#00E5A0" : "#EF4444",
                }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isWin ? "+" : ""}{formatCurrency(profit)}
              </motion.p>
            )}

            {/* WON/LOST badge */}
            {showBadge && (
              <motion.span
                className="font-body text-xs font-semibold uppercase tracking-wide mt-2 px-3 py-1 rounded-full"
                style={{
                  backgroundColor: isWin
                    ? "rgba(0,229,160,0.15)"
                    : "rgba(239,68,68,0.15)",
                  color: isWin ? "#00E5A0" : "#EF4444",
                  letterSpacing: "1px",
                }}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                {isWin ? "WON" : "LOST"}
              </motion.span>
            )}

            {/* Good win micro-text */}
            {winTier === "good" && showBadge && (
              <motion.span
                className="text-xs font-body font-semibold mt-1"
                style={{ color: "#00E5A0" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                +NICE!
              </motion.span>
            )}

            {/* Big/Huge win label */}
            {(winTier === "big" || winTier === "huge") && showBadge && (
              <motion.span
                className="text-xs font-heading font-bold mt-1"
                style={{ color: "#00E5A0" }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: [0.8, 1.15, 1] }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                BIG WIN
              </motion.span>
            )}

            {/* Jackpot label */}
            {isJackpot && showBadge && (
              <motion.span
                className="text-sm font-heading font-bold mt-1"
                style={{
                  color: "#F59E0B",
                  textShadow: "0 0 12px rgba(245,158,11,0.5)",
                }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: [0.7, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                JACKPOT!
              </motion.span>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Previous result at low opacity (idle with previous result) */}
      {isIdleWithResult && (
        <div className="font-mono-stats font-bold" style={{ opacity: 0.4 }}>
          <span
            className="hidden md:inline"
            style={{ fontSize: 72, color: resultColor }}
          >
            {formatDiceResult(result)}
          </span>
          <span
            className="md:hidden"
            style={{ fontSize: 48, color: resultColor }}
          >
            {formatDiceResult(result)}
          </span>
        </div>
      )}

      {/* Screen reader announcement */}
      {hasResult && result !== null && (
        <div className="sr-only" aria-live="assertive" role="status">
          Rolled {formatDiceResult(result)}.{" "}
          {isWin ? `You won ${formatCurrency(profit ?? 0)}` : `You lost ${formatCurrency(Math.abs(profit ?? 0))}`}
        </div>
      )}

      {/* Mobile padding adjustment */}
      <style>{`
        @media (max-width: 767px) {
          .dice-result-display {
            min-height: 120px !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
