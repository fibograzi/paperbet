"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LimboPhase } from "./limboTypes";
import { formatResultNumber, getWinTier, isNearMiss, isExactHit } from "./limboEngine";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LimboResultDisplayProps {
  phase: LimboPhase;
  result: number | null;
  isWin: boolean | null;
  profit: number | null;
  targetMultiplier: number;
}

// ---------------------------------------------------------------------------
// Counter animation hook
// ---------------------------------------------------------------------------

function useCounterAnimation(
  phase: LimboPhase,
  result: number | null,
): string {
  const [displayValue, setDisplayValue] = useState("1.00");
  const rafRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === "animating") {
      // Rapid cycling random numbers during spin phase
      let tick = 0;
      intervalRef.current = setInterval(() => {
        tick++;
        // Bias toward realistic ranges
        const range = Math.random();
        let num: number;
        if (range < 0.5) num = 1 + Math.random() * 3;       // 1-4x common
        else if (range < 0.8) num = 1 + Math.random() * 10;  // 1-11x
        else if (range < 0.95) num = 1 + Math.random() * 50; // 1-51x
        else num = 1 + Math.random() * 200;                   // 1-201x rare
        setDisplayValue(num.toFixed(2));
      }, 50);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }

    if (phase === "result" && result !== null) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayValue(formatResultNumber(result));
    }

    if (phase === "idle" && result !== null) {
      setDisplayValue(formatResultNumber(result));
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, result]);

  return displayValue;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LimboResultDisplay({
  phase,
  result,
  isWin,
  profit,
  targetMultiplier,
}: LimboResultDisplayProps) {
  const [showProfit, setShowProfit] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const displayValue = useCounterAnimation(phase, result);

  // Stagger profit and badge after result
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

  // State flags
  const hasResult = result !== null && phase === "result";
  const isAnimating = phase === "animating";
  const isIdleNoResult = phase === "idle" && result === null;
  const isIdleWithResult = phase === "idle" && result !== null;

  // Win tier
  const winTier = hasResult && isWin && result !== null
    ? getWinTier(targetMultiplier, result)
    : null;
  const isMoonshot = winTier === "moonshot" || (result !== null && result >= 1000);
  const isJackpot = winTier === "jackpot" || isMoonshot;
  const isBigWin = winTier === "big" || isJackpot;

  // Near miss
  const nearMiss = hasResult && result !== null && isWin === false && isNearMiss(result, targetMultiplier);
  const exactHit = hasResult && result !== null && isWin === true && isExactHit(result, targetMultiplier);

  // Floor hit
  const isFloor = hasResult && result !== null && result <= 1.005;

  // Result color — near miss stays red, only 100x+ and moonshot override to gold
  const resultColor = isMoonshot
    ? "#F59E0B"
    : (hasResult && result !== null && result >= 100)
      ? "#F59E0B"
      : isWin === true
        ? "#00E5A0"
        : isWin === false
          ? "#EF4444"
          : "#6B7280";

  // Glow intensity based on result magnitude
  const getGlowStyle = () => {
    if (!hasResult || result === null) return {};
    if (result >= 100 || isMoonshot) return { textShadow: "0 0 30px rgba(245,158,11,0.5)" };
    if (result >= 50) return { textShadow: "0 0 24px rgba(245,158,11,0.3)" };
    if (result >= 10) return { textShadow: `0 0 20px ${isWin ? "rgba(0,229,160,0.35)" : "rgba(239,68,68,0.25)"}` };
    if (result >= 5) return { textShadow: `0 0 16px ${isWin ? "rgba(0,229,160,0.25)" : "rgba(239,68,68,0.15)"}` };
    if (result >= 2) return { textShadow: `0 0 12px ${isWin ? "rgba(0,229,160,0.15)" : "rgba(239,68,68,0.1)"}` };
    return {};
  };

  // Target line position — logarithmic scale across valid range
  const targetLinePosition = (() => {
    const logMin = Math.log(1.01);
    const logMax = Math.log(10000);
    const logTarget = Math.log(Math.max(1.01, targetMultiplier));
    const ratio = (logTarget - logMin) / (logMax - logMin); // 0=min, 1=max
    return Math.round(80 - ratio * 65); // maps to 15%–80% (top offset)
  })();

  return (
    <div
      className="limbo-result-display relative rounded-xl flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundColor: "#0B0F1A",
        border: "1px solid #374151",
        padding: "32px 24px",
        minHeight: 300,
        background: "radial-gradient(ellipse at center, #0B0F1A 0%, #0A0E18 100%)",
      }}
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(55,65,81,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(55,65,81,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Target line (visual reference) */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: `${targetLinePosition}%`,
          borderTop: "1px dashed rgba(245,158,11,0.3)",
        }}
      >
        <span
          className="absolute right-3 font-mono-stats"
          style={{
            fontSize: 11,
            color: "rgba(245,158,11,0.6)",
            top: -16,
          }}
        >
          Target: {targetMultiplier.toFixed(2)}x
        </span>
      </div>

      {/* Idle state — no previous result */}
      {isIdleNoResult && (
        <motion.p
          className="font-body font-semibold select-none z-10"
          style={{ fontSize: 24, color: "#6B7280" }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          PLACE YOUR BET
        </motion.p>
      )}

      {/* Animating state — cycling numbers */}
      {isAnimating && (
        <motion.div
          className="font-mono-stats font-bold z-10"
          style={{ color: "#9CA3AF" }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.1, repeat: Infinity }}
        >
          <span className="hidden md:inline" style={{ fontSize: 80 }}>
            {displayValue}
          </span>
          <span className="md:hidden" style={{ fontSize: 56 }}>
            {displayValue}
          </span>
          <span className="hidden md:inline" style={{ fontSize: 60, opacity: 0.6 }}>x</span>
          <span className="md:hidden" style={{ fontSize: 40, opacity: 0.6 }}>x</span>
        </motion.div>
      )}

      {/* Result display */}
      <AnimatePresence>
        {hasResult && result !== null && (
          <>
            {/* Big win glow */}
            {isBigWin && isWin && (
              <motion.div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  background: isMoonshot || isJackpot
                    ? "radial-gradient(circle, rgba(245,158,11,0.12), transparent 70%)"
                    : "radial-gradient(circle, rgba(0,229,160,0.08), transparent 70%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Edge glow */}
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none z-0"
              style={{
                boxShadow: isWin
                  ? "inset 0 0 40px rgba(0,229,160,0.08)"
                  : "inset 0 0 40px rgba(239,68,68,0.06)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />

            {/* Background flash */}
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none z-0"
              style={{
                backgroundColor: isWin ? "rgba(0,229,160,0.05)" : "rgba(239,68,68,0.05)",
              }}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Result number */}
            <motion.div
              key={`result-${result}-${profit}`}
              className="font-mono-stats font-bold z-10"
              style={{
                color: resultColor,
                ...getGlowStyle(),
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: [0.9, 1.1, 1], opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <span className="hidden md:inline" style={{ fontSize: 80 }}>
                {formatResultNumber(result)}
              </span>
              <span className="md:hidden" style={{ fontSize: 56 }}>
                {formatResultNumber(result)}
              </span>
              <span
                className="hidden md:inline"
                style={{
                  fontSize: 60,
                  opacity: 0.7,
                  color: resultColor,
                }}
              >
                x
              </span>
              <span
                className="md:hidden"
                style={{
                  fontSize: 40,
                  opacity: 0.7,
                  color: resultColor,
                }}
              >
                x
              </span>
            </motion.div>

            {/* Floor hit indicator */}
            {isFloor && (
              <motion.span
                className="text-xs font-body mt-1 z-10"
                style={{ color: "#6B7280" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Floor hit
              </motion.span>
            )}

            {/* Exact hit indicator */}
            {exactHit && (
              <motion.span
                className="text-sm font-body font-bold mt-1 z-10"
                style={{ color: "#F59E0B" }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: [0.8, 1.15, 1] }}
                transition={{ duration: 0.3 }}
              >
                EXACT HIT!
              </motion.span>
            )}

            {/* Near miss indicator */}
            {nearMiss && !isFloor && (
              <motion.span
                className="text-sm font-body font-bold mt-1 z-10"
                style={{ color: "#F59E0B" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.6], x: [-2, 2, -1, 1, 0] }}
                transition={{ duration: 0.4 }}
              >
                SO CLOSE!
              </motion.span>
            )}

            {/* Profit/loss display */}
            {showProfit && profit !== null && (
              <motion.p
                className="font-mono-stats font-bold mt-2 z-10"
                style={{
                  fontSize: isBigWin && isWin ? 28 : 24,
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
                className="font-body text-xs font-semibold uppercase tracking-wide mt-2 px-3 py-1 rounded-full z-10"
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

            {/* Good win label */}
            {winTier === "good" && showBadge && (
              <motion.span
                className="text-xs font-body font-semibold mt-1 z-10"
                style={{ color: "#00E5A0" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                NICE!
              </motion.span>
            )}

            {/* Big win label */}
            {winTier === "big" && showBadge && (
              <motion.span
                className="text-xs font-heading font-bold mt-1 z-10"
                style={{ color: "#00E5A0" }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: [0.8, 1.15, 1] }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                BIG WIN
              </motion.span>
            )}

            {/* Jackpot label */}
            {winTier === "jackpot" && !isMoonshot && showBadge && (
              <motion.span
                className="text-sm font-heading font-bold mt-1 z-10"
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

            {/* Moonshot label */}
            {isMoonshot && showBadge && (
              <motion.span
                className="text-sm font-heading font-bold mt-1 z-10"
                style={{
                  color: "#F59E0B",
                  textShadow: "0 0 16px rgba(245,158,11,0.6)",
                }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: [0.7, 1.3, 1] }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                TO THE MOON!
              </motion.span>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Previous result at low opacity (idle) */}
      {isIdleWithResult && result !== null && (
        <div className="font-mono-stats font-bold z-10" style={{ opacity: 0.5 }}>
          <span
            className="hidden md:inline"
            style={{ fontSize: 80, color: resultColor }}
          >
            {formatResultNumber(result)}
          </span>
          <span
            className="md:hidden"
            style={{ fontSize: 56, color: resultColor }}
          >
            {formatResultNumber(result)}
          </span>
          <span
            className="hidden md:inline"
            style={{ fontSize: 60, color: resultColor, opacity: 0.7 }}
          >
            x
          </span>
          <span
            className="md:hidden"
            style={{ fontSize: 40, color: resultColor, opacity: 0.7 }}
          >
            x
          </span>
        </div>
      )}

      {/* Screen reader announcement — always in DOM */}
      <div className="sr-only" aria-live="assertive" role="status">
        {hasResult && result !== null
          ? `Result: ${result.toFixed(2)}x. ${isWin ? `You won ${formatCurrency(profit ?? 0)}` : `You lost ${formatCurrency(Math.abs(profit ?? 0))}`}`
          : ""}
      </div>

      {/* Mobile padding adjustment */}
      <style>{`
        @media (max-width: 767px) {
          .limbo-result-display {
            min-height: 200px !important;
            padding: 20px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
