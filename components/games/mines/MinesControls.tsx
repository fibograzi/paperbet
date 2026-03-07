"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Minus,
  Plus,
  Shuffle,
  ChevronDown,
} from "lucide-react";
import type { MinesGameState, MinesAction, MinesAutoPlayState } from "./minesTypes";
import {
  formatMinesMultiplier,
  getMultiplier,
  getRiskLabel,
  maxGems,
} from "./minesCalculator";
import { formatCurrency, cn } from "@/lib/utils";

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

const MINE_PRESETS = [1, 3, 5, 10, 24];
const AUTO_PLAY_COUNTS: (number | null)[] = [10, 25, 50, 100, null];
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

  // Auto-play local state
  const [showAutoPlay, setShowAutoPlay] = useState(false);
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

  const riskInfo = getRiskLabel(mineCount);
  const safeGems = maxGems(mineCount);
  const firstGemMultiplier = getMultiplier(1, mineCount);

  // Ensure auto-reveal target doesn't exceed max gems
  useEffect(() => {
    if (autoRevealTarget > safeGems) {
      setAutoRevealTarget(safeGems);
    }
  }, [mineCount, safeGems, autoRevealTarget]);

  // Auto-expand panel when auto-play becomes active
  useEffect(() => {
    if (autoPlay.active) setShowAutoPlay(true);
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

  const handleBetInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) setBet(val);
    },
    [setBet],
  );

  // --- Mine Count Handlers ---
  const setMines = useCallback(
    (count: number) => {
      dispatch({ type: "SET_MINE_COUNT", count });
    },
    [dispatch],
  );

  // --- Auto-play start ---
  const handleStartAutoPlay = useCallback(() => {
    onStartAutoPlay({
      totalCount: autoCount,
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

  // --- Render ---
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Bet Amount Card */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-4">
        <label className="text-sm text-pb-text-secondary font-body block mb-2">
          Bet Amount
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={controlsDisabled || autoPlay.active}
            onClick={() => setBet(betAmount - 0.1)}
            className="w-9 h-9 rounded-full bg-pb-bg-tertiary border border-pb-border flex items-center justify-center text-pb-text-secondary hover:text-pb-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus size={14} />
          </button>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pb-text-muted font-mono-stats text-sm">
              $
            </span>
            <input
              ref={betInputRef}
              type="number"
              step="0.10"
              min="0.10"
              max="1000"
              value={betAmount.toFixed(2)}
              onChange={handleBetInput}
              disabled={controlsDisabled || autoPlay.active}
              className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-2 pl-7 pr-3 text-right font-mono-stats text-lg text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="button"
            disabled={controlsDisabled || autoPlay.active}
            onClick={() => setBet(betAmount + 0.1)}
            className="w-9 h-9 rounded-full bg-pb-bg-tertiary border border-pb-border flex items-center justify-center text-pb-text-secondary hover:text-pb-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        {/* Quick select */}
        <div className="flex gap-2 mt-2">
          {[
            { label: "½", action: () => setBet(betAmount / 2) },
            { label: "2×", action: () => setBet(betAmount * 2) },
            { label: "Min", action: () => setBet(0.1) },
            { label: "Max", action: () => setBet(Math.min(1000, balance)) },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              disabled={controlsDisabled || autoPlay.active}
              onClick={btn.action}
              className="flex-1 py-1 text-xs font-body font-medium text-pb-text-muted bg-pb-bg-tertiary border border-pb-border rounded-md hover:text-pb-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mine Count Card */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-4">
        <label className="text-sm text-pb-text-secondary font-body block mb-2">
          Mines
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={controlsDisabled || autoPlay.active}
            onClick={() => setMines(mineCount - 1)}
            className="w-9 h-9 rounded-full bg-pb-bg-tertiary border border-pb-border flex items-center justify-center text-pb-text-secondary hover:text-pb-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus size={14} />
          </button>
          <div className="relative flex-1">
            <input
              type="number"
              min="1"
              max="24"
              value={mineCount}
              onChange={(e) => setMines(parseInt(e.target.value, 10) || 3)}
              disabled={controlsDisabled || autoPlay.active}
              className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-2 px-3 text-center font-mono-stats text-lg text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="button"
            disabled={controlsDisabled || autoPlay.active}
            onClick={() => setMines(mineCount + 1)}
            className="w-9 h-9 rounded-full bg-pb-bg-tertiary border border-pb-border flex items-center justify-center text-pb-text-secondary hover:text-pb-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        {/* Quick select */}
        <div className="flex gap-2 mt-2">
          {MINE_PRESETS.map((count) => (
            <button
              key={count}
              type="button"
              disabled={controlsDisabled || autoPlay.active}
              onClick={() => setMines(count)}
              className={cn(
                "flex-1 py-1 text-xs font-body font-medium border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                mineCount === count
                  ? "bg-pb-accent/15 border-pb-accent/30 text-pb-accent"
                  : "bg-pb-bg-tertiary border-pb-border text-pb-text-muted hover:text-pb-text-primary",
              )}
            >
              {count}
            </button>
          ))}
        </div>
        {/* Info displays */}
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="text-pb-text-secondary">
            {safeGems} gems to find
          </span>
          <span style={{ color: riskInfo.color }} className="font-medium">
            {riskInfo.text}
          </span>
        </div>
        <p className="text-xs text-pb-text-muted mt-1">
          1st gem: {formatMinesMultiplier(firstGemMultiplier)}
        </p>
      </div>

      {/* Pick Random Button */}
      <button
        type="button"
        disabled={!isPlaying || state.revealingTile !== null || autoPlay.active}
        onClick={onPickRandom}
        className="w-full h-9 rounded-lg bg-pb-bg-tertiary border border-pb-border text-sm text-pb-text-secondary font-body hover:bg-[#374151] hover:text-pb-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        <Shuffle size={14} />
        Pick Random
      </button>

      {/* Action Button */}
      {renderActionButton()}

      {/* Auto-Play Toggle */}
      <button
        type="button"
        onClick={() => setShowAutoPlay(!showAutoPlay)}
        className="w-full flex items-center justify-between py-2 px-3 text-sm text-pb-text-secondary font-body hover:text-pb-text-primary transition-colors"
      >
        <span className="flex items-center gap-2">
          {autoPlay.active && (
            <span className="w-2 h-2 rounded-full bg-pb-accent animate-pulse" />
          )}
          Auto
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "transition-transform",
            showAutoPlay ? "rotate-180" : "",
          )}
        />
      </button>

      {/* Auto-Play Panel */}
      {showAutoPlay && (
        <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-4 space-y-3">
          {/* Game count */}
          <div>
            <label className="text-xs text-pb-text-muted block mb-1">
              Number of Games
            </label>
            <div className="flex gap-1.5">
              {AUTO_PLAY_COUNTS.map((count) => (
                <button
                  key={count ?? "inf"}
                  type="button"
                  disabled={autoPlay.active}
                  onClick={() => setAutoCount(count)}
                  className={cn(
                    "flex-1 py-1 text-xs font-mono-stats rounded-md border disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                    autoCount === count
                      ? "bg-pb-accent/15 border-pb-accent/30 text-pb-accent"
                      : "bg-pb-bg-tertiary border-pb-border text-pb-text-muted hover:text-pb-text-primary",
                  )}
                >
                  {count ?? "∞"}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-reveal target */}
          <div>
            <label className="text-xs text-pb-text-muted block mb-1">
              Tiles to Reveal (then auto-cashout)
            </label>
            <div className="flex items-center gap-2">
              <input
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

          {/* On Win */}
          <div>
            <label className="text-xs text-pb-text-muted block mb-1">
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
                <input
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
            <label className="text-xs text-pb-text-muted block mb-1">
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
                <input
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
              <input
                type="checkbox"
                checked={stopOnProfitEnabled}
                onChange={(e) => setStopOnProfitEnabled(e.target.checked)}
                disabled={autoPlay.active}
                className="accent-pb-accent"
              />
              Stop on Profit ≥
            </label>
            <input
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
              <input
                type="checkbox"
                checked={stopOnLossEnabled}
                onChange={(e) => setStopOnLossEnabled(e.target.checked)}
                disabled={autoPlay.active}
                className="accent-pb-accent"
              />
              Stop on Loss ≥
            </label>
            <input
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

          {/* Start/Stop Auto-Play */}
          {autoPlay.active ? (
            <button
              type="button"
              onClick={onStopAutoPlay}
              className="w-full h-10 rounded-lg bg-pb-danger/20 border border-pb-danger/30 text-pb-danger font-heading font-bold text-sm transition-colors hover:bg-pb-danger/30"
            >
              Stop Auto-Play
            </button>
          ) : (
            <button
              type="button"
              disabled={phase !== "IDLE"}
              onClick={handleStartAutoPlay}
              className="w-full h-10 rounded-lg bg-pb-accent/15 border border-pb-accent/30 text-pb-accent font-heading font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-pb-accent/25"
            >
              Start Auto-Play
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
        </div>
      )}

      {/* Balance display */}
      <div className="text-center text-xs text-pb-text-muted">
        Balance:{" "}
        <span className="font-mono-stats text-pb-text-primary">
          {formatCurrency(balance)}
        </span>
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
          className="w-full h-[52px] rounded-[10px] bg-pb-accent/15 text-pb-accent font-heading font-bold text-base cursor-default border border-pb-accent/30"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pb-accent animate-pulse" />
            Auto-Playing ({countLabel})
          </span>
        </button>
      );
    }

    // IDLE → Bet button
    if (isIdle) {
      return (
        <button
          type="button"
          onClick={onStartGame}
          disabled={balance < betAmount}
          className="w-full h-12 rounded-[10px] bg-pb-accent text-[#0B0F1A] font-heading font-bold text-base hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ boxShadow: "0 0 20px rgba(0, 229, 160, 0.2)" }}
        >
          <span className="block">Bet</span>
          <span className="block text-xs opacity-80 -mt-0.5">
            {formatCurrency(betAmount)}
          </span>
        </button>
      );
    }

    // PLAYING, 0 gems → disabled cashout
    if (isPlaying && gemsRevealed === 0) {
      return (
        <button
          type="button"
          disabled
          className="w-full h-[52px] rounded-[10px] bg-[#374151] text-[#6B7280] font-heading font-bold text-base cursor-not-allowed"
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
          className="w-full h-[52px] rounded-[10px] bg-pb-warning text-[#0B0F1A] font-heading font-bold text-base hover:brightness-110 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all mines-cashout-pulse"
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
          className="w-full h-12 rounded-[10px] bg-pb-accent text-[#0B0F1A] font-heading font-bold text-base hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          New Game
        </button>
      );
    }

    return null;
  }
}
