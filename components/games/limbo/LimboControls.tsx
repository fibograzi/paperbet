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
import { formatCurrency } from "@/lib/utils";
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

const RISK_COLORS: Record<"low" | "medium" | "high", string> = {
  low: "#00E5A0",
  medium: "#F59E0B",
  high: "#EF4444",
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
  const [onWinBetAction, setOnWinBetAction] = useState<LimboBetAdjustment>("same");
  const [onWinBetValue, setOnWinBetValue] = useState(100);
  const [onLossBetAction, setOnLossBetAction] = useState<LimboBetAdjustment>("same");
  const [onLossBetValue, setOnLossBetValue] = useState(100);
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

  // -------------------------------------------------------------------------
  // Build auto-play config
  // -------------------------------------------------------------------------

  const buildAutoConfig = useCallback((): LimboAutoPlayConfig => ({
    numberOfBets: autoInfinite ? Infinity : Math.min(500, autoNumberOfBets),
    onWinBetAction,
    onWinBetValue,
    onLossBetAction,
    onLossBetValue,
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
    onWinBetAction, onWinBetValue,
    onLossBetAction, onLossBetValue,
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

          {/* Advanced — strategy grid */}
          <div className="rounded-lg" style={{ border: "1px solid #374151" }}>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-3 py-2"
              disabled={isAutoRunning}
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
                      disabled={isAutoRunning}
                      onClick={() => setBetStrategy(s.id)}
                      className="rounded-lg p-2 text-center transition-all duration-150 disabled:opacity-50"
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

                {/* Custom: show On Win / On Loss + stop conditions */}
                {betStrategy === "custom" && (
                  <div className="space-y-2">
                    <BetAdjustmentSelector
                      label="On Win"
                      action={onWinBetAction}
                      value={onWinBetValue}
                      disabled={isAutoRunning}
                      onActionChange={setOnWinBetAction}
                      onValueChange={setOnWinBetValue}
                    />
                    <BetAdjustmentSelector
                      label="On Loss"
                      action={onLossBetAction}
                      value={onLossBetValue}
                      disabled={isAutoRunning}
                      onActionChange={setOnLossBetAction}
                      onValueChange={setOnLossBetValue}
                    />
                    <StopCondition
                      label="Stop on profit"
                      prefix="$"
                      enabled={stopOnProfitEnabled}
                      value={stopOnProfitAmount}
                      disabled={isAutoRunning}
                      onToggle={setStopOnProfitEnabled}
                      onValueChange={setStopOnProfitAmount}
                    />
                    <StopCondition
                      label="Stop on loss"
                      prefix="$"
                      enabled={stopOnLossEnabled}
                      value={stopOnLossAmount}
                      disabled={isAutoRunning}
                      onToggle={setStopOnLossEnabled}
                      onValueChange={setStopOnLossAmount}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Start/Stop Autobet button — desktop only */}
          <div className="hidden lg:block">
            <motion.button
              type="button"
              disabled={!isAutoRunning && (balance < betAmount)}
              onClick={() => {
                if (isAutoRunning) {
                  onStopAutoPlay();
                } else {
                  onStartAutoPlay(buildAutoConfig());
                }
              }}
              className="w-full flex items-center justify-center gap-2 h-9 rounded-lg font-body text-sm font-bold transition-colors"
              style={{
                backgroundColor: isAutoRunning ? "#EF4444" : "#00E5A0",
                color: isAutoRunning ? "#F9FAFB" : "#0B0F1A",
                cursor: !isAutoRunning && balance < betAmount ? "not-allowed" : "pointer",
                opacity: !isAutoRunning && balance < betAmount ? 0.5 : 1,
              }}
              whileTap={{ scale: 0.98 }}
            >
              {isAutoRunning ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
                  Stop Autobet
                </>
              ) : (
                "Start Autobet"
              )}
            </motion.button>
          </div>

          {/* Auto progress counter */}
          {isAutoRunning && autoPlay.progress && (
            <div className="text-center font-mono-stats text-sm" style={{ color: "#9CA3AF" }}>
              <p>
                Bet {autoPlay.progress.currentBet}
                {isFinite(autoPlay.progress.totalBets)
                  ? ` / ${autoPlay.progress.totalBets}`
                  : ""}
                {" \u2014 "}
                <span style={{ color: "#00E5A0" }}>W: {autoPlay.progress.wins}</span>
                {" | "}
                <span style={{ color: "#EF4444" }}>L: {autoPlay.progress.losses}</span>
              </p>
              <p
                className="mt-1 font-bold"
                style={{
                  color: autoPlay.progress.sessionProfit >= 0 ? "#00E5A0" : "#EF4444",
                }}
              >
                {autoPlay.progress.sessionProfit >= 0 ? "+" : ""}
                {formatCurrency(autoPlay.progress.sessionProfit)}
              </p>
            </div>
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
