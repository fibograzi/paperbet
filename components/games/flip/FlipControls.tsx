"use client";

import { useCallback, useState, useEffect } from "react";
import { Crown, Diamond, Shuffle, Infinity, Zap, ChevronDown } from "lucide-react";
import { useBetInput } from "@/lib/useBetInput";
import type {
  FlipGameState,
  FlipAction,
  FlipAutoPlayConfig,
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
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_AUTO_ROUNDS = 500;

type WinLossAction = "reset" | "increase";
type Tab = "manual" | "auto";
const INCREASE_PRESETS = [25, 50, 100, 200];

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
}: FlipControlsProps) {
  const { phase, config, balance, streak, autoPlay, speedMode } = state;

  const [activeTab, setActiveTab] = useState<Tab>("manual");

  // Auto-play local state
  const [autoFlipsPerRound, setAutoFlipsPerRound] = useState(1);
  const [autoCount, setAutoCount] = useState(10);
  const [autoOnWin, setAutoOnWin] = useState<WinLossAction>("reset");
  const [autoOnLoss, setAutoOnLoss] = useState<WinLossAction>("reset");
  const [increaseOnWinPercent, setIncreaseOnWinPercent] = useState(50);
  const [increaseOnLossPercent, setIncreaseOnLossPercent] = useState(100);
  const [stopOnProfitEnabled, setStopOnProfitEnabled] = useState(false);
  const [stopOnLossEnabled, setStopOnLossEnabled] = useState(false);
  const [stopOnProfitAmount, setStopOnProfitAmount] = useState(100);
  const [stopOnLossAmount, setStopOnLossAmount] = useState(50);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      totalCount: autoCount,
      onWin: autoOnWin,
      onLoss: autoOnLoss,
      increaseOnWinPercent,
      increaseOnLossPercent,
      baseBet: config.betAmount,
      stopOnProfit: stopOnProfitEnabled ? stopOnProfitAmount : null,
      stopOnLoss: stopOnLossEnabled ? stopOnLossAmount : null,
    };
    dispatch({ type: "AUTO_PLAY_START", config: autoConfig });
  }, [
    autoFlipsPerRound,
    autoCount,
    autoOnWin,
    autoOnLoss,
    increaseOnWinPercent,
    increaseOnLossPercent,
    config.betAmount,
    stopOnProfitEnabled,
    stopOnProfitAmount,
    stopOnLossEnabled,
    stopOnLossAmount,
    dispatch,
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
          <div>
            <label
              className="font-body text-xs block mb-1.5"
              style={{ color: "#6B7280" }}
            >
              Number of Bets
            </label>
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <input suppressHydrationWarning
                  type="number"
                  min={1}
                  max={MAX_AUTO_ROUNDS}
                  value={autoCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1)
                      setAutoCount(Math.min(MAX_AUTO_ROUNDS, val));
                  }}
                  disabled={autoPlay.active}
                  className="w-full rounded-md py-1.5 px-2.5 text-right font-mono-stats text-xs text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                  }}
                  aria-label="Number of bets"
                />
              </div>
              <button
                type="button"
                disabled={autoPlay.active}
                onClick={() => setAutoCount(MAX_AUTO_ROUNDS)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor:
                    autoCount === MAX_AUTO_ROUNDS
                      ? "rgba(0, 229, 160, 0.15)"
                      : "#1F2937",
                  border:
                    autoCount === MAX_AUTO_ROUNDS
                      ? "1px solid rgba(0, 229, 160, 0.3)"
                      : "1px solid #374151",
                  color: autoCount === MAX_AUTO_ROUNDS ? "#00E5A0" : "#9CA3AF",
                }}
                aria-label="Set maximum rounds"
              >
                <Infinity size={16} />
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

          {/* Advanced (collapsible) */}
          <div className="rounded-lg border border-pb-border">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-2.5 py-2"
            >
              <span className="font-body text-xs text-pb-text-secondary">Advanced</span>
              <ChevronDown
                size={14}
                className={cn(
                  "text-pb-text-muted transition-transform",
                  showAdvanced ? "rotate-180" : "",
                )}
              />
            </button>
            {showAdvanced && (
              <div className="px-2.5 pb-2.5 space-y-2">
                {/* On Win */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-pb-text-muted block mb-1">
                    On Win
                  </label>
                  <div className="flex gap-1.5">
                    {(["reset", "increase"] as const).map((action) => (
                      <button
                        key={action}
                        type="button"
                        disabled={autoPlay.active}
                        onClick={() => setAutoOnWin(action)}
                        className={cn(
                          "flex-1 py-1 text-xs font-body rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                          autoOnWin === action
                            ? "bg-pb-accent/15 border-pb-accent/30 text-pb-accent"
                            : "bg-pb-bg-tertiary border-pb-border text-pb-text-muted hover:text-pb-text-primary",
                        )}
                      >
                        {action === "reset" ? "Reset" : "Increase"}
                      </button>
                    ))}
                  </div>
                  {autoOnWin === "increase" && (
                    <div className="mt-1.5">
                      <div className="flex gap-1">
                        {INCREASE_PRESETS.map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            disabled={autoPlay.active}
                            onClick={() => setIncreaseOnWinPercent(pct)}
                            className={cn(
                              "flex-1 py-1 text-[10px] font-mono-stats rounded border disabled:opacity-50 transition-colors",
                              increaseOnWinPercent === pct
                                ? "bg-pb-accent/15 border-pb-accent/30 text-pb-accent"
                                : "bg-pb-bg-tertiary border-pb-border text-pb-text-muted",
                            )}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                      <input suppressHydrationWarning
                        type="number"
                        min={1}
                        max={10000}
                        value={increaseOnWinPercent}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1)
                            setIncreaseOnWinPercent(Math.min(10000, val));
                        }}
                        disabled={autoPlay.active}
                        className="mt-1 w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-1.5 pl-3 pr-8 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50"
                        aria-label="Increase on win percentage"
                      />
                    </div>
                  )}
                </div>

                {/* On Loss */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-pb-text-muted block mb-1">
                    On Loss
                  </label>
                  <div className="flex gap-1.5">
                    {(["reset", "increase"] as const).map((action) => (
                      <button
                        key={action}
                        type="button"
                        disabled={autoPlay.active}
                        onClick={() => setAutoOnLoss(action)}
                        className={cn(
                          "flex-1 py-1 text-xs font-body rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                          autoOnLoss === action
                            ? "bg-pb-accent/15 border-pb-accent/30 text-pb-accent"
                            : "bg-pb-bg-tertiary border-pb-border text-pb-text-muted hover:text-pb-text-primary",
                        )}
                      >
                        {action === "reset" ? "Reset" : "Increase"}
                      </button>
                    ))}
                  </div>
                  {autoOnLoss === "increase" && (
                    <div className="mt-1.5">
                      <div className="flex gap-1">
                        {INCREASE_PRESETS.map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            disabled={autoPlay.active}
                            onClick={() => setIncreaseOnLossPercent(pct)}
                            className={cn(
                              "flex-1 py-1 text-[10px] font-mono-stats rounded border disabled:opacity-50 transition-colors",
                              increaseOnLossPercent === pct
                                ? "bg-pb-accent/15 border-pb-accent/30 text-pb-accent"
                                : "bg-pb-bg-tertiary border-pb-border text-pb-text-muted",
                            )}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                      <input suppressHydrationWarning
                        type="number"
                        min={1}
                        max={10000}
                        value={increaseOnLossPercent}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1)
                            setIncreaseOnLossPercent(Math.min(10000, val));
                        }}
                        disabled={autoPlay.active}
                        className="mt-1 w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-1.5 pl-3 pr-8 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50"
                        aria-label="Increase on loss percentage"
                      />
                    </div>
                  )}
                </div>

                {/* Stop on Profit */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-pb-text-muted cursor-pointer">
                    <input suppressHydrationWarning
                      type="checkbox"
                      checked={stopOnProfitEnabled}
                      onChange={(e) => setStopOnProfitEnabled(e.target.checked)}
                      disabled={autoPlay.active}
                      className="accent-pb-accent"
                    />
                    Stop on Profit ≥
                  </label>
                  <input suppressHydrationWarning
                    type="number"
                    min={1}
                    value={stopOnProfitAmount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val > 0) setStopOnProfitAmount(val);
                    }}
                    disabled={autoPlay.active || !stopOnProfitEnabled}
                    className="w-20 bg-pb-bg-tertiary border border-pb-border rounded py-1 px-2 text-right font-mono-stats text-xs text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50"
                  />
                </div>

                {/* Stop on Loss */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-pb-text-muted cursor-pointer">
                    <input suppressHydrationWarning
                      type="checkbox"
                      checked={stopOnLossEnabled}
                      onChange={(e) => setStopOnLossEnabled(e.target.checked)}
                      disabled={autoPlay.active}
                      className="accent-pb-accent"
                    />
                    Stop on Loss ≥
                  </label>
                  <input suppressHydrationWarning
                    type="number"
                    min={1}
                    value={stopOnLossAmount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val > 0) setStopOnLossAmount(val);
                    }}
                    disabled={autoPlay.active || !stopOnLossEnabled}
                    className="w-20 bg-pb-bg-tertiary border border-pb-border rounded py-1 px-2 text-right font-mono-stats text-xs text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50"
                  />
                </div>
              </div>
            )}
          </div>
          {/* Start / Stop Auto-Play button */}
          <div className="hidden lg:block">
            {autoPlay.active ? (
              <button
                type="button"
                onClick={() => dispatch({ type: "AUTO_PLAY_STOP" })}
                className="w-full h-9 rounded-lg font-body font-bold text-sm transition-colors hover:brightness-110"
                style={{
                  backgroundColor: "#EF4444",
                  color: "#F9FAFB",
                }}
              >
                Stop Auto
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAutoPlayStart}
                disabled={!isIdle}
                className="w-full h-9 rounded-lg font-body font-bold text-sm transition-colors hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#00E5A0",
                  color: "#0B0F1A",
                }}
              >
                Start Autobet
              </button>
            )}
          </div>

          {/* Auto-play counter */}
          {autoPlay.active && autoPlay.progress && (
            <div
              className="text-center text-xs font-mono-stats py-1"
              style={{ color: "#9CA3AF" }}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: "#00E5A0" }}
                />
                Round {autoPlay.progress.currentRound + 1}
                {autoPlay.progress.totalRounds
                  ? ` / ${autoPlay.progress.totalRounds}`
                  : ""}{" "}
                &mdash; W: {autoPlay.progress.wins} | L:{" "}
                {autoPlay.progress.losses}
              </span>
            </div>
          )}

          {/* Auto-play session P/L */}
          {autoPlay.active && (
            <div className="flex justify-between items-center bg-pb-bg-tertiary rounded-lg px-3 py-2">
              <span
                className="font-body text-xs"
                style={{ color: "#6B7280" }}
              >
                Session P/L
              </span>
              <span
                className={cn(
                  "font-mono-stats text-sm font-semibold",
                  autoPlayProfit > 0
                    ? "text-pb-accent"
                    : autoPlayProfit < 0
                      ? "text-pb-danger"
                      : "text-pb-text-secondary"
                )}
              >
                {autoPlayProfit >= 0 ? "+" : ""}
                {formatCurrency(autoPlayProfit)}
              </span>
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
