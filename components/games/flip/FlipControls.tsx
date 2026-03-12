"use client";

import { useCallback, useState, useEffect } from "react";
import { Crown, Diamond, Shuffle, Infinity, Zap, ChevronDown } from "lucide-react";
import { useBetInput } from "@/lib/useBetInput";
import type {
  FlipGameState,
  FlipAction,
  FlipAutoPlayConfig,
  FlipStrategy,
  SidePick,
} from "./flipTypes";
import {
  formatFlipMultiplier,
  getMultiplier,
  getFlipMultiplierColor,
  MAX_FLIPS,
} from "./flipEngine";
import { formatCurrency, cn } from "@/lib/utils";
import BalanceBar from "@/components/shared/BalanceBar";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FlipControlsProps {
  state: FlipGameState;
  dispatch: React.Dispatch<FlipAction>;
  onFlip: () => void;
  onCashOut: () => void;
  onFlipAgain: () => void;
  onStartAutoPlay: (config: FlipAutoPlayConfig) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_AUTO_ROUNDS = 500;
const INCREASE_PRESETS = [25, 50, 100, 200];
const DECREASE_PRESETS = [10, 25, 50, 75];

type WinLossAction = "same" | "reset" | "increase" | "decrease";
type Tab = "manual" | "auto";

interface StrategyDef {
  id: FlipStrategy;
  label: string;
  description: string;
  behavior: string;
  risk: "low" | "medium" | "high";
}

const BET_STRATEGY_DEFS: StrategyDef[] = [
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
// Side Button Component
// ---------------------------------------------------------------------------

function SideButton({
  side,
  selected,
  disabled,
  onClick,
}: {
  side: SidePick;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const config = {
    heads: {
      icon: <Crown size={16} />,
      label: "Heads",
      color: "#F59E0B",
      dotColor: "#F59E0B",
    },
    tails: {
      icon: <Diamond size={16} />,
      label: "Tails",
      color: "#00B4D8",
      dotColor: "#00B4D8",
    },
    random: {
      icon: <Shuffle size={16} />,
      label: "Random",
      color: "#00E5A0",
      dotColor: "#00E5A0",
    },
  }[side];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex-1 flex flex-col items-center gap-1.5 rounded-lg py-3 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        backgroundColor: selected
          ? `${config.color}15`
          : "#1F2937",
        border: selected
          ? `2px solid ${config.color}`
          : "1px solid #374151",
        color: selected ? config.color : "#9CA3AF",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !selected) {
          (e.currentTarget as HTMLElement).style.backgroundColor = "#374151";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLElement).style.backgroundColor = "#1F2937";
        }
      }}
      role="radio"
      aria-checked={selected}
    >
      {side !== "random" && (
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: config.dotColor }}
        />
      )}
      {side === "random" && config.icon}
      <span className="font-body text-xs font-semibold">{config.label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FlipControls({
  state,
  dispatch,
  onFlip,
  onCashOut,
  onFlipAgain,
  onStartAutoPlay,
}: FlipControlsProps) {
  const { phase, config, balance, streak, autoPlay, speedMode } = state;

  const [activeTab, setActiveTab] = useState<Tab>("manual");

  // Auto-play local state
  const [autoFlipsPerRound, setAutoFlipsPerRound] = useState(1);
  const [autoCount, setAutoCount] = useState(10);
  const [autoInfinite, setAutoInfinite] = useState(false);
  const [betStrategy, setBetStrategy] = useState<FlipStrategy>("custom");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoOnWin, setAutoOnWin] = useState<WinLossAction>("reset");
  const [autoOnLoss, setAutoOnLoss] = useState<WinLossAction>("reset");
  const [increaseOnWinPercent, setIncreaseOnWinPercent] = useState(50);
  const [increaseOnLossPercent, setIncreaseOnLossPercent] = useState(100);
  const [stopOnProfitEnabled, setStopOnProfitEnabled] = useState(false);
  const [stopOnLossEnabled, setStopOnLossEnabled] = useState(false);
  const [stopOnProfitAmount, setStopOnProfitAmount] = useState(100);
  const [stopOnLossAmount, setStopOnLossAmount] = useState(50);
  const isIdle = phase === "idle";
  const isFlipping = phase === "flipping";
  const isWon = phase === "won";
  const isRoundActive =
    phase === "flipping" ||
    phase === "won" ||
    phase === "cashing_out" ||
    phase === "lost";
  const controlsDisabled = isRoundActive || autoPlay.active;

  // Auto-expand auto tab when auto-play activates
  useEffect(() => {
    if (autoPlay.active) setActiveTab("auto");
  }, [autoPlay.active]);

  // --- Bet Amount Handlers ---
  const setBet = useCallback(
    (amount: number) => {
      dispatch({
        type: "SET_BET_AMOUNT",
        amount: Math.max(0.1, Math.min(1000, Math.round(amount * 100) / 100)),
      });
    },
    [dispatch]
  );

  const betInput = useBetInput(config.betAmount, setBet);

  // --- Auto-play start ---
  const handleAutoPlayStart = useCallback(() => {
    const autoConfig: FlipAutoPlayConfig = {
      flipsPerRound: autoFlipsPerRound,
      totalCount: autoInfinite ? null : autoCount,
      onWin: autoOnWin,
      onLoss: autoOnLoss,
      increaseOnWinPercent,
      increaseOnLossPercent,
      baseBet: config.betAmount,
      stopOnProfit: stopOnProfitEnabled ? stopOnProfitAmount : null,
      stopOnLoss: stopOnLossEnabled ? stopOnLossAmount : null,
      strategy: betStrategy,
    };
    onStartAutoPlay(autoConfig);
  }, [
    autoFlipsPerRound,
    autoCount,
    autoInfinite,
    autoOnWin,
    autoOnLoss,
    increaseOnWinPercent,
    increaseOnLossPercent,
    config.betAmount,
    stopOnProfitEnabled,
    stopOnProfitAmount,
    stopOnLossEnabled,
    stopOnLossAmount,
    betStrategy,
    onStartAutoPlay,
  ]);

  // Auto-play session P/L
  const autoPlayProfit = autoPlay.active
    ? state.stats.netProfit - autoPlay.startingNetProfit
    : 0;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Balance */}
      <BalanceBar balance={balance} onReset={() => dispatch({ type: "RESET_BALANCE" })} />

      {/* Manual / Auto Tab Toggle */}
      <div
        className="flex rounded-md p-0.5"
        style={{ backgroundColor: "#1F2937" }}
      >
        {(["manual", "auto"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            disabled={
              (tab === "auto" && isRoundActive && activeTab === "manual") ||
              (tab === "manual" && autoPlay.active)
            }
            className="flex-1 py-1.5 rounded-md text-xs font-body transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: activeTab === tab ? "#0B0F1A" : "transparent",
              color: activeTab === tab ? "#F9FAFB" : "#6B7280",
              fontWeight: activeTab === tab ? 600 : 400,
            }}
          >
            {tab === "manual" ? "Manual" : "Auto"}
          </button>
        ))}
      </div>

      {/* Bet Amount Card */}
      <div
        className="rounded-lg p-3"
        style={{
          backgroundColor: "#111827",
          border: "1px solid #374151",
        }}
      >
        <label
          className="font-body text-[10px] uppercase tracking-wider block mb-1"
          style={{ color: "#9CA3AF" }}
        >
          Bet Amount
        </label>
        <div
          className="flex items-center rounded-lg overflow-hidden"
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
              disabled={controlsDisabled}
              className="flex-1 bg-transparent font-mono-stats text-sm text-right outline-none"
              style={{ color: "#F9FAFB" }}
              aria-label="Bet amount"
            />
          </div>
          <div className="w-px self-stretch" style={{ backgroundColor: "#374151" }} />
          <div className="flex items-center shrink-0" style={{ backgroundColor: "#263040" }}>
            <button
              type="button"
              disabled={controlsDisabled}
              onClick={() => setBet(config.betAmount / 2)}
              className="px-2.5 py-1.5 font-body text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ color: "#9CA3AF" }}
            >
              &frac12;
            </button>
            <div className="w-px h-4 shrink-0" style={{ backgroundColor: "#374151" }} />
            <button
              type="button"
              disabled={controlsDisabled}
              onClick={() => setBet(config.betAmount * 2)}
              className="px-2.5 py-1.5 font-body text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ color: "#9CA3AF" }}
            >
              2&times;
            </button>
          </div>
        </div>
      </div>

      {/* === MANUAL TAB CONTENT === */}
      {activeTab === "manual" && (
        <>
          {/* Flip button when idle */}
          <div className="hidden lg:block">
            {isIdle && !autoPlay.active && (
              <button
                type="button"
                onClick={onFlip}
                disabled={balance < config.betAmount || !config.sidePick}
                className="w-full h-9 rounded-lg font-body font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flip-btn-glow"
                style={{
                  backgroundColor: "#00E5A0",
                  color: "#0B0F1A",
                  boxShadow: "0 0 20px rgba(0, 229, 160, 0.2)",
                }}
              >
                Bet
              </button>
            )}

            {/* Flipping state */}
            {isFlipping && (
              <button
                type="button"
                disabled
                className="w-full h-9 rounded-lg font-body font-bold text-sm cursor-not-allowed"
                style={{
                  backgroundColor: "#374151",
                  color: "#9CA3AF",
                }}
              >
                <span className="flip-ellipsis">Flipping</span>
              </button>
            )}
          </div>

          {/* Side Selection */}
          <div
            className="rounded-lg p-3"
            style={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
            }}
          >
            <label
              className="font-body text-[10px] uppercase tracking-wider block mb-1"
              style={{ color: "#9CA3AF" }}
            >
              Pick Your Side
            </label>
            <div className="flex gap-2" role="radiogroup" aria-label="Pick your side">
              {(["heads", "tails", "random"] as const).map((side) => (
                <SideButton
                  key={side}
                  side={side}
                  selected={config.sidePick === side}
                  disabled={
                    phase === "flipping" || phase === "cashing_out" || autoPlay.active
                  }
                  onClick={() => dispatch({ type: "SET_SIDE_PICK", pick: side })}
                />
              ))}
            </div>
          </div>

          {/* During active streak — info display */}
          {isWon && streak && (
            <div
              className="w-full rounded-[10px] py-3 px-4 text-center"
              style={{
                backgroundColor: "#1F2937",
              }}
            >
              <span
                className="font-body text-sm font-semibold"
                style={{ color: "#F59E0B" }}
              >
                Streak: {streak.flips} flip{streak.flips !== 1 ? "s" : ""} &mdash;{" "}
                {formatFlipMultiplier(streak.currentMultiplier)}
              </span>
            </div>
          )}

          {/* Loss phase */}
          {phase === "lost" && (
            <div
              className="text-center text-sm font-body py-2"
              style={{ color: "#EF4444" }}
            >
              Wrong prediction! Resetting...
            </div>
          )}

          {/* Cashing out */}
          {phase === "cashing_out" && (
            <div
              className="text-center text-sm font-body py-2"
              style={{ color: "#00E5A0" }}
            >
              Cashing out...
            </div>
          )}

          {/* Current streak info (during round) */}
          {isRoundActive && streak && streak.flips >= 1 && phase !== "lost" && (
            <div
              className="rounded-lg p-3"
              style={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="font-body text-xs"
                  style={{ color: "#6B7280" }}
                >
                  Current Multiplier
                </span>
                <span
                  className="font-mono-stats text-2xl font-bold"
                  style={{
                    color: getFlipMultiplierColor(streak.flips),
                  }}
                >
                  {formatFlipMultiplier(streak.currentMultiplier)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="font-body text-xs"
                  style={{ color: "#6B7280" }}
                >
                  Payout
                </span>
                <span
                  className="font-mono-stats text-lg font-semibold"
                  style={{
                    color: getFlipMultiplierColor(streak.flips),
                  }}
                >
                  {formatCurrency(
                    Math.floor(
                      config.betAmount * streak.currentMultiplier * 100
                    ) / 100
                  )}
                </span>
              </div>
              <div
                className="text-center font-body text-xs mt-1"
                style={{ color: "#6B7280" }}
              >
                on {formatCurrency(config.betAmount)} bet
              </div>
            </div>
          )}
        </>
      )}

      {/* === AUTO TAB CONTENT === */}
      {activeTab === "auto" && (
        <div className="space-y-2">
          {/* Flips Per Round */}
          <div>
            <label
              className="font-body text-xs block mb-1.5"
              style={{ color: "#6B7280" }}
            >
              Flips Per Round
            </label>
            <input suppressHydrationWarning
              type="range"
              min={1}
              max={MAX_FLIPS}
              step={1}
              value={autoFlipsPerRound}
              onChange={(e) => setAutoFlipsPerRound(parseInt(e.target.value, 10))}
              disabled={autoPlay.active}
              className="w-full accent-pb-accent disabled:opacity-50"
              aria-label="Flips per round"
            />
            <div className="flex justify-between mt-0.5">
              {[1, 5, 10, 15, 20].map((tick) => (
                <span
                  key={tick}
                  className="font-mono-stats text-[9px]"
                  style={{
                    color:
                      autoFlipsPerRound >= tick ? "#00E5A0" : "#6B7280",
                  }}
                >
                  {tick}
                </span>
              ))}
            </div>
            <p
              className="text-center font-mono-stats text-xs mt-1"
              style={{ color: "#00E5A0" }}
            >
              {autoFlipsPerRound} flip{autoFlipsPerRound !== 1 ? "s" : ""} &rarr;{" "}
              {formatFlipMultiplier(getMultiplier(autoFlipsPerRound))}
            </p>
          </div>

          {/* Number of Bets */}
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
                  value={autoInfinite ? "" : autoCount}
                  placeholder={autoInfinite ? "∞" : undefined}
                  disabled={autoPlay.active || autoInfinite}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setAutoCount(Math.min(MAX_AUTO_ROUNDS, Math.max(1, val)));
                  }}
                  className="w-full bg-transparent font-mono-stats text-xs outline-none"
                  style={{ color: autoInfinite ? "#6B7280" : "#F9FAFB" }}
                  max={MAX_AUTO_ROUNDS}
                  min={1}
                  aria-label="Number of bets"
                />
              </div>
              <button
                type="button"
                disabled={autoPlay.active}
                onClick={() => {
                  if (autoInfinite) {
                    setAutoInfinite(false);
                    setAutoCount(100);
                  } else {
                    setAutoInfinite(true);
                  }
                }}
                className="w-8 h-8 rounded-md flex items-center justify-center font-mono-stats text-lg font-bold transition-colors"
                style={{
                  backgroundColor: autoInfinite ? "rgba(0,229,160,0.15)" : "#1F2937",
                  border: autoInfinite ? "1px solid rgba(0,229,160,0.3)" : "1px solid #374151",
                  color: autoInfinite ? "#00E5A0" : "#9CA3AF",
                  opacity: autoPlay.active ? 0.5 : 1,
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
          {!autoPlay.active && (
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
          {!autoPlay.active && (
            <div className="hidden lg:block">
              <button
                type="button"
                onClick={handleAutoPlayStart}
                disabled={!isIdle}
                className="w-full py-2.5 rounded-lg bg-pb-accent/15 text-pb-accent font-heading font-semibold text-sm border border-pb-accent/30 hover:bg-pb-accent/25 transition-colors disabled:opacity-40"
              >
                Start Autobet
              </button>
            </div>
          )}

          {/* Active summary */}
          {autoPlay.active && (
            <div className="bg-pb-bg-secondary border border-pb-border rounded-lg p-2.5 space-y-1.5">
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
                    <span className="text-pb-text-primary font-mono-stats capitalize">
                      {autoPlay.config.onWin === "reset"
                        ? "Reset"
                        : autoPlay.config.onWin === "increase"
                          ? `+${autoPlay.config.increaseOnWinPercent}%`
                          : autoPlay.config.onWin === "decrease"
                            ? `-${autoPlay.config.increaseOnWinPercent}%`
                            : "Same"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-pb-text-muted">On Loss</span>
                    <span className="text-pb-text-primary font-mono-stats capitalize">
                      {autoPlay.config.onLoss === "reset"
                        ? "Reset"
                        : autoPlay.config.onLoss === "increase"
                          ? `+${autoPlay.config.increaseOnLossPercent}%`
                          : autoPlay.config.onLoss === "decrease"
                            ? `-${autoPlay.config.increaseOnLossPercent}%`
                            : "Same"}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-pb-text-muted">Current Bet</span>
                <span className="text-pb-text-primary font-mono-stats">
                  {formatCurrency(config.betAmount)}
                </span>
              </div>
              {autoPlay.progress && (
                <div className="flex justify-between text-xs">
                  <span className="text-pb-text-muted">Rounds</span>
                  <span className="text-pb-text-primary font-mono-stats">
                    {autoPlay.progress.totalRounds !== null
                      ? `${autoPlay.progress.currentRound + 1}/${autoPlay.progress.totalRounds}`
                      : `${autoPlay.progress.currentRound + 1}`}
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
              <div className="border-t border-pb-border/50 pt-1.5 mt-1.5 flex justify-between text-xs font-bold">
                <span className="text-pb-text-muted">Session P&amp;L</span>
                <span
                  className="font-mono-stats"
                  style={{ color: autoPlayProfit >= 0 ? "#00E5A0" : "#EF4444" }}
                >
                  {autoPlayProfit >= 0 ? "+" : ""}
                  {formatCurrency(autoPlayProfit)}
                </span>
              </div>
            </div>
          )}
        </div>
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
        {autoPlay.active ? (
          <button
            type="button"
            onClick={() => dispatch({ type: "AUTO_PLAY_STOP" })}
            className="w-full h-11 rounded-lg bg-pb-danger text-white font-heading font-bold text-sm transition-all active:scale-[0.98]"
          >
            Stop Auto
          </button>
        ) : activeTab === "manual" ? (
          <button
            type="button"
            onClick={onFlip}
            disabled={isFlipping || balance < config.betAmount || !config.sidePick}
            className="w-full h-11 rounded-lg font-heading font-bold text-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed"
            style={{
              backgroundColor: isFlipping || !config.sidePick ? "#374151" : "#00E5A0",
              color: isFlipping || !config.sidePick ? "#9CA3AF" : "#0B0F1A",
              boxShadow: !isFlipping && config.sidePick && balance >= config.betAmount ? "0 0 16px rgba(0, 229, 160, 0.2)" : "none",
            }}
          >
            {isFlipping ? "Flipping..." : "Bet"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAutoPlayStart}
            disabled={!isIdle}
            className="w-full h-11 rounded-lg font-heading font-bold text-sm border transition-colors disabled:opacity-40"
            style={{
              backgroundColor: "rgba(0, 229, 160, 0.15)",
              color: "#00E5A0",
              borderColor: "rgba(0, 229, 160, 0.3)",
            }}
          >
            Start Autobet
          </button>
        )}
      </div>

      {/* Session Reminder */}
      {state.showSessionReminder && (
        <div
          className="rounded-lg px-2.5 py-1.5 text-[10px]"
          style={{
            backgroundColor: "#111827",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#9CA3AF",
          }}
        >
          <p>
            {state.sessionBetCount} rounds played — practice mode.
          </p>
          <button
            type="button"
            onClick={() => dispatch({ type: "DISMISS_SESSION_REMINDER" })}
            className="text-xs mt-1 hover:underline"
            style={{ color: "#F59E0B" }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Keyboard hints */}
      <div className="hidden lg:block text-center text-xs" style={{ color: "#6B7280" }}>
        Press{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-pb-bg-tertiary border border-pb-border font-mono-stats text-[10px]">
          Space
        </kbd>{" "}
        to flip |{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-pb-bg-tertiary border border-pb-border font-mono-stats text-[10px]">
          C
        </kbd>{" "}
        cash out
      </div>
    </div>
  );
}
