"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HiLoCard from "./HiLoCard";
import HiLoReferenceCards from "./HiLoReferenceCards";
import HiLoCardTimeline from "./HiLoCardTimeline";
import type { HiLoGameState } from "./hiloTypes";
import {
  getPredictionInfo,
  formatHiLoMultiplier,
  getMultiplierColor,
  getMultiplierEffect,
  calculatePayout,
} from "./hiloEngine";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HiLoCardArenaProps {
  state: HiLoGameState;
}

// ---------------------------------------------------------------------------
// CountUp animated number display
// ---------------------------------------------------------------------------

function useCountUp(target: number, duration: number = 300) {
  const [display, setDisplay] = useState(target);
  const animationRef = useRef<number | null>(null);
  const startRef = useRef(target);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    startRef.current = display;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = startRef.current + (target - startRef.current) * eased;
      setDisplay(Math.round(current * 100) / 100);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(target);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}

// ---------------------------------------------------------------------------
// Win/Loss overlay
// ---------------------------------------------------------------------------

function ResultOverlay({
  type,
  amount,
}: {
  type: "win" | "loss" | "cashout" | "bigwin";
  amount: number;
}) {
  const isPositive = type === "win" || type === "cashout" || type === "bigwin";
  const isBigWin = type === "bigwin";
  const isCashout = type === "cashout";

  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Edge tint */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          boxShadow: isPositive
            ? "inset 0 0 60px rgba(0,229,160,0.12)"
            : "inset 0 0 60px rgba(239,68,68,0.12)",
        }}
      />

      {/* Big win glow particles */}
      {isBigWin && (
        <>
          <motion.div
            className="absolute w-32 h-32 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,229,160,0.2), transparent)" }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.8, 0.3],
            }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-48 h-48 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,229,160,0.1), transparent)" }}
            animate={{
              scale: [1.2, 1.8, 1.2],
              opacity: [0.3, 0.6, 0.2],
            }}
            transition={{ duration: 1.4, ease: "easeInOut", delay: 0.1 }}
          />
        </>
      )}

      {/* Floating amount text */}
      <motion.div
        className="relative z-10"
        initial={{ y: isPositive ? 10 : -10, opacity: 0, scale: 0.9 }}
        animate={{ y: isPositive ? -20 : 20, opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <span
          className="font-mono-stats font-bold"
          style={{
            fontSize: isCashout ? 32 : isBigWin ? 28 : 22,
            color: isPositive ? "#00E5A0" : "#EF4444",
            textShadow: isPositive
              ? "0 0 20px rgba(0,229,160,0.4)"
              : "0 0 20px rgba(239,68,68,0.4)",
          }}
        >
          {isPositive ? "+" : ""}
          {formatCurrency(amount)}
        </span>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Probability reminder
// ---------------------------------------------------------------------------

function ProbabilityReminder({ correctPredictions }: { correctPredictions: number }) {
  if (correctPredictions < 5) return null;

  return (
    <motion.p
      className="text-center mt-2"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      style={{ fontSize: 11, color: "#6B7280", maxWidth: 340, margin: "8px auto 0" }}
    >
      Each prediction is independent — past wins don&apos;t affect future odds.
    </motion.p>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function HiLoCardArena({ state }: HiLoCardArenaProps) {
  const { phase, round, config } = state;

  const cumulativeMultiplier = round?.cumulativeMultiplier ?? 1;
  const animatedMultiplier = useCountUp(cumulativeMultiplier, 300);
  const correctPredictions = round?.correctPredictions ?? 0;

  // Multiplier color and effects
  const multiplierColor = getMultiplierColor(cumulativeMultiplier);
  const effects = getMultiplierEffect(cumulativeMultiplier);
  const hasStarted = phase !== "idle" && round !== null;

  // Determine result overlay
  const overlay = useMemo(() => {
    if (phase === "lost" && round) {
      return { type: "loss" as const, amount: config.betAmount };
    }
    if (phase === "cashing_out" && round) {
      const payout = calculatePayout(config.betAmount, round.cumulativeMultiplier);
      const profit = payout - config.betAmount;
      const isBig = round.cumulativeMultiplier >= 10;
      return {
        type: isBig ? ("bigwin" as const) : ("cashout" as const),
        amount: profit,
      };
    }
    // Show brief win flash after correct prediction
    if (
      phase === "predicting" &&
      round &&
      round.predictions.length > 0 &&
      round.predictions[round.predictions.length - 1].correct === true
    ) {
      const lastPred = round.predictions[round.predictions.length - 1];
      const predMultiplier = lastPred.multiplier;
      const profitSoFar = calculatePayout(config.betAmount, round.cumulativeMultiplier) - config.betAmount;
      if (predMultiplier > 0) {
        return { type: "win" as const, amount: profitSoFar };
      }
    }
    return null;
  }, [phase, round, config.betAmount]);

  // Briefly show win overlay then hide
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);

    if (overlay) {
      setShowOverlay(true);
      // Keep loss/cashout overlays visible longer
      if (overlay.type === "win") {
        overlayTimerRef.current = setTimeout(() => setShowOverlay(false), 800);
      }
    } else {
      setShowOverlay(false);
    }

    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, [overlay]);

  // Card flipping state
  const isFlipping = phase === "revealing" || phase === "skipping";
  const isDealing = phase === "dealing";

  // Idle float animation for predicting phase
  const isPredicting = phase === "predicting";

  return (
    <div
      className="hilo-arena-inner relative rounded-xl overflow-hidden flex flex-col"
      style={{
        backgroundColor: "#0B0F1A",
        border: "1px solid #1F2937",
        minHeight: 480,
        padding: 32,
      }}
    >
      {/* Mobile padding adjustment */}
      <style>{`
        @media (max-width: 767px) {
          .hilo-arena-inner {
            min-height: 360px !important;
            padding: 20px !important;
          }
        }
        @keyframes hilo-idle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes hilo-reference-sway {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(1deg); }
          75% { transform: rotate(-1deg); }
        }
        .hilo-reference-sway {
          animation: hilo-reference-sway 4s ease-in-out infinite;
        }
      `}</style>

      {/* Result overlays */}
      <AnimatePresence>
        {showOverlay && overlay && (
          <ResultOverlay
            key={`overlay-${overlay.type}-${round?.predictions.length ?? 0}`}
            type={overlay.type}
            amount={overlay.amount}
          />
        )}
      </AnimatePresence>

      {/* Border flash for win/loss */}
      <AnimatePresence>
        {phase === "lost" && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none z-10"
            style={{ border: "2px solid #EF4444" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 1, 0] }}
            transition={{ duration: 1, times: [0, 0.1, 0.3, 0.5, 1] }}
          />
        )}
        {phase === "cashing_out" && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none z-10"
            style={{ border: "2px solid #00E5A0" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6, 1, 0.4] }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>

      {/* 1. Cumulative multiplier display (top, centered) */}
      <div className="flex justify-center mb-4">
        <motion.div
          key={cumulativeMultiplier}
          animate={
            effects.pulse
              ? { scale: [1, 1.08, 1] }
              : {}
          }
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="font-mono-stats font-bold text-center"
          style={{
            fontSize: 48,
            color: hasStarted ? multiplierColor : "#6B7280",
            textShadow: effects.glow
              ? `0 0 24px ${effects.glowColor}`
              : "none",
          }}
        >
          <span className="hidden md:inline" style={{ fontSize: 48 }}>
            {formatHiLoMultiplier(animatedMultiplier)}
          </span>
          <span className="md:hidden" style={{ fontSize: 32 }}>
            {formatHiLoMultiplier(animatedMultiplier)}
          </span>
        </motion.div>
      </div>

      {/* 2. Card display area (center, largest area) */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative flex items-center justify-center gap-4">
          {/* Reference cards + current card layout */}
          <HiLoReferenceCards />

          {/* Current card (centered over spacer on desktop, centered on mobile) */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              animation: isPredicting ? "hilo-idle-float 3s ease-in-out infinite" : "none",
            }}
          >
            {isDealing ? (
              <motion.div
                initial={{ scale: 0.7, opacity: 0, rotateY: 180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <HiLoCard card={null} showBack size="lg" />
              </motion.div>
            ) : round?.currentCard ? (
              <motion.div
                key={`card-${round.currentCard.index}-${round.predictions.length}`}
                initial={round.predictions.length > 0 ? { scale: 0.85, opacity: 0 } : {}}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <HiLoCard
                  card={round.currentCard}
                  isCurrent
                  isFlipping={isFlipping}
                  size="lg"
                />
              </motion.div>
            ) : (
              <HiLoCard card={null} showBack size="lg" />
            )}
          </div>
        </div>
      </div>

      {/* Probability reminder */}
      {isPredicting && (
        <ProbabilityReminder correctPredictions={correctPredictions} />
      )}

      {/* 3. Card history timeline (bottom) */}
      {round && round.predictions.length > 0 && (
        <div className="mt-4">
          <HiLoCardTimeline
            predictions={round.predictions}
            startCard={round.startCard}
          />
        </div>
      )}
    </div>
  );
}
