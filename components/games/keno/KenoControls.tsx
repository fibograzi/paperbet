"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Shuffle, Trash2, ChevronDown } from "lucide-react";
import { useBetInput } from "@/lib/useBetInput";
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
  const { phase, betAmount, balance, difficulty, selectedNumbers, instantBet, autoPlay, autoPlayPausedForWarning } = state;
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");
  const isIdle = phase === "idle";
  const isDrawing = phase === "drawing";
  const isAutoRunning = autoPlay.active;

  // Auto-play config local state
  const [autoNumberOfBets, setAutoNumberOfBets] = useState(100);
  const [autoInfinityToggle, setAutoInfinityToggle] = useState(false);
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
    selectedNumbers.length, balance, betAmount, autoInfinityToggle, autoNumberOfBets, autoSpeed,
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
    <div className="flex flex-col gap-3">
      {/* Balance */}
      <BalanceBar balance={balance} onReset={() => dispatch({ type: "RESET_BALANCE" })} />

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
        <div
          className="flex items-center rounded-lg overflow-hidden"
          style={{ border: "1px solid #374151" }}
        >
          <div
            className="flex items-center flex-1 px-3 py-2.5"
            style={{ backgroundColor: "#1F2937" }}
          >
            <span className="font-mono-stats shrink-0" style={{ color: "#6B7280", fontSize: 18 }}>$</span>
            <input
              suppressHydrationWarning
              type="text"
              inputMode="decimal"
              value={betInput.value}
              onChange={betInput.onChange}
              onFocus={betInput.onFocus}
              onBlur={betInput.onBlur}
              onKeyDown={betInput.onKeyDown}
              className="flex-1 bg-transparent font-mono-stats text-right outline-none"
              style={{ fontSize: 18, color: "#F9FAFB" }}
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
              className="px-3 py-2.5 font-body text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ color: "#9CA3AF" }}
            >
              &frac12;
            </button>
            <div className="w-px h-4 shrink-0" style={{ backgroundColor: "#374151" }} />
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_BET_AMOUNT", amount: betAmount * 2 })}
              disabled={!isIdle && !isAutoRunning}
              className="px-3 py-2.5 font-body text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ color: "#9CA3AF" }}
            >
              2&times;
            </button>
          </div>
        </div>
      </div>

      {/* Difficulty dropdown */}
      <div className="rounded-xl p-4" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
        <label className="font-body text-sm block mb-2" style={{ color: "#9CA3AF" }}>
          Difficulty
        </label>
        <div className="relative" ref={diffDropdownRef}>
          <button
            type="button"
            onClick={() => isIdle && setDifficultyDropdownOpen(!difficultyDropdownOpen)}
            disabled={!isIdle}
            className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors"
            style={{
              backgroundColor: "#1F2937",
              border: `1px solid ${difficultyDropdownOpen ? DIFFICULTY_COLORS[difficulty] : "#374151"}`,
              cursor: isIdle ? "pointer" : "not-allowed",
            }}
          >
            <span className="font-body text-sm font-semibold" style={{ color: DIFFICULTY_COLORS[difficulty] }}>
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
              className="absolute left-0 right-0 mt-1 rounded-lg py-1 z-50"
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
                  className="w-full text-left px-3 py-2 text-sm font-body font-semibold transition-colors"
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

      {/* ===== MANUAL TAB ===== */}
      {activeTab === "manual" && !isAutoRunning && (
        <>
          {renderPickControls()}

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
              {/* Number of Bets — input + ∞ toggle */}
              <div className="rounded-xl p-4" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
                <label className="font-body text-sm block mb-2" style={{ color: "#9CA3AF" }}>
                  Number of Bets
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 rounded-lg px-3 py-2 flex items-center"
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
                      className="w-full bg-transparent font-mono-stats text-lg text-right outline-none placeholder:text-[#6B7280]"
                      style={{ color: "#F9FAFB" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoInfinityToggle(!autoInfinityToggle)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg font-mono-stats font-bold transition-colors"
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
                          <input suppressHydrationWarning
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
                          <input suppressHydrationWarning
                            type="radio"
                            checked={onWinAction === "increase_percent"}
                            onChange={() => setOnWinAction("increase_percent")}
                            className="accent-[#00E5A0]"
                          />
                          <span className="font-body text-xs" style={{ color: "#9CA3AF" }}>
                            Increase by
                          </span>
                          <input suppressHydrationWarning
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
                          <input suppressHydrationWarning
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
                          <input suppressHydrationWarning
                            type="radio"
                            checked={onLossAction === "increase_percent"}
                            onChange={() => setOnLossAction("increase_percent")}
                            className="accent-[#EF4444]"
                          />
                          <span className="font-body text-xs" style={{ color: "#9CA3AF" }}>
                            Increase by
                          </span>
                          <input suppressHydrationWarning
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
                        Stop if profit ≥ $
                      </span>
                      <input suppressHydrationWarning
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
                        Stop if loss ≥ $
                      </span>
                      <input suppressHydrationWarning
                        type="number"
                        value={stopOnLossAmount}
                        onChange={(e) => setStopOnLossAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-20 rounded px-2 py-1 font-mono-stats text-xs text-right outline-none"
                        style={{ backgroundColor: "#1F2937", color: "#F9FAFB", border: "1px solid #374151" }}
                        disabled={!stopOnLossEnabled}
                      />
                    </div>

                    {/* Speed */}
                    <div>
                      <span className="font-body text-xs font-semibold block mb-1.5" style={{ color: "#9CA3AF" }}>
                        Speed
                      </span>
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
                  </div>
                )}
              </div>

              {/* Pick controls */}
              {renderPickControls()}

              {/* 200-round responsible gambling warning */}
              {autoPlayPausedForWarning && (
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}
                >
                  <p className="font-body text-xs" style={{ color: "#F59E0B" }}>
                    Auto-play paused after 200 rounds. Take a moment to review your session before continuing.
                  </p>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "DISMISS_AUTO_PLAY_WARNING" })}
                    className="text-xs mt-1.5 hover:underline"
                    style={{ color: "#9CA3AF" }}
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Start Autobet button */}
              <motion.button
                type="button"
                onClick={handleStartAuto}
                disabled={!isIdle || hasNoPicks || balance < betAmount}
                className="w-full py-3 rounded-[10px] font-body text-base font-bold transition-all"
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
            </>
          )}
        </>
      )}
    </div>
  );
}
