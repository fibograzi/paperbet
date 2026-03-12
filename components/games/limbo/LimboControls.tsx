"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Zap } from "lucide-react";
import { useBetInput } from "@/lib/useBetInput";
import type {
  LimboGameState,
  LimboAction,
  LimboAutoPlayConfig,
  LimboBetAdjustment,
  LimboTargetAdjustment,
  LimboStrategy,
  LimboAnimationSpeed,
} from "./limboTypes";
import {
  MIN_BET,
  MAX_BET,
  clampBet,
  calculateProfitOnWin,
} from "./limboEngine";
import { formatCurrency, cn } from "@/lib/utils";
import BalanceBar from "@/components/shared/BalanceBar";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LimboControlsProps {
  state: LimboGameState;
  dispatch: React.Dispatch<LimboAction>;
  onBet: () => void;
  onStartAutoPlay: (config: LimboAutoPlayConfig) => void;
  onStopAutoPlay: () => void;
}

// ---------------------------------------------------------------------------
// Strategy definitions
// ---------------------------------------------------------------------------

const INCREASE_PRESETS = [25, 50, 100, 200];
const DECREASE_PRESETS = [10, 25, 50, 75];

interface BetStrategyDef {
  id: LimboStrategy;
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

const RISK_COLORS: Record<"low" | "medium" | "high", { bg: string; text: string; label: string }> = {
  low:    { bg: "rgba(0, 229, 160, 0.12)",  text: "#00E5A0", label: "Low Risk" },
  medium: { bg: "rgba(245, 158, 11, 0.12)", text: "#F59E0B", label: "Medium Risk" },
  high:   { bg: "rgba(239, 68, 68, 0.12)",  text: "#EF4444", label: "High Risk" },
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LimboControls({
  state,
  dispatch,
  onBet,
  onStartAutoPlay,
  onStopAutoPlay,
}: LimboControlsProps) {
  const { phase, betAmount, balance, targetMultiplier, animationSpeed, autoPlay, speedMode } = state;
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");
  const isIdle = phase === "idle";
  const isAnimating = phase === "animating";
  const isAutoRunning = autoPlay.active;

  // -------------------------------------------------------------------------
  // Auto-play config state
  // -------------------------------------------------------------------------

  const [autoNumberOfBets, setAutoNumberOfBets] = useState(100);
  const [autoInfinite, setAutoInfinite] = useState(false);
  const [onWinTargetAction, setOnWinTargetAction] = useState<LimboTargetAdjustment>("same");
  const [onWinTargetValue, setOnWinTargetValue] = useState(0.10);
  const [onLossTargetAction, setOnLossTargetAction] = useState<LimboTargetAdjustment>("same");
  const [onLossTargetValue, setOnLossTargetValue] = useState(0.10);
  const [stopOnProfitEnabled, setStopOnProfitEnabled] = useState(false);
  const [stopOnProfitAmount, setStopOnProfitAmount] = useState(10);
  const [stopOnLossEnabled, setStopOnLossEnabled] = useState(false);
  const [stopOnLossAmount, setStopOnLossAmount] = useState(10);
  const [stopOnWinMultEnabled, setStopOnWinMultEnabled] = useState(false);
  const [stopOnWinMultValue, setStopOnWinMultValue] = useState(100);
  const [betStrategy, setBetStrategy] = useState<LimboStrategy>("custom");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoOnWin, setAutoOnWin] = useState<"same" | "reset" | "increase" | "decrease">("same");
  const [autoOnLoss, setAutoOnLoss] = useState<"same" | "reset" | "increase" | "decrease">("same");
  const [increaseOnWinPercent, setIncreaseOnWinPercent] = useState(100);
  const [increaseOnLossPercent, setIncreaseOnLossPercent] = useState(100);

  // -------------------------------------------------------------------------
  // Build auto-play config
  // -------------------------------------------------------------------------

  const buildAutoConfig = useCallback((): LimboAutoPlayConfig => ({
    numberOfBets: autoInfinite ? Infinity : Math.min(500, autoNumberOfBets),
    onWinBetAction: autoOnWin === "increase" ? "increase_percent" : autoOnWin === "decrease" ? "decrease_percent" : (autoOnWin as LimboBetAdjustment),
    onWinBetValue: (autoOnWin === "increase" || autoOnWin === "decrease") ? increaseOnWinPercent : 0,
    onLossBetAction: autoOnLoss === "increase" ? "increase_percent" : autoOnLoss === "decrease" ? "decrease_percent" : (autoOnLoss as LimboBetAdjustment),
    onLossBetValue: (autoOnLoss === "increase" || autoOnLoss === "decrease") ? increaseOnLossPercent : 0,
    onWinTargetAction,
    onWinTargetValue,
    onLossTargetAction,
    onLossTargetValue,
    stopOnProfit: stopOnProfitEnabled ? stopOnProfitAmount : null,
    stopOnLoss: stopOnLossEnabled ? stopOnLossAmount : null,
    stopOnWinMultiplier: stopOnWinMultEnabled ? stopOnWinMultValue : null,
    strategy: betStrategy,
    baseBet: betAmount,
  }), [
    autoNumberOfBets, autoInfinite,
    autoOnWin, autoOnLoss, increaseOnWinPercent, increaseOnLossPercent,
    onWinTargetAction, onWinTargetValue,
    onLossTargetAction, onLossTargetValue,
    stopOnProfitEnabled, stopOnProfitAmount,
    stopOnLossEnabled, stopOnLossAmount,
    stopOnWinMultEnabled, stopOnWinMultValue,
    betStrategy, betAmount,
  ]);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const setBet = useCallback((amount: number) => {
    dispatch({ type: "SET_BET_AMOUNT", amount });
  }, [dispatch]);

  const betInput = useBetInput(betAmount, setBet);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Balance */}
      <BalanceBar balance={balance} onReset={() => dispatch({ type: "RESET_BALANCE" })} />

