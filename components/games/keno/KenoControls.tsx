"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Shuffle, Trash2, ChevronDown, Zap } from "lucide-react";
import { useBetInput } from "@/lib/useBetInput";
import type {
  KenoGameState,
  KenoAction,
  KenoAutoPlayConfig,
  KenoDifficulty,
} from "./kenoTypes";
import {
  MIN_BET,
  MAX_BET,
  MAX_PICKS,
  clampBet,
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  AUTO_PLAY_MAX_CONSECUTIVE,
} from "./kenoEngine";
import { formatCurrency } from "@/lib/utils";
import BalanceBar from "@/components/shared/BalanceBar";

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
  const { phase, betAmount, balance, difficulty, selectedNumbers, instantBet, autoPlay, autoPlayPausedForWarning, speedMode } = state;
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");
  const isIdle = phase === "idle";
  const isDrawing = phase === "drawing";
  const isAutoRunning = autoPlay.active;

  // Auto-play config local state
  const [autoNumberOfBets, setAutoNumberOfBets] = useState(100);
  const [autoInfinityToggle, setAutoInfinityToggle] = useState(false);
  const [onWinAction, setOnWinAction] = useState<"reset" | "increase_percent">("reset");
  const [onWinValue, setOnWinValue] = useState(100);
  const [onLossAction, setOnLossAction] = useState<"reset" | "increase_percent">("reset");
  const [onLossValue, setOnLossValue] = useState(100);
  const [stopOnProfitEnabled, setStopOnProfitEnabled] = useState(false);
  const [stopOnProfitAmount, setStopOnProfitAmount] = useState(10);
  const [stopOnLossEnabled, setStopOnLossEnabled] = useState(false);
  const [stopOnLossAmount, setStopOnLossAmount] = useState(10);


  // Difficulty dropdown state
  const [difficultyDropdownOpen, setDifficultyDropdownOpen] = useState(false);
  const diffDropdownRef = useRef<HTMLDivElement>(null);

  // Close difficulty dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (diffDropdownRef.current && !diffDropdownRef.current.contains(e.target as Node)) {
        setDifficultyDropdownOpen(false);
      }
    }
    if (difficultyDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [difficultyDropdownOpen]);

  // -------------------------------------------------------------------------
  // Bet amount handlers
  // -------------------------------------------------------------------------

  const betInput = useBetInput(
    betAmount,
    (amount) => dispatch({ type: "SET_BET_AMOUNT", amount })
  );

  // -------------------------------------------------------------------------
  // Start auto-play
  // -------------------------------------------------------------------------

  const handleStartAuto = useCallback(() => {
    if (selectedNumbers.length === 0) return;
    if (balance < betAmount) return;

    const config: KenoAutoPlayConfig = {
      numberOfBets: autoInfinityToggle ? Infinity : autoNumberOfBets,
      onWinAction,
      onWinValue,
      onLossAction,
      onLossValue,
      stopOnProfit: stopOnProfitEnabled ? stopOnProfitAmount : null,
      stopOnLoss: stopOnLossEnabled ? stopOnLossAmount : null,
    };

    onStartAutoPlay(config);
  }, [
    selectedNumbers.length, balance, betAmount, autoInfinityToggle, autoNumberOfBets,
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
    betButtonText = "Bet";
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

  // -------------------------------------------------------------------------
  // Pick controls helper (shared between Manual and Auto tabs)
  // -------------------------------------------------------------------------

  const renderPickControls = () => (
    <>
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
          Clear Table
        </button>
      </div>

      <p className="font-body text-xs text-center" style={{ color: selectionColor }}>
        {selectionText}
      </p>
    </>
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Balance */}
      <BalanceBar balance={balance} onReset={() => dispatch({ type: "RESET_BALANCE" })} />

      {/* Manual / Auto toggle */}
      <div className="rounded-md p-0.5 flex" style={{ backgroundColor: "#1F2937" }}>
        {(["manual", "auto"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => !isAutoRunning && setActiveTab(tab)}
            className="flex-1 py-1.5 rounded-md text-center text-xs font-semibold transition-colors duration-150"
            style={{
              backgroundColor: activeTab === tab ? "#0B0F1A" : "transparent",
              color: activeTab === tab ? "#F9FAFB" : "#6B7280",
            }}
          >
            {tab === "manual" ? "Manual" : "Auto"}
          </button>
        ))}
      </div>

      {/* Bet Amount + Difficulty (merged card) */}
      <div className="rounded-lg p-3" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
        <label className="font-body text-[10px] uppercase tracking-wider block mb-1" style={{ color: "#9CA3AF" }}>
          Bet Amount
        </label>
        <div
          className="flex items-center rounded-md overflow-hidden"
          style={{ border: "1px solid #374151" }}
        >
          <div
            className="flex items-center flex-1 px-2.5 py-1.5"
            style={{ backgroundColor: "#1F2937" }}
          >
            <span className="font-mono-stats shrink-0 text-sm" style={{ color: "#6B7280" }}>$</span>
            <input
              suppressHydrationWarning
              type="text"
              inputMode="decimal"
              value={betInput.value}
              onChange={betInput.onChange}
              onFocus={betInput.onFocus}
              onBlur={betInput.onBlur}
              onKeyDown={betInput.onKeyDown}
              className="flex-1 bg-transparent font-mono-stats text-sm text-right outline-none"
              style={{ color: "#F9FAFB" }}
              disabled={!isIdle && !isAutoRunning}
              aria-label="Bet amount"
            />
          </div>
          <div className="w-px self-stretch" style={{ backgroundColor: "#374151" }} />
          <div className="flex items-center shrink-0" style={{ backgroundColor: "#263040" }}>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_BET_AMOUNT", amount: betAmount / 2 })}
              disabled={!isIdle && !isAutoRunning}
              className="px-2.5 py-1.5 font-body text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ color: "#9CA3AF" }}
            >
              &frac12;
            </button>
            <div className="w-px h-4 shrink-0" style={{ backgroundColor: "#374151" }} />
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_BET_AMOUNT", amount: betAmount * 2 })}
              disabled={!isIdle && !isAutoRunning}
              className="px-2.5 py-1.5 font-body text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ color: "#9CA3AF" }}
            >
              2&times;
            </button>
          </div>
        </div>

        {/* Difficulty dropdown */}
        <div className="mt-2.5">
          <label className="font-body text-[10px] uppercase tracking-wider block mb-1" style={{ color: "#9CA3AF" }}>
            Difficulty
          </label>
          <div className="relative" ref={diffDropdownRef}>
            <button
              type="button"
              onClick={() => isIdle && setDifficultyDropdownOpen(!difficultyDropdownOpen)}
              disabled={!isIdle}
              className="w-full flex items-center justify-between rounded-md py-1.5 px-2.5 text-xs transition-colors"
              style={{
                backgroundColor: "#1F2937",
                border: `1px solid ${difficultyDropdownOpen ? DIFFICULTY_COLORS[difficulty] : "#374151"}`,
                cursor: isIdle ? "pointer" : "not-allowed",
              }}
            >
              <span className="font-body text-xs font-semibold" style={{ color: DIFFICULTY_COLORS[difficulty] }}>
                {DIFFICULTY_LABELS[difficulty]}
              </span>
              <ChevronDown
                size={14}
                style={{
                  color: "#6B7280",
                  transform: difficultyDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 200ms",
                }}
              />
            </button>

            {difficultyDropdownOpen && (
              <div
                className="absolute left-0 right-0 mt-1 rounded-md py-1 z-50"
                style={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
              >
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => {
                      dispatch({ type: "SET_DIFFICULTY", difficulty: diff });
                      setDifficultyDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-body font-semibold transition-colors"
                    style={{
                      color: DIFFICULTY_COLORS[diff],
                      backgroundColor: difficulty === diff ? `${DIFFICULTY_COLORS[diff]}15` : "transparent",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${DIFFICULTY_COLORS[diff]}26`)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = difficulty === diff ? `${DIFFICULTY_COLORS[diff]}15` : "transparent")}
                  >
                    {DIFFICULTY_LABELS[diff]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MANUAL TAB ===== */}
      {activeTab === "manual" && !isAutoRunning && (
        <>
          {renderPickControls()}

          {/* Bet button — desktop only */}
          <div className="hidden lg:block">
            <motion.button
              type="button"
              onClick={onBet}
              disabled={betButtonDisabled}
              className="w-full h-9 rounded-lg font-body text-sm font-bold transition-all"
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
          </div>
        </>
      )}

      {/* ===== AUTO TAB ===== */}
      {activeTab === "auto" && (
        <>
          {isAutoRunning ? (
            <>
              {/* Auto-play running state — Stop button desktop only */}
              <div className="hidden lg:block">
                <motion.button
                  type="button"
                  onClick={onStopAutoPlay}
                  className="w-full h-9 rounded-lg font-body text-sm font-bold"
                  style={{ backgroundColor: "#EF4444", color: "#FFFFFF" }}
                  whileHover={{ backgroundColor: "#DC2626" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Stop Auto
                </motion.button>
              </div>

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
              {/* Number of Bets — input + ∞ toggle */}
              <div className="rounded-lg p-2.5" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
                <label className="font-body text-[10px] uppercase tracking-wider block mb-1" style={{ color: "#9CA3AF" }}>
                  Number of Bets
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 rounded-md py-1.5 px-2.5 flex items-center"
                    style={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
                  >
                    <input suppressHydrationWarning
                      type="number"
                      min={1}
                      max={AUTO_PLAY_MAX_CONSECUTIVE}
                      value={autoInfinityToggle ? "" : autoNumberOfBets}
                      placeholder={autoInfinityToggle ? "\u221E" : undefined}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 1;
                        setAutoNumberOfBets(Math.min(Math.max(1, v), AUTO_PLAY_MAX_CONSECUTIVE));
                      }}
                      disabled={autoInfinityToggle}
                      className="w-full bg-transparent font-mono-stats text-xs text-right outline-none placeholder:text-[#6B7280]"
                      style={{ color: "#F9FAFB" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoInfinityToggle(!autoInfinityToggle)}
                    className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-lg font-mono-stats font-bold transition-colors"
                    style={{
                      backgroundColor: autoInfinityToggle ? "rgba(0,229,160,0.15)" : "#1F2937",
                      border: `1px solid ${autoInfinityToggle ? "#00E5A0" : "#374151"}`,
                      color: autoInfinityToggle ? "#00E5A0" : "#6B7280",
                    }}
                    title="Infinite bets"
                  >
                    ∞
                  </button>
                </div>
              </div>

              {/* Speed mode selector */}
              <div className="bg-pb-bg-secondary border border-pb-border rounded-lg p-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Zap size={12} className="text-pb-text-muted" />
                  <span className="text-[10px] uppercase tracking-wider text-pb-text-muted">
                    Speed
                  </span>
                </div>
                <div className="flex gap-1 bg-pb-bg-tertiary rounded-lg p-1">
                  {([
                    { value: "normal", label: "Normal" },
                    { value: "quick", label: "Quick" },
                    { value: "instant", label: "Instant" },
                  ] as const).map((opt) => {
                    const active = speedMode === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => dispatch({ type: "SET_SPEED_MODE", mode: opt.value })}
                        className="flex-1 py-1.5 rounded-md text-xs font-heading font-semibold transition-all duration-150"
                        style={{
                          backgroundColor: active
                            ? opt.value === "instant"
                              ? "rgba(245, 158, 11, 0.15)"
                              : opt.value === "quick"
                                ? "rgba(0, 180, 216, 0.15)"
                                : "rgba(0, 229, 160, 0.15)"
                            : "transparent",
                          color: active
                            ? opt.value === "instant"
                              ? "#F59E0B"
                              : opt.value === "quick"
                                ? "#00B4D8"
                                : "#00E5A0"
                            : "#9CA3AF",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {speedMode !== "normal" && (
                  <p className="text-[10px] text-pb-text-muted mt-1.5">
                    {speedMode === "quick" ? "Faster rounds — reduced delays" : "Maximum speed — instant results"}
                  </p>
                )}
              </div>

              {/* On Win */}
              <div>
                <label
                  className="font-body text-xs block mb-1.5"
                  style={{ color: "#6B7280" }}
                >
                  On Win
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOnWinAction("reset")}
                    className="py-1.5 px-3 rounded-md text-xs font-body transition-colors whitespace-nowrap"
                    style={{
                      backgroundColor:
                        onWinAction === "reset"
                          ? "rgba(0, 229, 160, 0.15)"
                          : "#1F2937",
                      color: onWinAction === "reset" ? "#00E5A0" : "#9CA3AF",
                      border:
                        onWinAction === "reset"
                          ? "1px solid rgba(0, 229, 160, 0.3)"
                          : "1px solid #374151",
                    }}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnWinAction("increase_percent")}
                    className="py-1.5 px-3 rounded-md text-xs font-body transition-colors whitespace-nowrap"
                    style={{
                      backgroundColor:
                        onWinAction === "increase_percent"
                          ? "rgba(0, 229, 160, 0.15)"
                          : "#1F2937",
                      color: onWinAction === "increase_percent" ? "#00E5A0" : "#9CA3AF",
                      border:
                        onWinAction === "increase_percent"
                          ? "1px solid rgba(0, 229, 160, 0.3)"
                          : "1px solid #374151",
                    }}
                  >
                    Increase by:
                  </button>
                  <div className="relative flex-1">
                    <input suppressHydrationWarning
                      type="number"
                      min={1}
                      max={10000}
                      value={onWinValue}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1)
                          setOnWinValue(Math.min(10000, val));
                      }}
                      disabled={onWinAction !== "increase_percent"}
                      className="w-full rounded-lg py-1.5 pl-3 pr-8 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                      }}
                      aria-label="Increase on win percentage"
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: "#6B7280" }}
                    >
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* On Loss */}
              <div>
                <label
                  className="font-body text-xs block mb-1.5"
                  style={{ color: "#6B7280" }}
                >
                  On Loss
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOnLossAction("reset")}
                    className="py-1.5 px-3 rounded-md text-xs font-body transition-colors whitespace-nowrap"
                    style={{
                      backgroundColor:
                        onLossAction === "reset"
                          ? "rgba(239, 68, 68, 0.15)"
                          : "#1F2937",
                      color: onLossAction === "reset" ? "#EF4444" : "#9CA3AF",
                      border:
                        onLossAction === "reset"
                          ? "1px solid rgba(239, 68, 68, 0.3)"
                          : "1px solid #374151",
                    }}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnLossAction("increase_percent")}
                    className="py-1.5 px-3 rounded-md text-xs font-body transition-colors whitespace-nowrap"
                    style={{
                      backgroundColor:
                        onLossAction === "increase_percent"
                          ? "rgba(239, 68, 68, 0.15)"
                          : "#1F2937",
                      color: onLossAction === "increase_percent" ? "#EF4444" : "#9CA3AF",
                      border:
                        onLossAction === "increase_percent"
                          ? "1px solid rgba(239, 68, 68, 0.3)"
                          : "1px solid #374151",
                    }}
                  >
                    Increase by:
                  </button>
                  <div className="relative flex-1">
                    <input suppressHydrationWarning
                      type="number"
                      min={1}
                      max={10000}
                      value={onLossValue}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1)
                          setOnLossValue(Math.min(10000, val));
                      }}
                      disabled={onLossAction !== "increase_percent"}
                      className="w-full rounded-lg py-1.5 pl-3 pr-8 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                      }}
                      aria-label="Increase on loss percentage"
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: "#6B7280" }}
                    >
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Stop on Profit */}
              <div>
                <label className="flex items-center gap-2 mb-1.5 cursor-pointer">
                  <input suppressHydrationWarning
                    type="checkbox"
                    checked={stopOnProfitEnabled}
                    onChange={(e) =>
                      setStopOnProfitEnabled(e.target.checked)
                    }
                    className="w-3.5 h-3.5 rounded accent-pb-accent"
                  />
                  <span
                    className="font-body text-xs"
                    style={{ color: "#6B7280" }}
                  >
                    Stop on Profit
                  </span>
                </label>
                {stopOnProfitEnabled && (
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: "#6B7280" }}
                    >
                      $
                    </span>
                    <input suppressHydrationWarning
                      type="number"
                      min={1}
                      max={100000}
                      value={stopOnProfitAmount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val > 0)
                          setStopOnProfitAmount(
                            Math.round(val * 100) / 100
                          );
                      }}
                      className="w-full rounded-lg py-1.5 pl-7 pr-3 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50"
                      style={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                      }}
                      aria-label="Stop on profit amount"
                    />
                  </div>
                )}
              </div>

              {/* Stop on Loss */}
              <div>
                <label className="flex items-center gap-2 mb-1.5 cursor-pointer">
                  <input suppressHydrationWarning
                    type="checkbox"
                    checked={stopOnLossEnabled}
                    onChange={(e) =>
                      setStopOnLossEnabled(e.target.checked)
                    }
                    className="w-3.5 h-3.5 rounded accent-pb-accent"
                  />
                  <span
                    className="font-body text-xs"
                    style={{ color: "#6B7280" }}
                  >
                    Stop on Loss
                  </span>
                </label>
                {stopOnLossEnabled && (
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: "#6B7280" }}
                    >
                      $
                    </span>
                    <input suppressHydrationWarning
                      type="number"
                      min={1}
                      max={100000}
                      value={stopOnLossAmount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val > 0)
                          setStopOnLossAmount(
                            Math.round(val * 100) / 100
                          );
                      }}
                      className="w-full rounded-lg py-1.5 pl-7 pr-3 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50"
                      style={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                      }}
                      aria-label="Stop on loss amount"
                    />
                  </div>
                )}
              </div>

              {/* Pick controls */}
              {renderPickControls()}

              {/* 200-round responsible gambling warning */}
              {autoPlayPausedForWarning && (
                <div
                  className="rounded-lg px-2.5 py-1.5"
                  style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}
                >
                  <p className="font-body text-[10px]" style={{ color: "#F59E0B" }}>
                    Paused after 200 rounds. Review your session.
                  </p>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "DISMISS_AUTO_PLAY_WARNING" })}
                    className="text-[10px] mt-1 hover:underline"
                    style={{ color: "#9CA3AF" }}
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Start Autobet button — desktop only */}
              <div className="hidden lg:block">
                <motion.button
                  type="button"
                  onClick={handleStartAuto}
                  disabled={!isIdle || hasNoPicks || balance < betAmount}
                  className="w-full h-9 rounded-lg font-body text-sm font-bold transition-all"
                  style={{
                    backgroundColor: !isIdle || hasNoPicks || balance < betAmount ? "#374151" : "#00E5A0",
                    color: !isIdle || hasNoPicks || balance < betAmount ? "#6B7280" : "#0B0F1A",
                    boxShadow: !isIdle || hasNoPicks || balance < betAmount ? "none" : "0 0 20px rgba(0,229,160,0.2)",
                    cursor: !isIdle || hasNoPicks || balance < betAmount ? "not-allowed" : "pointer",
                  }}
                  whileHover={isIdle && !hasNoPicks && balance >= betAmount ? {
                    backgroundColor: "#1AFFA8",
                    boxShadow: "0 0 30px rgba(0,229,160,0.3)",
                  } : undefined}
                  whileTap={isIdle && !hasNoPicks && balance >= betAmount ? { scale: 0.98 } : undefined}
                >
                  Start Autobet
                </motion.button>
              </div>
            </>
          )}
        </>
      )}

      {/* Mobile: Fixed action bar */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pt-3 border-t border-pb-border"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          backgroundColor: "rgba(11, 15, 26, 0.95)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        {isAutoRunning ? (
          <button
            type="button"
            onClick={onStopAutoPlay}
            className="w-full h-11 rounded-lg bg-pb-danger text-white font-heading font-bold text-sm transition-all active:scale-[0.98]"
          >
            Stop (
            {autoPlay.progress?.currentBet ?? 0}
            {autoPlay.progress && isFinite(autoPlay.progress.totalBets)
              ? ` / ${autoPlay.progress.totalBets}`
              : ""}
            )
          </button>
        ) : activeTab === "manual" ? (
          <button
            type="button"
            onClick={onBet}
            disabled={betButtonDisabled}
            className="w-full h-11 rounded-lg font-heading font-bold text-sm transition-all active:scale-[0.98]"
            style={{
              backgroundColor: betButtonDisabled ? "#374151" : "#00E5A0",
              color: betButtonDisabled ? "#6B7280" : "#0B0F1A",
              cursor: betButtonDisabled ? "not-allowed" : "pointer",
            }}
          >
            {betButtonText}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStartAuto}
            disabled={!isIdle || hasNoPicks || balance < betAmount}
            className="w-full h-11 rounded-lg bg-pb-accent/15 text-pb-accent font-heading font-bold text-sm border border-pb-accent/30 transition-colors disabled:opacity-40"
          >
            Start Autobet
          </button>
        )}
      </div>
    </div>
  );
}
