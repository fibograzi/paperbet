"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Shuffle, Trash2, ChevronDown, Zap } from "lucide-react";
import { useBetInput } from "@/lib/useBetInput";
import type {
  KenoGameState,
  KenoAction,
  KenoAutoPlayConfig,
  KenoStrategy,
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

const INCREASE_PRESETS = [25, 50, 100, 200];
const DECREASE_PRESETS = [10, 25, 50, 75];

interface BetStrategyDef {
  id: KenoStrategy;
  label: string;
  description: string;
  behavior: string;
  risk: "low" | "medium" | "high";
}

const BET_STRATEGY_DEFS: BetStrategyDef[] = [
  {
    id: "martingale",
    label: "Martingale",
    description: "Double bet on each loss. One win recovers all previous losses.",
    behavior: "Loss: ×2  ·  Win: Reset",
    risk: "high",
  },
  {
    id: "anti_martingale",
    label: "Anti-Martingale",
    description: "Double bet on each win. Ride winning streaks, reset on loss.",
    behavior: "Win: ×2  ·  Loss: Reset",
    risk: "medium",
  },
  {
    id: "dalembert",
    label: "D'Alembert",
    description: "Increase bet by one unit on loss, decrease by one unit on win.",
    behavior: "Loss: +1u  ·  Win: −1u",
    risk: "low",
  },
  {
    id: "fibonacci",
    label: "Fibonacci",
    description: "Follow the Fibonacci sequence on losses, step back two on win.",
    behavior: "Loss: next Fib  ·  Win: −2 steps",
    risk: "medium",
  },
  {
    id: "paroli",
    label: "Paroli",
    description: "Double bet on win up to 3 consecutive wins, then reset.",
    behavior: "Win streak ×2 (cap 3)  ·  Loss: Reset",
    risk: "low",
  },
  {
    id: "custom",
    label: "Custom",
    description: "Set your own on-win and on-loss bet adjustments.",
    behavior: "Fully configurable",
    risk: "low",
  },
];

const RISK_COLORS: Record<"low" | "medium" | "high", string> = {
  low: "#00E5A0",
  medium: "#F59E0B",
  high: "#EF4444",
};

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
  const [onWinAction] = useState<"reset" | "increase_percent" | "decrease_percent">("reset");
  const [onWinValue] = useState(100);
  const [onLossAction] = useState<"reset" | "increase_percent" | "decrease_percent">("reset");
  const [onLossValue] = useState(100);
  const [stopOnProfitEnabled] = useState(false);
  const [stopOnProfitAmount] = useState(10);
  const [stopOnLossEnabled] = useState(false);
  const [stopOnLossAmount] = useState(10);
  // Strategy system state
  const [betStrategy, setBetStrategy] = useState<KenoStrategy>("custom");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customOnWinAction, setCustomOnWinAction] = useState<"reset" | "increase_percent" | "decrease_percent">("reset");
  const [customOnWinValue, setCustomOnWinValue] = useState(100);
  const [customOnLossAction, setCustomOnLossAction] = useState<"reset" | "increase_percent" | "decrease_percent">("reset");
  const [customOnLossValue, setCustomOnLossValue] = useState(100);
  const [stopOnProfitEnabledAdv, setStopOnProfitEnabledAdv] = useState(false);
  const [stopOnProfitAmountAdv, setStopOnProfitAmountAdv] = useState(10);
  const [stopOnLossEnabledAdv, setStopOnLossEnabledAdv] = useState(false);
  const [stopOnLossAmountAdv, setStopOnLossAmountAdv] = useState(10);
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
      onWinAction: betStrategy === "custom" ? customOnWinAction : "reset",
      onWinValue: betStrategy === "custom" ? customOnWinValue : 100,
      onLossAction: betStrategy === "custom" ? customOnLossAction : "reset",
      onLossValue: betStrategy === "custom" ? customOnLossValue : 100,
      stopOnProfit: betStrategy === "custom" ? (stopOnProfitEnabledAdv ? stopOnProfitAmountAdv : null) : null,
      stopOnLoss: betStrategy === "custom" ? (stopOnLossEnabledAdv ? stopOnLossAmountAdv : null) : null,
      strategy: betStrategy,
      baseBet: betAmount,
    };

    onStartAutoPlay(config);
  }, [
    selectedNumbers.length, balance, betAmount, autoInfinityToggle, autoNumberOfBets,
    betStrategy, customOnWinAction, customOnWinValue, customOnLossAction, customOnLossValue,
    stopOnProfitEnabledAdv, stopOnProfitAmountAdv, stopOnLossEnabledAdv, stopOnLossAmountAdv,
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

              {/* Advanced — strategy grid */}
              <div className="rounded-lg" style={{ border: "1px solid #374151" }}>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between px-3 py-2"
                >
                  <span className="font-body text-xs font-semibold" style={{ color: "#9CA3AF" }}>
                    Advanced
                    {betStrategy !== "custom" && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,229,160,0.15)", color: "#00E5A0" }}>
                        {BET_STRATEGY_DEFS.find((s) => s.id === betStrategy)?.label}
                      </span>
                    )}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" style={{ transform: showAdvanced ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms" }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {showAdvanced && (
                  <div className="px-3 pb-3 space-y-3">
                    {/* 3-col strategy grid */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {BET_STRATEGY_DEFS.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setBetStrategy(s.id)}
                          className="rounded-lg p-2 text-center transition-all duration-150"
                          style={{
                            backgroundColor: betStrategy === s.id ? "rgba(0,229,160,0.1)" : "#111827",
                            border: betStrategy === s.id ? "2px solid #00E5A0" : "1px solid #374151",
                          }}
                        >
                          <span className="font-body text-xs font-semibold block" style={{ color: betStrategy === s.id ? "#00E5A0" : "#F9FAFB" }}>
                            {s.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Description card */}
                    {(() => {
                      const def = BET_STRATEGY_DEFS.find((s) => s.id === betStrategy);
                      if (!def) return null;
                      return (
                        <div className="rounded-lg p-3" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-body text-xs font-semibold" style={{ color: "#F9FAFB" }}>{def.label}</span>
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-body font-semibold"
                              style={{ backgroundColor: `${RISK_COLORS[def.risk]}20`, color: RISK_COLORS[def.risk] }}
                            >
                              {def.risk} risk
                            </span>
                          </div>
                          <p className="font-body text-[11px] mb-2" style={{ color: "#9CA3AF" }}>{def.description}</p>
                          <p className="font-mono-stats text-[10px]" style={{ color: "#6B7280" }}>{def.behavior}</p>
                        </div>
                      );
                    })()}

                    {/* Custom: show On Win / On Loss controls */}
                    {betStrategy === "custom" && (
                      <div className="space-y-2">
                        <div>
                          <span className="font-body text-[10px] uppercase tracking-wider block mb-1" style={{ color: "#9CA3AF" }}>On Win</span>
                          <div className="grid grid-cols-3 gap-1">
                            {(["reset", "increase_percent", "decrease_percent"] as const).map((act) => (
                              <button
                                key={act}
                                type="button"
                                onClick={() => setCustomOnWinAction(act)}
                                className="rounded-md py-1.5 text-center font-body text-[10px] font-semibold transition-colors"
                                style={{
                                  backgroundColor: customOnWinAction === act ? "rgba(0,229,160,0.15)" : "#1F2937",
                                  border: customOnWinAction === act ? "1px solid rgba(0,229,160,0.4)" : "1px solid #374151",
                                  color: customOnWinAction === act ? "#00E5A0" : "#9CA3AF",
                                }}
                              >
                                {act === "reset" ? "Reset" : act === "increase_percent" ? "+%" : "-%"}
                              </button>
                            ))}
                          </div>
                          {(customOnWinAction === "increase_percent" || customOnWinAction === "decrease_percent") && (
                            <div className="mt-1.5 flex gap-1.5 flex-wrap">
                              {(customOnWinAction === "increase_percent" ? INCREASE_PRESETS : DECREASE_PRESETS).map((p) => (
                                <button key={p} type="button" onClick={() => setCustomOnWinValue(p)}
                                  className="px-2 py-1 rounded-md font-mono-stats text-[10px] transition-colors"
                                  style={{
                                    backgroundColor: customOnWinValue === p ? "rgba(0,229,160,0.15)" : "#1F2937",
                                    border: customOnWinValue === p ? "1px solid rgba(0,229,160,0.3)" : "1px solid #374151",
                                    color: customOnWinValue === p ? "#00E5A0" : "#9CA3AF",
                                  }}>{p}%</button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-body text-[10px] uppercase tracking-wider block mb-1" style={{ color: "#9CA3AF" }}>On Loss</span>
                          <div className="grid grid-cols-3 gap-1">
                            {(["reset", "increase_percent", "decrease_percent"] as const).map((act) => (
                              <button
                                key={act}
                                type="button"
                                onClick={() => setCustomOnLossAction(act)}
                                className="rounded-md py-1.5 text-center font-body text-[10px] font-semibold transition-colors"
                                style={{
                                  backgroundColor: customOnLossAction === act ? "rgba(0,229,160,0.15)" : "#1F2937",
                                  border: customOnLossAction === act ? "1px solid rgba(0,229,160,0.4)" : "1px solid #374151",
                                  color: customOnLossAction === act ? "#00E5A0" : "#9CA3AF",
                                }}
                              >
                                {act === "reset" ? "Reset" : act === "increase_percent" ? "+%" : "-%"}
                              </button>
                            ))}
                          </div>
                          {(customOnLossAction === "increase_percent" || customOnLossAction === "decrease_percent") && (
                            <div className="mt-1.5 flex gap-1.5 flex-wrap">
                              {(customOnLossAction === "increase_percent" ? INCREASE_PRESETS : DECREASE_PRESETS).map((p) => (
                                <button key={p} type="button" onClick={() => setCustomOnLossValue(p)}
                                  className="px-2 py-1 rounded-md font-mono-stats text-[10px] transition-colors"
                                  style={{
                                    backgroundColor: customOnLossValue === p ? "rgba(0,229,160,0.15)" : "#1F2937",
                                    border: customOnLossValue === p ? "1px solid rgba(0,229,160,0.3)" : "1px solid #374151",
                                    color: customOnLossValue === p ? "#00E5A0" : "#9CA3AF",
                                  }}>{p}%</button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={stopOnProfitEnabledAdv} onChange={(e) => setStopOnProfitEnabledAdv(e.target.checked)} style={{ accentColor: "#00E5A0" }} />
                            <span className="font-body text-xs" style={{ color: "#9CA3AF" }}>Stop on profit ≥</span>
                            <div className="flex-1 flex items-center rounded-md px-2 py-1" style={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}>
                              <span className="font-mono-stats text-xs" style={{ color: "#6B7280" }}>$</span>
                              <input suppressHydrationWarning type="number" value={stopOnProfitAmountAdv} disabled={!stopOnProfitEnabledAdv} onChange={(e) => setStopOnProfitAmountAdv(parseFloat(e.target.value) || 0)} className="flex-1 bg-transparent font-mono-stats text-xs text-right outline-none" style={{ color: "#F9FAFB" }} min={0} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={stopOnLossEnabledAdv} onChange={(e) => setStopOnLossEnabledAdv(e.target.checked)} style={{ accentColor: "#00E5A0" }} />
                            <span className="font-body text-xs" style={{ color: "#9CA3AF" }}>Stop on loss ≥</span>
                            <div className="flex-1 flex items-center rounded-md px-2 py-1" style={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}>
                              <span className="font-mono-stats text-xs" style={{ color: "#6B7280" }}>$</span>
                              <input suppressHydrationWarning type="number" value={stopOnLossAmountAdv} disabled={!stopOnLossEnabledAdv} onChange={(e) => setStopOnLossAmountAdv(parseFloat(e.target.value) || 0)} className="flex-1 bg-transparent font-mono-stats text-xs text-right outline-none" style={{ color: "#F9FAFB" }} min={0} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