      {/* Tab toggle */}
      <div
        className="flex rounded-md p-0.5"
        style={{ backgroundColor: "#1F2937" }}
      >
        {(["manual", "auto"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-1.5 rounded-md text-center font-body text-xs font-semibold transition-all"
            style={{
              backgroundColor: activeTab === tab ? "#0B0F1A" : "transparent",
              color: activeTab === tab ? "#F9FAFB" : "#6B7280",
            }}
          >
            {tab === "manual" ? "Manual" : "Auto"}
          </button>
        ))}
      </div>

      {/* Bet amount — Stake-style */}
      <div className="rounded-lg p-3" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
        <div className="flex items-center justify-between mb-1">
          <span className="font-body text-[10px] uppercase tracking-wider" style={{ color: "#9CA3AF" }}>Bet Amount</span>
        </div>

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
              disabled={!isIdle}
              className="flex-1 bg-transparent font-mono-stats text-sm text-right outline-none"
              style={{ color: "#F9FAFB" }}
              aria-label="Bet amount"
            />
          </div>
          <div className="w-px self-stretch" style={{ backgroundColor: "#374151" }} />
          <div className="flex items-center shrink-0" style={{ backgroundColor: "#263040" }}>
            <button
              type="button"
              disabled={!isIdle}
              onClick={() => setBet(betAmount / 2)}
              className="px-2.5 py-1.5 font-body text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ color: "#9CA3AF" }}
            >
              &frac12;
            </button>
            <div className="w-px h-4 shrink-0" style={{ backgroundColor: "#374151" }} />
            <button
              type="button"
              disabled={!isIdle}
              onClick={() => setBet(betAmount * 2)}
              className="px-2.5 py-1.5 font-body text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ color: "#9CA3AF" }}
            >
              2&times;
            </button>
          </div>
        </div>

      </div>

