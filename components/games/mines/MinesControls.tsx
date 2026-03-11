"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Shuffle,
  ChevronDown,
} from "lucide-react";
import type { MinesGameState, MinesAction, MinesAutoPlayState } from "./minesTypes";
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

type WinLossAction = "same" | "increase" | "reset";

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
  } = state;

  // Tab & UI state
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [numberOfBetsInput, setNumberOfBetsInput] = useState("10");
  const [isInfinite, setIsInfinite] = useState(false);

  // Auto-play local state
  const [autoCount, setAutoCount] = useState<number | null>(10);
  const [autoRevealTarget, setAutoRevealTarget] = useState(5);
  const [autoOnWin, setAutoOnWin] = useState<WinLossAction>("reset");
  const [autoOnLoss, setAutoOnLoss] = useState<WinLossAction>("reset");
  const [increaseOnWinPercent, setIncreaseOnWinPercent] = useState(100);
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
          {/* Action Button */}
          {renderActionButton()}

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

          {/* Advanced Toggle */}
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
                    {(["reset", "same", "increase"] as const).map((action) => (
                      <button
                        key={action}
                        type="button"
                        disabled={autoPlay.active}
                        onClick={() => setAutoOnWin(action)}
                        className={cn(
                          "flex-1 py-1 text-xs font-body rounded-md border disabled:opacity-50 disabled:cursor-not-allowed capitalize transition-colors",
                          autoOnWin === action
                            ? "bg-pb-accent/15 border-pb-accent/30 text-pb-accent"
                            : "bg-pb-bg-tertiary border-pb-border text-pb-text-muted hover:text-pb-text-primary",
                        )}
                      >
                        {action === "increase" ? "Increase" : action === "reset" ? "Reset" : "Same"}
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
                        aria-label="Custom increase on win percentage"
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
                    {(["reset", "same", "increase"] as const).map((action) => (
                      <button
                        key={action}
                        type="button"
                        disabled={autoPlay.active}
                        onClick={() => setAutoOnLoss(action)}
                        className={cn(
                          "flex-1 py-1 text-xs font-body rounded-md border disabled:opacity-50 disabled:cursor-not-allowed capitalize transition-colors",
                          autoOnLoss === action
                            ? "bg-pb-accent/15 border-pb-accent/30 text-pb-accent"
                            : "bg-pb-bg-tertiary border-pb-border text-pb-text-muted hover:text-pb-text-primary",
                        )}
                      >
                        {action === "increase" ? "Increase" : action === "reset" ? "Reset" : "Same"}
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
                        aria-label="Custom increase on loss percentage"
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

          {/* Start/Stop Autobet */}
          {autoPlay.active ? (
            <button
              type="button"
              onClick={onStopAutoPlay}
              className="w-full h-10 rounded-lg bg-pb-danger/20 border border-pb-danger/30 text-pb-danger font-heading font-bold text-sm transition-colors hover:bg-pb-danger/30"
            >
              Stop Autobet
            </button>
          ) : (
            <button
              type="button"
              disabled={phase !== "IDLE"}
              onClick={handleStartAutoPlay}
              className="w-full h-10 rounded-lg bg-pb-accent/15 border border-pb-accent/30 text-pb-accent font-heading font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-pb-accent/25"
            >
              Start Autobet
            </button>
          )}

          {/* Auto-play status */}
          {autoPlay.active && (
            <div className="text-xs text-pb-text-muted text-center">
              <span className="flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pb-accent animate-pulse" />
                Round {autoPlay.currentCount + 1}
                {autoPlay.totalCount ? ` / ${autoPlay.totalCount}` : ""} | P/L:{" "}
                <span
                  className={
                    state.stats.netProfit - autoPlay.startingNetProfit >= 0
                      ? "text-pb-accent"
                      : "text-pb-danger"
                  }
                >
                  {state.stats.netProfit - autoPlay.startingNetProfit >= 0
                    ? "+"
                    : ""}
                  {formatCurrency(
                    state.stats.netProfit - autoPlay.startingNetProfit,
                  )}
                </span>
              </span>
            </div>
          )}
        </>
      )}

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
