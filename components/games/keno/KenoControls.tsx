"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Shuffle, Trash2, ChevronDown } from "lucide-react";
import type {
  KenoGameState,
  KenoAction,
  KenoAutoPlayConfig,
  KenoDifficulty,
  KenoAutoPlaySpeed,
} from "./kenoTypes";
import {
  MIN_BET,
  MAX_BET,
  MAX_PICKS,
  clampBet,
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
} from "./kenoEngine";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface KenoControlsProps {
  state: KenoGameState;
  dispatch: React.Dispatch<KenoAction>;
  onBet: () => void;
  onStartAutoPlay: (config: KenoAutoPlayConfig) => void;
  onStopAutoPlay: () => void;
}

// ---------------------------------------------------------------------------
// Difficulties
// ---------------------------------------------------------------------------

const DIFFICULTIES: KenoDifficulty[] = ["classic", "low", "medium", "high"];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function KenoControls({
  state,
  dispatch,
  onBet,
  onStartAutoPlay,
  onStopAutoPlay,
}: KenoControlsProps) {
  const { phase, betAmount, balance, difficulty, selectedNumbers, instantBet, autoPlay } = state;
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");
  const isIdle = phase === "idle";
  const isDrawing = phase === "drawing";
  const isAutoRunning = autoPlay.active;

  // Auto-play config local state
  const [autoNumberOfBets, setAutoNumberOfBets] = useState(100);
  const [autoSpeed, setAutoSpeed] = useState<KenoAutoPlaySpeed>("normal");
  const [onWinAction, setOnWinAction] = useState<"reset" | "increase_percent">("reset");
  const [onWinValue, setOnWinValue] = useState(100);
  const [onLossAction, setOnLossAction] = useState<"reset" | "increase_percent">("reset");
  const [onLossValue, setOnLossValue] = useState(100);
  const [stopOnProfitEnabled, setStopOnProfitEnabled] = useState(false);
  const [stopOnProfitAmount, setStopOnProfitAmount] = useState(10);
  const [stopOnLossEnabled, setStopOnLossEnabled] = useState(false);
  const [stopOnLossAmount, setStopOnLossAmount] = useState(10);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Bet input ref for hold-to-repeat
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearHold;
  }, [clearHold]);

  // -------------------------------------------------------------------------
  // Bet amount handlers
  // -------------------------------------------------------------------------

  const adjustBet = useCallback(
    (delta: number) => {
      dispatch({ type: "SET_BET_AMOUNT", amount: betAmount + delta });
    },
    [betAmount, dispatch],
  );

  const startHold = useCallback(
    (delta: number) => {
      adjustBet(delta);
      holdTimerRef.current = setInterval(() => adjustBet(delta), 100);
    },
    [adjustBet],
  );

  // -------------------------------------------------------------------------
  // Start auto-play
  // -------------------------------------------------------------------------

  const handleStartAuto = useCallback(() => {
    if (selectedNumbers.length === 0) return;
    if (balance < betAmount) return;

    const config: KenoAutoPlayConfig = {
      numberOfBets: autoNumberOfBets,
      speed: autoSpeed,
      onWinAction,
      onWinValue,
      onLossAction,
      onLossValue,
      stopOnProfit: stopOnProfitEnabled ? stopOnProfitAmount : null,
      stopOnLoss: stopOnLossEnabled ? stopOnLossAmount : null,
    };

    onStartAutoPlay(config);
  }, [
    selectedNumbers.length, balance, betAmount, autoNumberOfBets, autoSpeed,
    onWinAction, onWinValue, onLossAction, onLossValue,
    stopOnProfitEnabled, stopOnProfitAmount, stopOnLossEnabled, stopOnLossAmount,
    onStartAutoPlay,
  ]);

  // -------------------------------------------------------------------------
  // Bet button state
  // -------------------------------------------------------------------------

  const canBet = isIdle && selectedNumbers.length > 0 && balance >= betAmount && !isAutoRunning;
  const hasNoPicks = selectedNumbers.length === 0;

  let betButtonText = "Bet";
  let betButtonDisabled = !canBet;

  if (isDrawing) {
    betButtonText = "Drawing...";
    betButtonDisabled = true;
  } else if (hasNoPicks) {
    betButtonText = "Select Numbers";
    betButtonDisabled = true;
  } else if (balance < betAmount) {
    betButtonText = "Insufficient Balance";
    betButtonDisabled = true;
  }

  // -------------------------------------------------------------------------
  // Selection counter text
  // -------------------------------------------------------------------------

  let selectionText = "Select 1\u201310 numbers to play";
  if (selectedNumbers.length > 0 && selectedNumbers.length < MAX_PICKS) {
    selectionText = `${selectedNumbers.length} / ${MAX_PICKS} selected`;
  } else if (selectedNumbers.length === MAX_PICKS) {
    selectionText = "Maximum reached";
  }

  const selectionColor = selectedNumbers.length === MAX_PICKS ? "#A855F7" : "#6B7280";

  return (
    <div className="flex flex-col gap-3">
      {/* Balance display */}
      <div className="rounded-xl p-3" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
        <span className="font-body text-xs" style={{ color: "#6B7280" }}>Balance</span>
        <span className="font-mono-stats text-lg font-bold block" style={{ color: "#F9FAFB" }}>
          {formatCurrency(balance)}
        </span>
      </div>

      {/* Manual / Auto toggle */}
      <div className="rounded-lg p-1 flex" style={{ backgroundColor: "#1F2937" }}>
        {(["manual", "auto"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => !isAutoRunning && setActiveTab(tab)}
            className="flex-1 py-2 rounded-md text-center text-sm font-semibold transition-colors duration-150"
            style={{
              backgroundColor: activeTab === tab ? "#0B0F1A" : "transparent",
              color: activeTab === tab ? "#F9FAFB" : "#6B7280",
            }}
          >
            {tab === "manual" ? "Manual" : "Auto"}
          </button>
        ))}
      </div>

      {/* Bet Amount */}
      <div className="rounded-xl p-4" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
        <label className="font-body text-sm block mb-2" style={{ color: "#9CA3AF" }}>
          Bet Amount
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors"
            style={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
            onMouseDown={() => startHold(-0.10)}
            onMouseUp={clearHold}
            onMouseLeave={clearHold}
            disabled={!isIdle || betAmount <= MIN_BET}
          >
            <Minus size={14} style={{ color: "#9CA3AF" }} />
          </button>

          <div
            className="flex-1 rounded-lg px-3 py-2 flex items-center"
            style={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
          >
            <span className="text-sm mr-1" style={{ color: "#6B7280" }}>$</span>
            <input
              type="number"
              value={betAmount.toFixed(2)}
              onChange={(e) => dispatch({ type: "SET_BET_AMOUNT", amount: parseFloat(e.target.value) || 0 })}
              className="w-full bg-transparent font-mono-stats text-lg text-right outline-none"
              style={{ color: "#F9FAFB" }}
              min={MIN_BET}
              max={MAX_BET}
              step={0.10}
              disabled={!isIdle && !isAutoRunning}
            />
          </div>

          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors"
            style={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
            onMouseDown={() => startHold(0.10)}
            onMouseUp={clearHold}
            onMouseLeave={clearHold}
            disabled={!isIdle || betAmount >= MAX_BET}
          >
            <Plus size={14} style={{ color: "#9CA3AF" }} />
          </button>
        </div>

        {/* Quick-select row */}
        <div className="flex gap-1.5 mt-2">
          {[
            { label: "\u00BD", action: () => dispatch({ type: "SET_BET_AMOUNT", amount: betAmount / 2 }) },
            { label: "2\u00D7", action: () => dispatch({ type: "SET_BET_AMOUNT", amount: betAmount * 2 }) },
            { label: "Min", action: () => dispatch({ type: "SET_BET_AMOUNT", amount: MIN_BET }) },
            { label: "Max", action: () => dispatch({ type: "SET_BET_AMOUNT", amount: MAX_BET }) },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={btn.action}
              disabled={!isIdle && !isAutoRunning}
              className="flex-1 rounded-md py-1.5 text-xs font-body transition-colors hover:text-white"
              style={{ backgroundColor: "#1F2937", border: "1px solid #374151", color: "#9CA3AF" }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty selector */}
      <div className="rounded-xl p-4" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
        <label className="font-body text-sm block mb-2" style={{ color: "#9CA3AF" }}>
          Difficulty
        </label>
        <div className="rounded-lg p-1 flex gap-0.5" style={{ backgroundColor: "#1F2937" }}>
          {DIFFICULTIES.map((diff) => {
            const isActive = difficulty === diff;
            const color = DIFFICULTY_COLORS[diff];
            return (
              <button
                key={diff}
                type="button"
                onClick={() => dispatch({ type: "SET_DIFFICULTY", difficulty: diff })}
                disabled={!isIdle}
                className="flex-1 py-2 rounded-md text-center text-xs font-body font-semibold transition-colors duration-150"
                style={{
                  backgroundColor: isActive ? `${color}26` : "transparent",
                  color: isActive ? color : "#9CA3AF",
                }}
              >
                {DIFFICULTY_LABELS[diff]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Number selection controls */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "RANDOM_PICK" })}
          disabled={!isIdle}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-body transition-colors hover:text-white"
          style={{ backgroundColor: "#1F2937", border: "1px solid #374151", color: "#9CA3AF" }}
        >
          <Shuffle size={16} style={{ color: "#A855F7" }} />
          Random Pick
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "CLEAR_TABLE" })}
          disabled={!isIdle || selectedNumbers.length === 0}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-body transition-colors hover:text-red-400"
          style={{
            backgroundColor: "#1F2937",
            border: "1px solid #374151",
            color: "#9CA3AF",
            opacity: selectedNumbers.length === 0 ? 0.5 : 1,
            cursor: selectedNumbers.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          <Trash2 size={16} style={{ color: "#EF4444" }} />
          Clear
        </button>
      </div>

      {/* Selection counter */}
      <p className="font-body text-xs text-center" style={{ color: selectionColor }}>
        {selectionText}
      </p>

      {/* ===== MANUAL TAB ===== */}
      {activeTab === "manual" && !isAutoRunning && (
        <>
          {/* Bet button */}
          <motion.button
            type="button"
            onClick={onBet}
            disabled={betButtonDisabled}
            className="w-full py-3 rounded-[10px] font-body text-base font-bold transition-all"
            style={{
              backgroundColor: betButtonDisabled ? "#374151" : "#00E5A0",
              color: betButtonDisabled ? "#6B7280" : "#0B0F1A",
              boxShadow: betButtonDisabled ? "none" : "0 0 20px rgba(0,229,160,0.2)",
              cursor: betButtonDisabled ? "not-allowed" : "pointer",
            }}
            whileHover={!betButtonDisabled ? {
              backgroundColor: "#1AFFA8",
              boxShadow: "0 0 30px rgba(0,229,160,0.3)",
            } : undefined}
            whileTap={!betButtonDisabled ? { scale: 0.98 } : undefined}
          >
            {betButtonText}
          </motion.button>

          {/* Instant Bet toggle */}
          <label
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => dispatch({ type: "SET_INSTANT_BET", enabled: !instantBet })}
          >
            <div
              className="relative w-9 h-5 rounded-full transition-colors"
              style={{ backgroundColor: instantBet ? "#00E5A0" : "#374151" }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-150"
                style={{
                  backgroundColor: instantBet ? "#FFFFFF" : "#6B7280",
                  transform: instantBet ? "translateX(16px)" : "translateX(2px)",
                }}
              />
            </div>
            <span className="font-body text-xs" style={{ color: "#6B7280" }}>
              Instant Bet
            </span>
          </label>
        </>
      )}

      {/* ===== AUTO TAB ===== */}
      {activeTab === "auto" && (
        <>
          {isAutoRunning ? (
            <>
              {/* Auto-play running state */}
              <motion.button
                type="button"
                onClick={onStopAutoPlay}
                className="w-full py-3 rounded-[10px] font-body text-base font-bold"
                style={{ backgroundColor: "#EF4444", color: "#FFFFFF" }}
                whileHover={{ backgroundColor: "#DC2626" }}
                whileTap={{ scale: 0.98 }}
              >
                Stop Auto
              </motion.button>

              {/* Progress counter */}
              {autoPlay.progress && (
                <div className="rounded-lg p-3" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
                  <p className="font-body text-xs" style={{ color: "#9CA3AF" }}>
                    Round{" "}
                    <span className="font-mono-stats font-bold" style={{ color: "#F9FAFB" }}>
                      {autoPlay.progress.currentBet}
                    </span>
                    {" / "}
                    <span className="font-mono-stats" style={{ color: "#6B7280" }}>
                      {isFinite(autoPlay.progress.totalBets) ? autoPlay.progress.totalBets : "\u221E"}
                    </span>
                    {" \u2014 "}
                    <span style={{ color: "#00E5A0" }}>W:{autoPlay.progress.wins}</span>
                    {" | "}
                    <span style={{ color: "#EF4444" }}>L:{autoPlay.progress.losses}</span>
                    {" | Profit: "}
                    <span style={{ color: autoPlay.progress.sessionProfit >= 0 ? "#00E5A0" : "#EF4444" }}>
                      {autoPlay.progress.sessionProfit >= 0 ? "+" : ""}
                      {formatCurrency(autoPlay.progress.sessionProfit)}
                    </span>
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Number of rounds */}
              <div className="rounded-xl p-4" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
                <label className="font-body text-sm block mb-2" style={{ color: "#9CA3AF" }}>
                  Number of Rounds
                </label>
                <div className="flex gap-1">
                  {[10, 25, 50, 100, Infinity].map((n) => (
                    <button
                      key={String(n)}
                      type="button"
                      onClick={() => setAutoNumberOfBets(n)}
                      className="flex-1 py-2 rounded-md text-xs font-body font-semibold transition-colors"
                      style={{
                        backgroundColor: autoNumberOfBets === n ? "rgba(0,229,160,0.15)" : "transparent",
                        color: autoNumberOfBets === n ? "#00E5A0" : "#9CA3AF",
                      }}
                    >
                      {isFinite(n) ? n : "\u221E"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed */}
              <div className="rounded-xl p-4" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
                <label className="font-body text-sm block mb-2" style={{ color: "#9CA3AF" }}>
                  Speed
                </label>
                <div className="flex gap-1">
                  {(["normal", "fast", "turbo"] as KenoAutoPlaySpeed[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAutoSpeed(s)}
                      className="flex-1 py-2 rounded-md text-xs font-body font-semibold capitalize transition-colors"
                      style={{
                        backgroundColor: autoSpeed === s ? "rgba(0,229,160,0.15)" : "transparent",
                        color: autoSpeed === s ? "#00E5A0" : "#9CA3AF",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced settings (collapsible) */}
              <div className="rounded-xl" style={{ border: "1px solid #374151" }}>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full px-4 py-2.5 flex items-center justify-between"
                >
                  <span className="font-body text-sm" style={{ color: "#9CA3AF" }}>
                    Advanced
                  </span>
                  <ChevronDown
                    size={14}
                    style={{
                      color: "#6B7280",
                      transform: showAdvanced ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 200ms",
                    }}
                  />
                </button>

                {showAdvanced && (
                  <div className="px-4 pb-4 space-y-4">
                    {/* On Win */}
                    <div>
                      <span className="font-body text-xs font-semibold block mb-1.5" style={{ color: "#00E5A0" }}>
                        On Win
                      </span>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={onWinAction === "reset"}
                            onChange={() => setOnWinAction("reset")}
                            className="accent-[#00E5A0]"
                          />
                          <span className="font-body text-xs" style={{ color: "#9CA3AF" }}>
                            Reset to base bet
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={onWinAction === "increase_percent"}
                            onChange={() => setOnWinAction("increase_percent")}
                            className="accent-[#00E5A0]"
                          />
                          <span className="font-body text-xs" style={{ color: "#9CA3AF" }}>
                            Increase by
                          </span>
                          <input
                            type="number"
                            value={onWinValue}
                            onChange={(e) => setOnWinValue(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-16 rounded px-2 py-1 font-mono-stats text-xs text-right outline-none"
                            style={{ backgroundColor: "#1F2937", color: "#F9FAFB", border: "1px solid #374151" }}
                          />
                          <span className="text-xs" style={{ color: "#6B7280" }}>%</span>
                        </label>
                      </div>
                    </div>

                    {/* On Loss */}
                    <div>
                      <span className="font-body text-xs font-semibold block mb-1.5" style={{ color: "#EF4444" }}>
                        On Loss
                      </span>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={onLossAction === "reset"}
                            onChange={() => setOnLossAction("reset")}
                            className="accent-[#EF4444]"
                          />
                          <span className="font-body text-xs" style={{ color: "#9CA3AF" }}>
                            Reset to base bet
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={onLossAction === "increase_percent"}
                            onChange={() => setOnLossAction("increase_percent")}
                            className="accent-[#EF4444]"
                          />
                          <span className="font-body text-xs" style={{ color: "#9CA3AF" }}>
                            Increase by
                          </span>
                          <input
                            type="number"
                            value={onLossValue}
                            onChange={(e) => setOnLossValue(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-16 rounded px-2 py-1 font-mono-stats text-xs text-right outline-none"
                            style={{ backgroundColor: "#1F2937", color: "#F9FAFB", border: "1px solid #374151" }}
                          />
                          <span className="text-xs" style={{ color: "#6B7280" }}>%</span>
                        </label>
                      </div>
                    </div>

                    {/* Stop on profit */}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div
                          className="relative w-9 h-5 rounded-full transition-colors"
                          style={{ backgroundColor: stopOnProfitEnabled ? "#00E5A0" : "#374151" }}
                          onClick={() => setStopOnProfitEnabled(!stopOnProfitEnabled)}
                        >
                          <div
                            className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-150"
                            style={{
                              backgroundColor: stopOnProfitEnabled ? "#FFFFFF" : "#6B7280",
                              transform: stopOnProfitEnabled ? "translateX(16px)" : "translateX(2px)",
                            }}
                          />
                        </div>
                      </label>
                      <span className="font-body text-xs" style={{ color: "#9CA3AF" }}>
                        Stop if profit \u2265 $
                      </span>
                      <input
                        type="number"
                        value={stopOnProfitAmount}
                        onChange={(e) => setStopOnProfitAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-20 rounded px-2 py-1 font-mono-stats text-xs text-right outline-none"
                        style={{ backgroundColor: "#1F2937", color: "#F9FAFB", border: "1px solid #374151" }}
                        disabled={!stopOnProfitEnabled}
                      />
                    </div>

                    {/* Stop on loss */}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div
                          className="relative w-9 h-5 rounded-full transition-colors"
                          style={{ backgroundColor: stopOnLossEnabled ? "#EF4444" : "#374151" }}
                          onClick={() => setStopOnLossEnabled(!stopOnLossEnabled)}
                        >
                          <div
                            className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-150"
                            style={{
                              backgroundColor: stopOnLossEnabled ? "#FFFFFF" : "#6B7280",
                              transform: stopOnLossEnabled ? "translateX(16px)" : "translateX(2px)",
                            }}
                          />
                        </div>
                      </label>
                      <span className="font-body text-xs" style={{ color: "#9CA3AF" }}>
                        Stop if loss \u2265 $
                      </span>
                      <input
                        type="number"
                        value={stopOnLossAmount}
                        onChange={(e) => setStopOnLossAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-20 rounded px-2 py-1 font-mono-stats text-xs text-right outline-none"
                        style={{ backgroundColor: "#1F2937", color: "#F9FAFB", border: "1px solid #374151" }}
                        disabled={!stopOnLossEnabled}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Instant Bet toggle (auto mode) */}
              <label
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => dispatch({ type: "SET_INSTANT_BET", enabled: !instantBet })}
              >
                <div
                  className="relative w-9 h-5 rounded-full transition-colors"
                  style={{ backgroundColor: instantBet ? "#00E5A0" : "#374151" }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-150"
                    style={{
                      backgroundColor: instantBet ? "#FFFFFF" : "#6B7280",
                      transform: instantBet ? "translateX(16px)" : "translateX(2px)",
                    }}
                  />
                </div>
                <span className="font-body text-xs" style={{ color: "#6B7280" }}>
                  Instant Bet
                </span>
              </label>

              {/* Start Auto button */}
              <motion.button
                type="button"
                onClick={handleStartAuto}
                disabled={hasNoPicks || balance < betAmount}
                className="w-full py-3 rounded-[10px] font-body text-base font-bold transition-all"
                style={{
                  backgroundColor: hasNoPicks || balance < betAmount ? "#374151" : "#00E5A0",
                  color: hasNoPicks || balance < betAmount ? "#6B7280" : "#0B0F1A",
                  boxShadow: hasNoPicks || balance < betAmount ? "none" : "0 0 20px rgba(0,229,160,0.2)",
                  cursor: hasNoPicks || balance < betAmount ? "not-allowed" : "pointer",
                }}
                whileHover={!hasNoPicks && balance >= betAmount ? {
                  backgroundColor: "#1AFFA8",
                  boxShadow: "0 0 30px rgba(0,229,160,0.3)",
                } : undefined}
                whileTap={!hasNoPicks && balance >= betAmount ? { scale: 0.98 } : undefined}
              >
                Start Auto
              </motion.button>
            </>
          )}
        </>
      )}
    </div>
  );
}
