"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { BetType } from "@/lib/roulette/rouletteTypes";
import { formatCurrency } from "@/lib/utils";
import { useRouletteGame } from "./useRouletteGame";
import RouletteWheel from "./RouletteWheel";
import RouletteBettingTable from "./RouletteBettingTable";
import RouletteControls from "./RouletteControls";
import RouletteSidebar from "./RouletteSidebar";

// ---------------------------------------------------------------------------
// Win/Loss overlay
// ---------------------------------------------------------------------------

function ResultOverlay({
  isVisible,
  totalProfit,
  winningNumber,
  winningColor,
}: {
  isVisible: boolean;
  totalProfit: number;
  winningNumber: string;
  winningColor: string;
}) {
  const isWin = totalProfit > 0;
  const isLoss = totalProfit < 0;
  const accentColor = isWin ? "#00E5A0" : isLoss ? "#EF4444" : "#9CA3AF";
  const colorMap: Record<string, string> = {
    red: "#DC2626",
    black: "#374151",
    green: "#059669",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
        >
          <div
            className="rounded-2xl px-6 py-4 text-center shadow-2xl"
            style={{
              backgroundColor: "rgba(17,24,39,0.95)",
              border: `2px solid ${accentColor}`,
              boxShadow: `0 0 40px ${accentColor}33`,
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex items-center justify-center mb-2">
              <span
                className="inline-flex items-center justify-center rounded-full font-mono-stats font-bold text-xl w-12 h-12 shadow"
                style={{
                  backgroundColor: colorMap[winningColor] ?? "#374151",
                  color: "#FFFFFF",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                {winningNumber}
              </span>
            </div>
            <p className="font-heading font-bold text-2xl leading-none mb-1" style={{ color: accentColor }}>
              {isWin ? "Winner!" : isLoss ? "No Luck" : "Push"}
            </p>
            <p className="font-mono-stats text-sm font-semibold" style={{ color: accentColor }}>
              {isWin ? "+" : ""}
              {formatCurrency(totalProfit)}
            </p>
            {!isWin && !isLoss && (
              <p className="text-xs text-pb-text-muted mt-0.5">Bet returned</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Main game component
// ---------------------------------------------------------------------------

export default function RouletteGame() {
  const { state, dispatch, spin } = useRouletteGame();
  const [wheelSpinning, setWheelSpinning] = useState(false);

  const isSpinning = state.phase === "spinning";
  const isResult = state.phase === "result";
  const lastRound = state.history[0] ?? null;
  const showOverlay = isResult && lastRound !== null;

  // ---------------------------------------------------------------------------
  // Bet placement handler
  // ---------------------------------------------------------------------------

  const handlePlaceBet = useCallback(
    (betType: BetType, numbers: number[], label: string) => {
      if (state.phase !== "idle") return;
      dispatch({
        type: "PLACE_BET",
        bet: {
          type: betType,
          amount: state.selectedChipValue,
          numbers,
          label,
        },
      });
    },
    [state.phase, state.selectedChipValue, dispatch],
  );

  // ---------------------------------------------------------------------------
  // Spin handler
  // ---------------------------------------------------------------------------

  const handleSpin = useCallback(() => {
    if (state.phase !== "idle") return;
    if (state.currentBets.length === 0) return;
    setWheelSpinning(true);
    spin();
  }, [state.phase, state.currentBets.length, spin]);

  // ---------------------------------------------------------------------------
  // Wheel animation complete callback
  // ---------------------------------------------------------------------------

  const handleWheelSpinComplete = useCallback(() => {
    setWheelSpinning(false);
  }, []);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ------------------------------------------------------------------ */}
        {/* Left: Controls (desktop) */}
        {/* ------------------------------------------------------------------ */}
        <div className="hidden lg:block w-[300px] shrink-0">
          <div
            className="rounded-xl p-4 sticky top-4"
            style={{ backgroundColor: "#111827", border: "1px solid #374151" }}
          >
            <RouletteControls state={state} dispatch={dispatch} onSpin={handleSpin} />
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Center: Wheel + Table */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Mobile Controls */}
          <div className="lg:hidden">
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "#111827", border: "1px solid #374151" }}
            >
              <RouletteControls state={state} dispatch={dispatch} onSpin={handleSpin} />
            </div>
          </div>

          {/* Wheel area */}
          <div
            className="rounded-xl p-4 relative"
            style={{ backgroundColor: "#111827", border: "1px solid #374151" }}
          >
            <div className="flex justify-center">
              <RouletteWheel
                wheelType={state.wheelType}
                spinResult={state.spinResult}
                isSpinning={wheelSpinning || isSpinning}
                onSpinComplete={handleWheelSpinComplete}
              />
            </div>

            <ResultOverlay
              isVisible={showOverlay}
              totalProfit={lastRound?.totalProfit ?? 0}
              winningNumber={lastRound?.spinResult.pocket.label ?? ""}
              winningColor={lastRound?.spinResult.pocket.color ?? "black"}
            />
          </div>

          {/* Betting Table */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: "#111827", border: "1px solid #374151" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-sm font-semibold text-pb-text-primary">
                Betting Table
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-body text-pb-text-muted">
                  Chip: {formatCurrency(state.selectedChipValue)}
                </span>
                {state.currentBets.length > 0 && (
                  <span
                    className="text-[10px] font-mono-stats px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: "rgba(0,229,160,0.15)", color: "#00E5A0" }}
                  >
                    {state.currentBets.length} bet{state.currentBets.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
            <RouletteBettingTable
              onPlaceBet={handlePlaceBet}
              currentBets={state.currentBets}
              chipValue={state.selectedChipValue}
              wheelType={state.wheelType}
              disabled={isSpinning || isResult}
            />
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Right: Sidebar */}
        {/* ------------------------------------------------------------------ */}
        <div className="w-full lg:w-[320px] shrink-0">
          <RouletteSidebar state={state} dispatch={dispatch} />
        </div>
      </div>
    </div>
  );
}
