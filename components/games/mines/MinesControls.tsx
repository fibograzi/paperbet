"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Shuffle,
  Zap,
} from "lucide-react";
import type { MinesGameState, MinesAction, MinesAutoPlayState, MinesStrategy } from "./minesTypes";
import { useBetInput } from "@/lib/useBetInput";
import {
  formatMinesMultiplier,
  getMultiplier,
  maxGems,
} from "./minesCalculator";
import { formatCurrency, cn } from "@/lib/utils";
import BalanceBar from "@/components/shared/BalanceBar";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MinesControlsProps {
  state: MinesGameState;
  dispatch: React.Dispatch<MinesAction>;
  onStartGame: () => void;
  onCashOut: () => void;
  onNewGame: () => void;
  onPickRandom: () => void;
  onStartAutoPlay: (
    config: Omit<MinesAutoPlayState, "active" | "currentCount" | "startingNetProfit">,
  ) => void;
  onStopAutoPlay: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AUTO_REVEAL_PRESETS = [1, 3, 5, 10];
const INCREASE_PRESETS = [25, 50, 100, 200];
const DECREASE_PRESETS = [10, 25, 50, 75];

type WinLossAction = "same" | "increase" | "decrease" | "reset";

// ---------------------------------------------------------------------------
// Strategy definitions
// ---------------------------------------------------------------------------

interface StrategyDef {
  id: MinesStrategy;
  label: string;
  description: string;
  behavior: string;
  risk: "low" | "medium" | "high";
}

const STRATEGY_DEFS: StrategyDef[] = [
  {
    id: "martingale",
    label: "Martingale",
    description: "Double bet on every loss. Reset to base on win.",
    behavior: "Loss: ×2  ·  Win: Reset",
    risk: "high",
  },
  {
    id: "anti_martingale",
    label: "Anti-Martingale",
    description: "Double bet on every win. Reset to base on loss.",
    behavior: "Win: ×2  ·  Loss: Reset",
    risk: "high",
  },
  {
    id: "dalembert",
    label: "D'Alembert",
    description: "Increase by 1 unit on loss, decrease by 1 unit on win.",
    behavior: "Loss: +1 unit  ·  Win: −1 unit",
    risk: "medium",
  },
  {
    id: "fibonacci",
    label: "Fibonacci",
    description: "Follow the Fibonacci sequence on losses. Step back 2 on win.",
    behavior: "1 → 1 → 2 → 3 → 5 → 8 → 13…",
    risk: "medium",
  },
  {
    id: "paroli",
    label: "Paroli",
    description: "Double on win up to 3 consecutive wins, then reset.",
    behavior: "Win (×3 max): ×2  ·  Loss: Reset",
    risk: "low",
  },
  {
    id: "custom",
    label: "Custom",
    description: "Configure On Win and On Loss rules manually.",
    behavior: "",
    risk: "medium",
  },
];

const RISK_COLORS: Record<"low" | "medium" | "high", { bg: string; text: string; label: string }> = {
  low:    { bg: "rgba(0, 229, 160, 0.12)",  text: "#00E5A0", label: "Low Risk" },
  medium: { bg: "rgba(245, 158, 11, 0.12)", text: "#F59E0B", label: "Medium Risk" },
  high:   { bg: "rgba(239, 68, 68, 0.12)",  text: "#EF4444", label: "High Risk" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MinesControls({
  state,
  dispatch,
  onStartGame,
  onCashOut,
  onNewGame,
  onPickRandom,
  onStartAutoPlay,
  onStopAutoPlay,
}: MinesControlsProps) {
  const {
    phase,
    betAmount,
    mineCount,
    balance,
    gemsRevealed,
    currentMultiplier,
    autoPlay,
    postRevealPhase,
    speedMode,
  } = state;

  // Tab & UI state
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");
  const [numberOfBetsInput, setNumberOfBetsInput] = useState("10");
  const [isInfinite, setIsInfinite] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-play local state
  const [autoCount, setAutoCount] = useState<number | null>(10);
  const [autoRevealTarget, setAutoRevealTarget] = useState(5);
  const [autoStrategy, setAutoStrategy] = useState<MinesStrategy>("martingale");
  const [autoOnWin, setAutoOnWin] = useState<WinLossAction>("reset");
  const [autoOnLoss, setAutoOnLoss] = useState<WinLossAction>("reset");
  const [increaseOnWinPercent, setIncreaseOnWinPercent] = useState(50);
  const [increaseOnLossPercent, setIncreaseOnLossPercent] = useState(100);
  const [stopOnProfitEnabled, setStopOnProfitEnabled] = useState(false);
  const [stopOnLossEnabled, setStopOnLossEnabled] = useState(false);
  const [stopOnProfitAmount, setStopOnProfitAmount] = useState(100);
  const [stopOnLossAmount, setStopOnLossAmount] = useState(50);

  const betInputRef = useRef<HTMLInputElement>(null);

  const controlsDisabled = phase === "PLAYING" || phase === "GAME_OVER";
  const isPlaying = phase === "PLAYING";
  const isGameOver = phase === "GAME_OVER";
  const isIdle = phase === "IDLE";

  const safeGems = maxGems(mineCount);

  // Ensure auto-reveal target doesn't exceed max gems
  useEffect(() => {
    if (autoRevealTarget > safeGems) {
      setAutoRevealTarget(safeGems);
    }
  }, [mineCount, safeGems, autoRevealTarget]);

  // Auto-switch to auto tab when auto-play becomes active
  useEffect(() => {
    if (autoPlay.active) setActiveTab("auto");
  }, [autoPlay.active]);

  // Spacebar shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        e.preventDefault();

        if (isIdle && !autoPlay.active) {
          onStartGame();
        } else if (isPlaying && gemsRevealed >= 1 && !autoPlay.active) {
          onCashOut();
        } else if (isGameOver && !postRevealPhase && !autoPlay.active) {
          onNewGame();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isIdle, isPlaying, isGameOver, gemsRevealed, postRevealPhase, autoPlay.active, onStartGame, onCashOut, onNewGame]);

  // --- Bet Amount Handlers ---
  const setBet = useCallback(
    (amount: number) => {
      dispatch({
        type: "SET_BET_AMOUNT",
        amount: Math.max(0.1, Math.min(1000, amount)),
      });
    },
    [dispatch],
  );

  const betInput = useBetInput(betAmount, setBet);

  // --- Mine Count Handlers ---
  const setMines = useCallback(
    (count: number) => {
      dispatch({ type: "SET_MINE_COUNT", count });
    },
    [dispatch],
  );

  // --- Number of Bets input handler ---
  const handleNumberOfBetsChange = useCallback((value: string) => {
    setNumberOfBetsInput(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      const capped = Math.min(500, parsed);
      setAutoCount(capped);
      if (capped < parsed) setNumberOfBetsInput(String(capped));
    }
  }, []);

  // --- Infinity toggle ---
  const savedBetsRef = useRef(numberOfBetsInput);
  const toggleInfinite = useCallback(() => {
    setIsInfinite((prev) => {
      if (!prev) {
        // Going infinite — save current value
        savedBetsRef.current = numberOfBetsInput;
        setAutoCount(null);
        return true;
      } else {
        // Coming back from infinite — restore
        setNumberOfBetsInput(savedBetsRef.current);
        const parsed = parseInt(savedBetsRef.current, 10);
        setAutoCount(!isNaN(parsed) && parsed >= 1 ? Math.min(500, parsed) : 10);
        return false;
      }
    });
  }, [numberOfBetsInput]);

  // --- Auto-play start ---
  const handleStartAutoPlay = useCallback(() => {
    onStartAutoPlay({
      totalCount: isInfinite ? null : Math.min(500, autoCount ?? 10),
      autoRevealTarget,
      strategy: autoStrategy,
      onWin: autoOnWin,
      onLoss: autoOnLoss,
      increaseOnWinPercent,
      increaseOnLossPercent,
      baseBet: betAmount,
      stopOnProfit: stopOnProfitEnabled ? stopOnProfitAmount : null,
      stopOnLoss: stopOnLossEnabled ? stopOnLossAmount : null,
    });
  }, [
    isInfinite,
    autoCount,
    autoRevealTarget,
    autoStrategy,
    autoOnWin,
    autoOnLoss,
    increaseOnWinPercent,
    increaseOnLossPercent,
    betAmount,
    stopOnProfitEnabled,
    stopOnProfitAmount,
    stopOnLossEnabled,
    stopOnLossAmount,
    onStartAutoPlay,
  ]);

  // --- Total profit calculation ---
  const multiplier = gemsRevealed > 0 ? currentMultiplier : 1;
  const totalProfit =
    isIdle || gemsRevealed === 0
      ? 0
      : betAmount * currentMultiplier - betAmount;

  // --- Render ---
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Balance */}
      <BalanceBar balance={balance} onReset={() => dispatch({ type: "RESET_BALANCE" })} />

      {/* Tab Switcher */}
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

      {/* Merged: Bet Amount + Mines + Gems */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-lg p-3">
        {/* Bet Amount */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-pb-text-muted mb-1 block">
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
                ref={betInputRef}
                type="text"
                inputMode="decimal"
                value={betInput.value}
                onChange={betInput.onChange}
                onFocus={betInput.onFocus}
                onBlur={betInput.onBlur}
                onKeyDown={betInput.onKeyDown}
                disabled={controlsDisabled || autoPlay.active}
                className="flex-1 bg-transparent font-mono-stats text-sm text-right outline-none"
                style={{ color: "#F9FAFB" }}
                aria-label="Bet amount"
              />
            </div>
            <div className="w-px self-stretch" style={{ backgroundColor: "#374151" }} />
            <div className="flex items-center shrink-0" style={{ backgroundColor: "#263040" }}>
              <button
                type="button"
                disabled={controlsDisabled || autoPlay.active}
                onClick={() => setBet(betAmount / 2)}
                className="px-2.5 py-1.5 font-body text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
                style={{ color: "#9CA3AF" }}
              >
                &frac12;
              </button>
              <div className="w-px h-4 shrink-0" style={{ backgroundColor: "#374151" }} />
              <button
                type="button"
                disabled={controlsDisabled || autoPlay.active}
                onClick={() => setBet(betAmount * 2)}
                className="px-2.5 py-1.5 font-body text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
                style={{ color: "#9CA3AF" }}
              >
                2&times;
              </button>
            </div>
          </div>
        </div>

        {/* Mines Dropdown */}
        <div className="mt-2.5">
          <label className="text-[10px] uppercase tracking-wider text-pb-text-muted mb-1 block">
            Mines
          </label>
          <div className="relative">
            <select
              value={mineCount}
              disabled={controlsDisabled || autoPlay.active}
              onChange={(e) => setMines(parseInt(e.target.value, 10))}
              className="w-full bg-pb-bg-tertiary border border-pb-border py-1.5 px-2.5 text-xs rounded-md font-mono-stats text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
            >
              {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Gems Read-only Field */}
        <div className="mt-2.5 opacity-70">
          <label className="text-[10px] uppercase tracking-wider text-pb-text-muted mb-1 block">
            Gems
          </label>
          <div className="w-full bg-pb-bg-tertiary border border-pb-border py-1.5 px-2.5 text-xs rounded-md font-mono-stats text-pb-text-primary">
            {safeGems}
          </div>
        </div>
      </div>

      {/* ===== MANUAL TAB ===== */}
      {activeTab === "manual" && (
        <>
          {/* Action Button (desktop only — mobile uses fixed bar) */}
          <div className="hidden lg:block">
            {renderActionButton()}
          </div>

          {/* Pick Random Button */}
          <button
            type="button"
            disabled={!isPlaying || state.revealingTile !== null || autoPlay.active}
            onClick={onPickRandom}
            className="w-full h-9 rounded-lg bg-pb-bg-tertiary border border-pb-border text-sm text-pb-text-secondary font-body hover:bg-[#374151] hover:text-pb-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Shuffle size={14} />
            Random Pick
          </button>

          {/* Total Profit */}
          <div className="bg-pb-bg-secondary border border-pb-border rounded-lg p-3">
            <label className="text-[10px] uppercase tracking-wider text-pb-text-muted mb-1 block">
              Total Profit ({formatMinesMultiplier(multiplier)})
            </label>
            <div
              className={cn(
                "w-full bg-pb-bg-tertiary border border-pb-border py-1.5 px-2.5 text-xs rounded-md font-mono-stats",
                totalProfit > 0
                  ? "text-pb-accent"
                  : totalProfit < 0
                    ? "text-pb-danger"
                    : "text-pb-text-primary",
              )}
            >
              {formatCurrency(totalProfit)}
            </div>
          </div>
        </>
      )}

      {/* ===== AUTO TAB ===== */}
      {activeTab === "auto" && (
        <>
          {/* Number of Bets */}
          <div className="bg-pb-bg-secondary border border-pb-border rounded-lg p-2.5">
            <label className="text-[10px] uppercase tracking-wider text-pb-text-muted mb-1 block">
              Number of Bets
            </label>
            <div className="flex items-center gap-2">
              <input suppressHydrationWarning
                type="number"
                min={1}
                max={500}
                value={isInfinite ? "" : numberOfBetsInput}
                placeholder={isInfinite ? "∞" : ""}
                onChange={(e) => handleNumberOfBetsChange(e.target.value)}
                disabled={autoPlay.active || isInfinite}
                className="flex-1 bg-pb-bg-tertiary border border-pb-border py-1.5 px-2.5 text-xs rounded-md font-mono-stats text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={autoPlay.active}
                onClick={toggleInfinite}
                className={cn(
                  "w-8 h-8 rounded-md border flex items-center justify-center font-mono-stats text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  isInfinite
                    ? "bg-pb-accent/15 border-pb-accent/30 text-pb-accent"
                    : "bg-pb-bg-tertiary border-pb-border text-pb-text-muted hover:text-pb-text-primary",
                )}
              >
                ∞
              </button>
            </div>
          </div>

          {/* Tiles to Reveal */}
          <div className="bg-pb-bg-secondary border border-pb-border rounded-lg p-2.5">
            <label className="text-[10px] uppercase tracking-wider text-pb-text-muted block mb-1">
              Tiles to Reveal (then auto-cashout)
            </label>
            <div className="flex items-center gap-2">
              <input suppressHydrationWarning
                type="number"
                min={1}
                max={safeGems}
                value={autoRevealTarget}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1)
                    setAutoRevealTarget(Math.min(safeGems, val));
                }}
                disabled={autoPlay.active}
                className="w-16 bg-pb-bg-tertiary border border-pb-border rounded-lg py-1 px-2 text-center font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50"
              />
              <div className="flex gap-1 flex-1">
                {AUTO_REVEAL_PRESETS.filter((n) => n <= safeGems).map(
                  (count) => (
                    <button
                      key={count}
                      type="button"
                      disabled={autoPlay.active}
                      onClick={() => setAutoRevealTarget(count)}
                      className={cn(
                        "flex-1 py-1 text-xs font-mono-stats rounded-md border disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                        autoRevealTarget === count
                          ? "bg-pb-accent/15 border-pb-accent/30 text-pb-accent"
                          : "bg-pb-bg-tertiary border-pb-border text-pb-text-muted hover:text-pb-text-primary",
                      )}
                    >
                      {count}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  disabled={autoPlay.active}
                  onClick={() => setAutoRevealTarget(safeGems)}
                  className={cn(
                    "flex-1 py-1 text-xs font-mono-stats rounded-md border disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                    autoRevealTarget === safeGems
                      ? "bg-pb-accent/15 border-pb-accent/30 text-pb-accent"
                      : "bg-pb-bg-tertiary border-pb-border text-pb-text-muted hover:text-pb-text-primary",
                  )}
                >
                  Max
                </button>
              </div>
            </div>
            <p className="text-[10px] text-pb-text-muted mt-1">
              Cashout at:{" "}
              {formatMinesMultiplier(
                getMultiplier(autoRevealTarget, mineCount),
              )}
            </p>
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
                      {STRATEGY_DEFS.map((s) => {
                        const active = autoStrategy === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setAutoStrategy(s.id)}
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

                  {/* Strategy description card (all presets) */}
                  {autoStrategy !== "custom" && (() => {
                    const def = STRATEGY_DEFS.find((s) => s.id === autoStrategy)!;
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
                        <p
                          className="text-[10px] font-mono-stats"
                          style={{ color: "#6B7280" }}
                        >
                          {def.behavior}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Custom: On Win / On Loss controls */}
                  {autoStrategy === "custom" && (
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
                                backgroundColor:
                                  autoOnWin === opt.value ? "rgba(0, 229, 160, 0.15)" : "#1F2937",
                                color: autoOnWin === opt.value ? "#00E5A0" : "#9CA3AF",
                                border:
                                  autoOnWin === opt.value
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
                                    backgroundColor:
                                      increaseOnWinPercent === pct ? "rgba(0, 229, 160, 0.15)" : "#1F2937",
                                    color: increaseOnWinPercent === pct ? "#00E5A0" : "#9CA3AF",
                                    border:
                                      increaseOnWinPercent === pct
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
                                backgroundColor:
                                  autoOnLoss === opt.value ? "rgba(239, 68, 68, 0.15)" : "#1F2937",
                                color: autoOnLoss === opt.value ? "#EF4444" : "#9CA3AF",
                                border:
                                  autoOnLoss === opt.value
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
                                    backgroundColor:
                                      increaseOnLossPercent === pct ? "rgba(239, 68, 68, 0.15)" : "#1F2937",
                                    color: increaseOnLossPercent === pct ? "#EF4444" : "#9CA3AF",
                                    border:
                                      increaseOnLossPercent === pct
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

          {/* Start Autobet / Active summary */}
          {!autoPlay.active && (
            <button
              type="button"
              disabled={phase !== "IDLE"}
              onClick={handleStartAutoPlay}
              className="w-full h-10 rounded-lg bg-pb-accent/15 border border-pb-accent/30 text-pb-accent font-heading font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-pb-accent/25"
            >
              Start Autobet
            </button>
          )}

          {autoPlay.active && (
            <>
              {/* Strategy Summary */}
              <div className="bg-pb-bg-secondary border border-pb-border rounded-lg p-2.5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-pb-text-muted">Strategy</span>
                  <span className="text-pb-text-primary font-mono-stats capitalize">
                    {STRATEGY_DEFS.find((s) => s.id === autoPlay.strategy)?.label ?? "Custom"}
                  </span>
                </div>
                {autoPlay.strategy === "custom" && (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-pb-text-muted">On Win</span>
                      <span className="text-pb-text-primary font-mono-stats">
                        {autoPlay.onWin === "reset"
                          ? "Reset"
                          : autoPlay.onWin === "increase"
                            ? `+${autoPlay.increaseOnWinPercent}%`
                            : autoPlay.onWin === "decrease"
                              ? `-${autoPlay.increaseOnWinPercent}%`
                              : "Same"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-pb-text-muted">On Loss</span>
                      <span className="text-pb-text-primary font-mono-stats">
                        {autoPlay.onLoss === "reset"
                          ? "Reset"
                          : autoPlay.onLoss === "increase"
                            ? `+${autoPlay.increaseOnLossPercent}%`
                            : autoPlay.onLoss === "decrease"
                              ? `-${autoPlay.increaseOnLossPercent}%`
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
                <div className="flex justify-between text-xs">
                  <span className="text-pb-text-muted">Rounds</span>
                  <span className="text-pb-text-primary font-mono-stats">
                    {autoPlay.totalCount
                      ? `${autoPlay.currentCount}/${autoPlay.totalCount}`
                      : `${autoPlay.currentCount}`}
                  </span>
                </div>
                {(autoPlay.stopOnProfit !== null || autoPlay.stopOnLoss !== null) && (
                  <div className="border-t border-pb-border/50 pt-1.5 mt-1.5">
                    {autoPlay.stopOnProfit !== null && (
                      <div className="flex justify-between text-xs">
                        <span className="text-pb-text-muted">Stop Profit</span>
                        <span className="text-pb-accent font-mono-stats">
                          {formatCurrency(autoPlay.stopOnProfit)}
                        </span>
                      </div>
                    )}
                    {autoPlay.stopOnLoss !== null && (
                      <div className="flex justify-between text-xs">
                        <span className="text-pb-text-muted">Stop Loss</span>
                        <span className="text-pb-danger font-mono-stats">
                          {formatCurrency(autoPlay.stopOnLoss)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Live P/L */}
              <div className="flex justify-between items-center bg-pb-bg-secondary border border-pb-border rounded-lg px-2.5 py-2">
                <span className="text-xs text-pb-text-muted">Session P/L</span>
                <span
                  className={cn(
                    "font-mono-stats text-sm font-semibold",
                    state.stats.netProfit - autoPlay.startingNetProfit > 0
                      ? "text-pb-accent"
                      : state.stats.netProfit - autoPlay.startingNetProfit < 0
                        ? "text-pb-danger"
                        : "text-pb-text-secondary"
                  )}
                >
                  {state.stats.netProfit - autoPlay.startingNetProfit >= 0 ? "+" : ""}
                  {formatCurrency(state.stats.netProfit - autoPlay.startingNetProfit)}
                </span>
              </div>

              {/* Stop Autobet */}
              <button
                type="button"
                onClick={onStopAutoPlay}
                className="w-full h-10 rounded-lg bg-pb-danger/20 border border-pb-danger/30 text-pb-danger font-heading font-bold text-sm transition-colors hover:bg-pb-danger/30"
              >
                Stop Autobet
              </button>
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
        {renderActionButton()}
      </div>

    </div>
  );

  // -------------------------------------------------------------------------
  // Action button renderer
  // -------------------------------------------------------------------------

  function renderActionButton() {
    // Auto-playing status button
    if (autoPlay.active && !isPlaying) {
      const countLabel = autoPlay.totalCount
        ? `${autoPlay.currentCount + 1}/${autoPlay.totalCount}`
        : `${autoPlay.currentCount + 1}`;
      return (
        <button
          type="button"
          disabled
          className="w-full h-9 rounded-lg bg-pb-accent/15 text-pb-accent font-heading font-bold text-sm cursor-default border border-pb-accent/30"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pb-accent animate-pulse" />
            Auto-Playing ({countLabel})
          </span>
        </button>
      );
    }

    // IDLE → Bet button (no dollar amount subtitle)
    if (isIdle) {
      return (
        <button
          type="button"
          onClick={onStartGame}
          disabled={balance < betAmount}
          className="w-full h-9 rounded-lg bg-pb-accent text-[#0B0F1A] font-heading font-bold text-sm hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ boxShadow: "0 0 20px rgba(0, 229, 160, 0.2)" }}
        >
          Bet
        </button>
      );
    }

    // PLAYING, 0 gems → disabled cashout
    if (isPlaying && gemsRevealed === 0) {
      return (
        <button
          type="button"
          disabled
          className="w-full h-9 rounded-lg bg-[#374151] text-[#6B7280] font-heading font-bold text-sm cursor-not-allowed"
        >
          <span className="block">Cash Out</span>
          <span className="block text-xs -mt-0.5">Reveal a tile first</span>
        </button>
      );
    }

    // PLAYING, 1+ gems → active cashout
    if (isPlaying && gemsRevealed >= 1) {
      const cashoutAmount = betAmount * currentMultiplier;
      return (
        <button
          type="button"
          onClick={onCashOut}
          disabled={autoPlay.active}
          className="w-full h-9 rounded-lg bg-pb-warning text-[#0B0F1A] font-heading font-bold text-sm hover:brightness-110 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all mines-cashout-pulse"
          style={{ boxShadow: "0 0 20px rgba(245, 158, 11, 0.3)" }}
        >
          <span className="block">Cash Out</span>
          <span className="block text-xs font-mono-stats -mt-0.5">
            {formatMinesMultiplier(currentMultiplier)} —{" "}
            {formatCurrency(cashoutAmount)}
          </span>
        </button>
      );
    }

    // GAME OVER → New Game
    if (isGameOver) {
      return (
        <button
          type="button"
          onClick={onNewGame}
          disabled={postRevealPhase}
          className="w-full h-9 rounded-lg bg-pb-accent text-[#0B0F1A] font-heading font-bold text-sm hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          New Game
        </button>
      );
    }

    return null;
  }
}