      {/* ===== MANUAL TAB ===== */}
      {activeTab === "manual" && (
        <>
          {/* Bet button — desktop only */}
          <div className="hidden lg:block">
            <motion.button
              type="button"
              disabled={isAnimating || balance < betAmount || isAutoRunning}
              onClick={onBet}
              className="w-full flex items-center justify-center gap-2 h-9 rounded-lg font-body text-sm font-bold transition-colors"
              style={{
                backgroundColor: isAnimating || isAutoRunning ? "#374151" : "#00E5A0",
                color: isAnimating || isAutoRunning ? "#9CA3AF" : "#0B0F1A",
                boxShadow: isAnimating || isAutoRunning ? "none" : "0 0 20px rgba(0,229,160,0.2)",
                cursor: isAnimating || balance < betAmount || isAutoRunning ? "not-allowed" : "pointer",
              }}
              whileHover={!isAnimating && !isAutoRunning ? { backgroundColor: "#1AFFA8", boxShadow: "0 0 30px rgba(0,229,160,0.3)" } : {}}
              whileTap={!isAnimating && !isAutoRunning ? { scale: 0.98 } : {}}
              aria-label="Place bet"
            >
              {isAnimating ? "..." : "Bet"}
            </motion.button>
          </div>

          {/* Profit on Win */}
          <div className="rounded-xl p-3" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
            <span className="font-body text-xs block mb-1" style={{ color: "#6B7280" }}>Profit on Win</span>
            <p className="font-mono-stats font-medium" style={{ fontSize: 16, color: "#F9FAFB" }}>
              {formatCurrency(calculateProfitOnWin(betAmount, targetMultiplier))}
            </p>
          </div>

          {/* Animation speed toggle */}
          <div>
            <span className="font-body text-xs block mb-1.5" style={{ color: "#6B7280" }}>Speed</span>
            <div className="flex rounded-lg p-1" style={{ backgroundColor: "#1F2937" }} role="radiogroup" aria-label="Animation speed">
              {(["normal", "fast", "skip"] as LimboAnimationSpeed[]).map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => dispatch({ type: "SET_ANIMATION_SPEED", speed })}
                  className="flex-1 py-1.5 rounded-md text-center font-body text-xs font-semibold transition-colors capitalize"
                  style={{
                    backgroundColor: animationSpeed === speed ? "rgba(0,229,160,0.15)" : "transparent",
                    color: animationSpeed === speed ? "#00E5A0" : "#9CA3AF",
                  }}
                  role="radio"
                  aria-checked={animationSpeed === speed}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ===== AUTO TAB ===== */}
      {activeTab === "auto" && (
        <>
          {/* Number of Bets — text input + ∞ toggle */}
          <div className="rounded-lg p-2.5" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
            <span className="font-body text-[10px] uppercase tracking-wider block mb-1" style={{ color: "#9CA3AF" }}>Number of Bets</span>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 rounded-md py-1.5 px-2.5"
                style={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
              >
                <input
                  suppressHydrationWarning
                  type="number"
                  inputMode="numeric"
                  value={autoInfinite ? "" : autoNumberOfBets}
                  placeholder={autoInfinite ? "\u221E" : undefined}
                  disabled={isAutoRunning || autoInfinite}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setAutoNumberOfBets(Math.min(500, Math.max(1, val)));
                  }}
                  className="w-full bg-transparent font-mono-stats text-xs outline-none"
                  style={{ color: autoInfinite ? "#6B7280" : "#F9FAFB" }}
                  max={500}
                  min={1}
                  aria-label="Number of bets"
                />
              </div>
              <button
                type="button"
                disabled={isAutoRunning}
                onClick={() => {
                  if (autoInfinite) {
                    setAutoInfinite(false);
                    setAutoNumberOfBets(100);
                  } else {
                    setAutoInfinite(true);
                  }
                }}
                className="w-8 h-8 rounded-md flex items-center justify-center font-mono-stats text-lg font-bold transition-colors"
                style={{
                  backgroundColor: autoInfinite ? "rgba(0,229,160,0.15)" : "#1F2937",
                  border: autoInfinite ? "1px solid rgba(0,229,160,0.3)" : "1px solid #374151",
                  color: autoInfinite ? "#00E5A0" : "#9CA3AF",
                  opacity: isAutoRunning ? 0.5 : 1,
                }}
                aria-label="Infinite bets"
              >
                &infin;
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

          {/* Advanced toggle */}
          {!isAutoRunning && (
            <div className="bg-pb-bg-secondary border border-pb-border rounded-lg">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 w-full text-left px-2.5 py-2"
              >
                <span className="text-xs font-heading font-semibold text-pb-text-secondary">
                  Advanced
                </span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "ml-auto text-pb-text-muted transition-transform",
                    showAdvanced && "rotate-180"
                  )}
                />
              </button>

              {showAdvanced && (
                <div className="px-2.5 pb-2.5 space-y-3">

                  {/* Strategy selector */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-pb-text-muted mb-1.5">
                      Strategy
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {BET_STRATEGY_DEFS.map((s) => {
                        const active = betStrategy === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setBetStrategy(s.id)}
                            className="py-1.5 px-1 rounded-md text-[11px] font-heading font-semibold transition-all duration-150"
                            style={{
                              backgroundColor: active ? "rgba(0, 229, 160, 0.15)" : "#1F2937",
                              color: active ? "#00E5A0" : "#9CA3AF",
                              border: active
                                ? "1px solid rgba(0, 229, 160, 0.3)"
                                : "1px solid #374151",
                            }}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Strategy description card (non-custom only) */}
                  {betStrategy !== "custom" && (() => {
                    const def = BET_STRATEGY_DEFS.find((s) => s.id === betStrategy)!;
                    const risk = RISK_COLORS[def.risk];
                    return (
                      <div
                        className="rounded-lg p-2.5 space-y-1.5"
                        style={{ backgroundColor: "#111827", border: "1px solid #374151" }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-heading font-semibold text-pb-text-primary">
                            {def.label}
                          </span>
                          <span
                            className="text-[10px] font-body px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: risk.bg, color: risk.text }}
                          >
                            {risk.label}
                          </span>
                        </div>
                        <p className="text-[11px] font-body leading-relaxed" style={{ color: "#9CA3AF" }}>
                          {def.description}
                        </p>
                        <p className="text-[10px] font-mono-stats" style={{ color: "#6B7280" }}>
                          {def.behavior}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Custom: On Win / On Loss controls */}
                  {betStrategy === "custom" && (
                    <div className="space-y-2">
                      {/* On Win */}
                      <div>
                        <label className="font-body text-xs block mb-1.5" style={{ color: "#6B7280" }}>
                          On Win
                        </label>
                        <div className="flex gap-1.5 mb-1.5">
                          {(
                            [
                              { value: "same", label: "Same" },
                              { value: "reset", label: "Reset" },
                              { value: "increase", label: "Increase" },
                              { value: "decrease", label: "Decrease" },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setAutoOnWin(opt.value)}
                              className="flex-1 py-1.5 rounded-md text-xs font-body transition-colors"
                              style={{
                                backgroundColor: autoOnWin === opt.value ? "rgba(0, 229, 160, 0.15)" : "#1F2937",
                                color: autoOnWin === opt.value ? "#00E5A0" : "#9CA3AF",
                                border: autoOnWin === opt.value
                                  ? "1px solid rgba(0, 229, 160, 0.3)"
                                  : "1px solid #374151",
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        {(autoOnWin === "increase" || autoOnWin === "decrease") && (
                          <div className="mt-1.5">
                            <div className="flex gap-1 mb-1">
                              {(autoOnWin === "decrease" ? DECREASE_PRESETS : INCREASE_PRESETS).map((pct) => (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() => setIncreaseOnWinPercent(pct)}
                                  className="flex-1 py-1 text-[10px] font-mono-stats rounded transition-colors"
                                  style={{
                                    backgroundColor: increaseOnWinPercent === pct ? "rgba(0, 229, 160, 0.15)" : "#1F2937",
                                    color: increaseOnWinPercent === pct ? "#00E5A0" : "#9CA3AF",
                                    border: increaseOnWinPercent === pct
                                      ? "1px solid rgba(0, 229, 160, 0.3)"
                                      : "1px solid #374151",
                                  }}
                                >
                                  {pct}%
                                </button>
                              ))}
                            </div>
                            <div className="relative">
                              <input suppressHydrationWarning
                                type="number"
                                min={1}
                                max={autoOnWin === "decrease" ? 95 : 10000}
                                step={1}
                                value={increaseOnWinPercent}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  const max = autoOnWin === "decrease" ? 95 : 10000;
                                  if (!isNaN(val) && val >= 1) setIncreaseOnWinPercent(Math.min(max, val));
                                }}
                                className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-1.5 pl-3 pr-8 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50"
                                aria-label="On win percentage"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">%</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* On Loss */}
                      <div>
                        <label className="font-body text-xs block mb-1.5" style={{ color: "#6B7280" }}>
                          On Loss
                        </label>
                        <div className="flex gap-1.5 mb-1.5">
                          {(
                            [
                              { value: "same", label: "Same" },
                              { value: "reset", label: "Reset" },
                              { value: "increase", label: "Increase" },
                              { value: "decrease", label: "Decrease" },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setAutoOnLoss(opt.value)}
                              className="flex-1 py-1.5 rounded-md text-xs font-body transition-colors"
                              style={{
                                backgroundColor: autoOnLoss === opt.value ? "rgba(239, 68, 68, 0.15)" : "#1F2937",
                                color: autoOnLoss === opt.value ? "#EF4444" : "#9CA3AF",
                                border: autoOnLoss === opt.value
                                  ? "1px solid rgba(239, 68, 68, 0.3)"
                                  : "1px solid #374151",
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        {(autoOnLoss === "increase" || autoOnLoss === "decrease") && (
                          <div className="mt-1.5">
                            <div className="flex gap-1 mb-1">
                              {(autoOnLoss === "decrease" ? DECREASE_PRESETS : INCREASE_PRESETS).map((pct) => (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() => setIncreaseOnLossPercent(pct)}
                                  className="flex-1 py-1 text-[10px] font-mono-stats rounded transition-colors"
                                  style={{
                                    backgroundColor: increaseOnLossPercent === pct ? "rgba(239, 68, 68, 0.15)" : "#1F2937",
                                    color: increaseOnLossPercent === pct ? "#EF4444" : "#9CA3AF",
                                    border: increaseOnLossPercent === pct
                                      ? "1px solid rgba(239, 68, 68, 0.3)"
                                      : "1px solid #374151",
                                  }}
                                >
                                  {pct}%
                                </button>
                              ))}
                            </div>
                            <div className="relative">
                              <input suppressHydrationWarning
                                type="number"
                                min={1}
                                max={autoOnLoss === "decrease" ? 95 : 10000}
                                step={1}
                                value={increaseOnLossPercent}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  const max = autoOnLoss === "decrease" ? 95 : 10000;
                                  if (!isNaN(val) && val >= 1) setIncreaseOnLossPercent(Math.min(max, val));
                                }}
                                className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-1.5 pl-3 pr-8 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50"
                                aria-label="On loss percentage"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stop on Profit */}
                  <div>
                    <label className="flex items-center gap-2 mb-1.5 cursor-pointer">
                      <input suppressHydrationWarning
                        type="checkbox"
                        checked={stopOnProfitEnabled}
                        onChange={(e) => setStopOnProfitEnabled(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-pb-border accent-pb-accent"
                      />
                      <span className="text-xs text-pb-text-muted">Stop on Profit</span>
                    </label>
                    {stopOnProfitEnabled && (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">$</span>
                        <input suppressHydrationWarning
                          type="number" min={1} max={100000} step={1}
                          value={stopOnProfitAmount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val > 0) setStopOnProfitAmount(Math.round(val * 100) / 100);
                          }}
                          className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-1.5 pl-7 pr-3 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50"
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
                        onChange={(e) => setStopOnLossEnabled(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-pb-border accent-pb-accent"
                      />
                      <span className="text-xs text-pb-text-muted">Stop on Loss</span>
                    </label>
                    {stopOnLossEnabled && (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">$</span>
                        <input suppressHydrationWarning
                          type="number" min={1} max={100000} step={1}
                          value={stopOnLossAmount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val > 0) setStopOnLossAmount(Math.round(val * 100) / 100);
                          }}
                          className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-1.5 pl-7 pr-3 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50"
                          aria-label="Stop on loss amount"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Start Autobet */}
          {!isAutoRunning && (
            <button
              type="button"
              onClick={() => onStartAutoPlay(buildAutoConfig())}
              disabled={balance < betAmount}
              className="w-full py-2.5 rounded-lg bg-pb-accent/15 text-pb-accent font-heading font-semibold text-sm border border-pb-accent/30 hover:bg-pb-accent/25 transition-colors disabled:opacity-40"
            >
              Start Autobet
            </button>
          )}

          {/* Active summary */}
          {isAutoRunning && (
            <>
              <div className="bg-pb-bg-secondary border border-pb-border rounded-lg p-2.5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-pb-text-muted">Target</span>
                  <span className="text-pb-text-primary font-mono-stats">
                    {targetMultiplier.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-pb-text-muted">Strategy</span>
                  <span className="text-pb-text-primary font-mono-stats capitalize">
                    {BET_STRATEGY_DEFS.find((s) => s.id === autoPlay.config?.strategy)?.label ?? "Custom"}
                  </span>
                </div>
                {autoPlay.config?.strategy === "custom" && (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-pb-text-muted">On Win</span>
                      <span className="text-pb-text-primary font-mono-stats">
                        {autoPlay.config.onWinBetAction === "reset"
                          ? "Reset"
                          : autoPlay.config.onWinBetAction === "increase_percent"
                            ? `+${autoPlay.config.onWinBetValue}%`
                            : autoPlay.config.onWinBetAction === "decrease_percent"
                              ? `-${autoPlay.config.onWinBetValue}%`
                              : "Same"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-pb-text-muted">On Loss</span>
                      <span className="text-pb-text-primary font-mono-stats">
                        {autoPlay.config.onLossBetAction === "reset"
                          ? "Reset"
                          : autoPlay.config.onLossBetAction === "increase_percent"
                            ? `+${autoPlay.config.onLossBetValue}%`
                            : autoPlay.config.onLossBetAction === "decrease_percent"
                              ? `-${autoPlay.config.onLossBetValue}%`
                              : "Same"}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-pb-text-muted">Current Bet</span>
                  <span className="text-pb-text-primary font-mono-stats">
                    {formatCurrency(betAmount)}
                  </span>
                </div>
                {autoPlay.progress && (
                  <div className="flex justify-between text-xs">
                    <span className="text-pb-text-muted">Rounds</span>
                    <span className="text-pb-text-primary font-mono-stats">
                      {isFinite(autoPlay.progress.totalBets)
                        ? `${autoPlay.progress.currentBet}/${autoPlay.progress.totalBets}`
                        : `${autoPlay.progress.currentBet}`}
                    </span>
                  </div>
                )}
                {(autoPlay.config?.stopOnProfit !== null || autoPlay.config?.stopOnLoss !== null) && autoPlay.config && (
                  <div className="border-t border-pb-border/50 pt-1.5 mt-1.5">
                    {autoPlay.config.stopOnProfit !== null && (
                      <div className="flex justify-between text-xs">
                        <span className="text-pb-text-muted">Stop Profit</span>
                        <span className="text-pb-accent font-mono-stats">
                          {formatCurrency(autoPlay.config.stopOnProfit)}
                        </span>
                      </div>
                    )}
                    {autoPlay.config.stopOnLoss !== null && (
                      <div className="flex justify-between text-xs">
                        <span className="text-pb-text-muted">Stop Loss</span>
                        <span className="text-pb-danger font-mono-stats">
                          {formatCurrency(autoPlay.config.stopOnLoss)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {autoPlay.progress && (
                  <div className="border-t border-pb-border/50 pt-1.5 mt-1.5 flex justify-between text-xs font-bold">
                    <span className="text-pb-text-muted">Session P&amp;L</span>
                    <span
                      className="font-mono-stats"
                      style={{ color: autoPlay.progress.sessionProfit >= 0 ? "#00E5A0" : "#EF4444" }}
                    >
                      {autoPlay.progress.sessionProfit >= 0 ? "+" : ""}
                      {formatCurrency(autoPlay.progress.sessionProfit)}
                    </span>
                  </div>
                )}
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
            disabled={isAnimating || balance < betAmount || isAutoRunning}
            className="w-full h-11 rounded-lg font-heading font-bold text-sm transition-all active:scale-[0.98]"
            style={{
              backgroundColor: isAnimating || balance < betAmount ? "#374151" : "#00E5A0",
              color: isAnimating || balance < betAmount ? "#6B7280" : "#0B0F1A",
              cursor: isAnimating || balance < betAmount ? "not-allowed" : "pointer",
            }}
          >
            {isAnimating ? "..." : "Bet"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onStartAutoPlay(buildAutoConfig())}
            disabled={balance < betAmount}
            className="w-full h-11 rounded-lg bg-pb-accent/15 text-pb-accent font-heading font-bold text-sm border border-pb-accent/30 transition-colors disabled:opacity-40"
          >
            Start Autobet
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg" style={{ border: "1px solid #374151" }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2.5 py-2"
      >
        <span className="font-body text-xs" style={{ color: "#9CA3AF" }}>{title}</span>
        <ChevronDown
          size={14}
          style={{
            color: "#6B7280",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 150ms",
          }}
        />
      </button>
      {open && <div className="px-2.5 pb-2.5 space-y-2">{children}</div>}
    </div>
  );
}

function BetAdjustmentSelector({
  label,
  action,
  value,
  disabled,
  onActionChange,
  onValueChange,
}: {
  label: string;
  action: LimboBetAdjustment;
  value: number;
  disabled: boolean;
  onActionChange: (a: LimboBetAdjustment) => void;
  onValueChange: (v: number) => void;
}) {
  const options: { value: LimboBetAdjustment; label: string }[] = [
    { value: "same", label: "Keep same" },
    { value: "increase_percent", label: "Increase by %" },
    { value: "increase_flat", label: "Increase by $" },
    { value: "decrease_flat", label: "Decrease by $" },
    { value: "reset", label: "Reset to base" },
  ];

  return (
    <div>
      <span className="font-body text-xs block mb-1" style={{ color: "#6B7280" }}>{label}</span>
      <select
        value={action}
        disabled={disabled}
        onChange={(e) => onActionChange(e.target.value as LimboBetAdjustment)}
        className="w-full rounded-md px-2 py-1.5 font-body text-xs outline-none"
        style={{ backgroundColor: "#1F2937", border: "1px solid #374151", color: "#F9FAFB" }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {(action === "increase_percent" || action === "increase_flat" || action === "decrease_flat") && (
        <input
          suppressHydrationWarning
          type="number"
          value={value}
          disabled={disabled}
          onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
          className="w-full mt-1 rounded-md px-2 py-1.5 font-mono-stats text-xs outline-none"
          style={{ backgroundColor: "#1F2937", border: "1px solid #374151", color: "#F9FAFB" }}
          min={0}
          step={action === "increase_percent" ? 10 : 0.10}
        />
      )}
    </div>
  );
}

function TargetAdjustmentSelector({
  action,
  value,
  disabled,
  onActionChange,
  onValueChange,
}: {
  action: LimboTargetAdjustment;
  value: number;
  disabled: boolean;
  onActionChange: (a: LimboTargetAdjustment) => void;
  onValueChange: (v: number) => void;
}) {
  const options: { value: LimboTargetAdjustment; label: string }[] = [
    { value: "same", label: "Keep same" },
    { value: "increase", label: "Increase (riskier)" },
    { value: "decrease", label: "Decrease (safer)" },
  ];

  return (
    <div>
      <span className="font-body text-xs block mb-1" style={{ color: "#6B7280" }}>Target</span>
      <select
        value={action}
        disabled={disabled}
        onChange={(e) => onActionChange(e.target.value as LimboTargetAdjustment)}
        className="w-full rounded-md px-2 py-1.5 font-body text-xs outline-none"
        style={{ backgroundColor: "#1F2937", border: "1px solid #374151", color: "#F9FAFB" }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {action !== "same" && (
        <input
          suppressHydrationWarning
          type="number"
          value={value}
          disabled={disabled}
          onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
          className="w-full mt-1 rounded-md px-2 py-1.5 font-mono-stats text-xs outline-none"
          style={{ backgroundColor: "#1F2937", border: "1px solid #374151", color: "#F9FAFB" }}
          min={0.01}
          step={0.01}
        />
      )}
    </div>
  );
}

function StopCondition({
  label,
  prefix,
  suffix,
  enabled,
  value,
  disabled,
  onToggle,
  onValueChange,
}: {
  label: string;
  prefix: string;
  suffix?: string;
  enabled: boolean;
  value: number;
  disabled: boolean;
  onToggle: (v: boolean) => void;
  onValueChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        suppressHydrationWarning
        type="checkbox"
        checked={enabled}
        disabled={disabled}
        onChange={(e) => onToggle(e.target.checked)}
        style={{ accentColor: "#00E5A0" }}
        aria-label={`Enable ${label}`}
      />
      <span className="font-body text-xs shrink-0" style={{ color: "#9CA3AF" }}>
        {label} &ge;
      </span>
      <div
        className="flex-1 rounded-md px-2 py-1 flex items-center"
        style={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
      >
        {prefix && <span className="font-mono-stats text-xs" style={{ color: "#6B7280" }}>{prefix}</span>}
        <input
          suppressHydrationWarning
          type="number"
          value={value}
          disabled={disabled || !enabled}
          onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
          className="flex-1 bg-transparent font-mono-stats text-xs text-right outline-none"
          style={{ color: "#F9FAFB" }}
          min={0}
          step={prefix === "$" ? 1 : 0.01}
        />
        {suffix && <span className="font-mono-stats text-xs ml-0.5" style={{ color: "#6B7280" }}>{suffix}</span>}
      </div>
    </div>
  );
}
