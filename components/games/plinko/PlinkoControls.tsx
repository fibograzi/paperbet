"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus, Zap } from "lucide-react";
import type { RiskLevel, PlinkoRows } from "@/lib/types";
import type { PlinkoGameState, PlinkoAction, AutoPlaySpeed } from "./plinkoTypes";
import { formatCurrency } from "@/lib/utils";

interface PlinkoControlsProps {
  state: PlinkoGameState;
  dispatch: React.Dispatch<PlinkoAction>;
  onDrop: () => void;
  canDrop: boolean;
  onStartAutoPlay: (config: {
    speed: AutoPlaySpeed;
    totalCount: number | null;
    stopOnWinMultiplier: number | null;
    stopOnProfit: number | null;
    stopOnLoss: number | null;
    onWin: "reset" | "increase";
    onLoss: "reset" | "increase";
    increaseOnWinPercent: number;
    increaseOnLossPercent: number;
  }) => void;
  onStopAutoPlay: () => void;
}

const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high"];
const RISK_COLORS: Record<RiskLevel, string> = {
  low: "#00E5A0",
  medium: "#F59E0B",
  high: "#EF4444",
};

const ROW_RANGE: PlinkoRows[] = [8, 9, 10, 11, 12, 13, 14, 15, 16];
const AUTO_PLAY_COUNTS: (number | null)[] = [10, 25, 50, 100, null];

export default function PlinkoControls({
  state,
  dispatch,
  onDrop,
  canDrop,
  onStartAutoPlay,
  onStopAutoPlay,
}: PlinkoControlsProps) {
  const { config, balance, autoPlay, activeBalls } = state;
  const [showAutoPlay, setShowAutoPlay] = useState(false);
  const [autoCount, setAutoCount] = useState<number | null>(10);
  const [customBetCount, setCustomBetCount] = useState("");
  const [autoSpeed, setAutoSpeed] = useState<AutoPlaySpeed>("normal");
  const inputRef = useRef<HTMLInputElement>(null);

  // On Win / On Loss strategy state
  const [autoOnWin, setAutoOnWin] = useState<"reset" | "increase">("reset");
  const [autoOnLoss, setAutoOnLoss] = useState<"reset" | "increase">("reset");
  const [increaseOnWinPercent, setIncreaseOnWinPercent] = useState("0");
  const [increaseOnLossPercent, setIncreaseOnLossPercent] = useState("0");

  // Stop conditions
  const [stopOnProfit, setStopOnProfit] = useState("");
  const [stopOnLoss, setStopOnLoss] = useState("");
  const [stopOnWinMultiplier, setStopOnWinMultiplier] = useState("");

  // Config locked while balls in flight
  const configLocked = activeBalls > 0 || autoPlay.active;

  // Spacebar shortcut — allows rapid-fire in manual mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        e.preventDefault();
        if (autoPlay.active) {
          if (!e.repeat) onStopAutoPlay();
        } else if (canDrop) {
          onDrop();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canDrop, onDrop, autoPlay.active, onStopAutoPlay]);

  const adjustBet = useCallback(
    (delta: number) => {
      const newAmount = Math.round((config.betAmount + delta) * 100) / 100;
      dispatch({
        type: "SET_BET_AMOUNT",
        amount: Math.max(0.1, Math.min(1000, newAmount)),
      });
    },
    [config.betAmount, dispatch]
  );

  const setBetQuick = useCallback(
    (action: "half" | "double" | "min" | "max") => {
      let amount: number;
      switch (action) {
        case "half":
          amount = Math.max(0.1, Math.round((config.betAmount / 2) * 100) / 100);
          break;
        case "double":
          amount = Math.min(1000, Math.round(config.betAmount * 2 * 100) / 100);
          break;
        case "min":
          amount = 0.1;
          break;
        case "max":
          amount = 1000;
          break;
      }
      dispatch({ type: "SET_BET_AMOUNT", amount });
    },
    [config.betAmount, dispatch]
  );

  const handleBetInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        dispatch({
          type: "SET_BET_AMOUNT",
          amount: Math.max(0.1, Math.min(1000, Math.round(val * 100) / 100)),
        });
      }
    },
    [dispatch]
  );

  const handleAutoPlayStart = useCallback(() => {
    // Resolve count: custom input takes priority if filled, otherwise preset
    let resolvedCount = autoCount;
    if (customBetCount.trim() !== "") {
      const parsed = parseInt(customBetCount, 10);
      if (!isNaN(parsed) && parsed > 0) {
        resolvedCount = parsed;
      }
    }

    onStartAutoPlay({
      speed: autoSpeed,
      totalCount: resolvedCount,
      stopOnWinMultiplier:
        stopOnWinMultiplier.trim() !== ""
          ? parseFloat(stopOnWinMultiplier)
          : null,
      stopOnProfit:
        stopOnProfit.trim() !== "" ? parseFloat(stopOnProfit) : null,
      stopOnLoss:
        stopOnLoss.trim() !== "" ? parseFloat(stopOnLoss) : null,
      onWin: autoOnWin,
      onLoss: autoOnLoss,
      increaseOnWinPercent:
        autoOnWin === "increase" ? parseFloat(increaseOnWinPercent) || 0 : 0,
      increaseOnLossPercent:
        autoOnLoss === "increase" ? parseFloat(increaseOnLossPercent) || 0 : 0,
    });
  }, [
    autoSpeed,
    autoCount,
    customBetCount,
    stopOnWinMultiplier,
    stopOnProfit,
    stopOnLoss,
    autoOnWin,
    autoOnLoss,
    increaseOnWinPercent,
    increaseOnLossPercent,
    onStartAutoPlay,
  ]);

  // Shared styles for toggle buttons
  const toggleBtnStyle = (active: boolean) => ({
    backgroundColor: active ? "rgba(0, 229, 160, 0.15)" : "",
    color: active ? "#00E5A0" : "#9CA3AF",
    border: active
      ? "1px solid rgba(0, 229, 160, 0.3)"
      : "1px solid #374151",
  });

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Balance */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-4">
        <div className="text-xs text-pb-text-muted mb-1">Balance</div>
        <div className="font-mono-stats text-2xl text-pb-text-primary">
          {formatCurrency(balance)}
        </div>
      </div>

      {/* Bet Amount */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-4">
        <label className="text-xs text-pb-text-muted mb-2 block">
          Bet Amount
        </label>
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => adjustBet(-0.1)}
            disabled={config.betAmount <= 0.1 || autoPlay.active}
            className="w-9 h-9 rounded-full bg-pb-bg-tertiary border border-pb-border flex items-center justify-center text-pb-text-secondary hover:bg-pb-border hover:text-pb-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Decrease bet"
          >
            <Minus size={16} />
          </button>
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-sm">
              $
            </span>
            <input
              ref={inputRef}
              type="number"
              min={0.1}
              max={1000}
              step={0.1}
              value={config.betAmount.toFixed(2)}
              onChange={handleBetInput}
              disabled={autoPlay.active}
              className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-2 pl-7 pr-3 text-right font-mono-stats text-lg text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50"
              aria-label="Bet amount"
            />
          </div>
          <button
            type="button"
            onClick={() => adjustBet(0.1)}
            disabled={config.betAmount >= 1000 || autoPlay.active}
            className="w-9 h-9 rounded-full bg-pb-bg-tertiary border border-pb-border flex items-center justify-center text-pb-text-secondary hover:bg-pb-border hover:text-pb-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Increase bet"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex gap-2">
          {(["half", "double", "min", "max"] as const).map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => setBetQuick(action)}
              disabled={autoPlay.active}
              className="flex-1 py-1.5 rounded-md bg-pb-bg-tertiary border border-pb-border text-xs text-pb-text-secondary hover:bg-pb-border hover:text-pb-text-primary transition-colors disabled:opacity-40"
            >
              {action === "half"
                ? "\u00BD"
                : action === "double"
                  ? "2\u00D7"
                  : action === "min"
                    ? "Min"
                    : "Max"}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Level */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-4">
        <label className="text-xs text-pb-text-muted mb-2 block">Risk</label>
        <div
          className="flex gap-1 bg-pb-bg-tertiary rounded-lg p-1"
          role="radiogroup"
          aria-label="Risk level"
        >
          {RISK_LEVELS.map((level) => {
            const isActive = config.risk === level;
            const color = RISK_COLORS[level];
            return (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => dispatch({ type: "SET_RISK", risk: level })}
                disabled={configLocked}
                className="flex-1 py-2 rounded-md text-sm font-heading font-semibold capitalize transition-all duration-150 disabled:opacity-50"
                style={{
                  backgroundColor: isActive ? `${color}26` : "transparent",
                  color: isActive ? color : "#9CA3AF",
                }}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rows */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-4">
        <label className="text-xs text-pb-text-muted mb-2 block">
          Rows: <span className="font-mono-stats text-pb-text-primary">{config.rows}</span>
        </label>
        <input
          type="range"
          min={8}
          max={16}
          step={1}
          value={config.rows}
          onChange={(e) => {
            const v = Math.max(8, Math.min(16, parseInt(e.target.value) || 8));
            dispatch({ type: "SET_ROWS", rows: v as PlinkoRows });
          }}
          disabled={configLocked}
          className="w-full h-1 bg-pb-border rounded-full appearance-none cursor-pointer accent-pb-accent disabled:opacity-50"
          aria-label="Number of rows"
        />
        <div className="flex justify-between text-xs text-pb-text-muted mt-1">
          <span>8</span>
          <span>16</span>
        </div>
      </div>

      {/* Drop Button */}
      {autoPlay.active ? (
        <button
          type="button"
          onClick={onStopAutoPlay}
          className="w-full h-12 rounded-[10px] bg-pb-danger text-white font-heading font-bold text-base transition-all hover:brightness-110 active:scale-[0.98]"
        >
          Stop ({autoPlay.currentCount}
          {autoPlay.totalCount ? ` / ${autoPlay.totalCount}` : ""})
        </button>
      ) : (
        <button
          type="button"
          onClick={onDrop}
          disabled={!canDrop}
          className="w-full h-12 rounded-[10px] bg-pb-accent text-pb-bg-primary font-heading font-bold text-base transition-all hover:shadow-[0_0_30px_rgba(0,229,160,0.3)] hover:brightness-105 active:scale-[0.98] disabled:bg-pb-border disabled:text-pb-text-muted disabled:cursor-not-allowed disabled:shadow-none"
          style={{
            boxShadow: canDrop ? "0 0 20px rgba(0, 229, 160, 0.2)" : "none",
          }}
        >
          Drop Ball
        </button>
      )}

      {/* Auto-Play Toggle */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-4">
        <button
          type="button"
          onClick={() => setShowAutoPlay(!showAutoPlay)}
          className="flex items-center gap-2 w-full text-left"
        >
          <Zap
            size={16}
            className={autoPlay.active ? "text-pb-accent" : "text-pb-text-secondary"}
          />
          <span
            className={`text-sm font-heading font-semibold ${
              autoPlay.active ? "text-pb-accent" : "text-pb-text-secondary"
            }`}
          >
            Auto-Play
          </span>
          {autoPlay.active && (
            <span className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pb-accent animate-pulse" />
              <span className="text-xs text-pb-accent font-mono-stats">
                {autoPlay.currentCount}
                {autoPlay.totalCount ? `/${autoPlay.totalCount}` : ""}
              </span>
            </span>
          )}
        </button>

        {showAutoPlay && !autoPlay.active && (
          <div className="mt-3 space-y-3">
            {/* Number of Bets */}
            <div>
              <div className="text-xs text-pb-text-muted mb-1.5">Number of Bets</div>
              <div className="flex gap-1.5">
                {AUTO_PLAY_COUNTS.map((count) => (
                  <button
                    key={count ?? "inf"}
                    type="button"
                    onClick={() => {
                      setAutoCount(count);
                      setCustomBetCount("");
                    }}
                    className="flex-1 py-1.5 rounded-md text-xs font-mono-stats transition-colors"
                    style={toggleBtnStyle(
                      autoCount === count && customBetCount.trim() === ""
                    )}
                  >
                    {count ?? "\u221E"}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                placeholder="Custom count"
                value={customBetCount}
                onChange={(e) => {
                  setCustomBetCount(e.target.value);
                  if (e.target.value.trim() !== "") {
                    setAutoCount(null);
                  }
                }}
                className="mt-1.5 w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-1.5 px-3 text-xs font-mono-stats text-pb-text-primary placeholder:text-pb-text-muted/50 focus:outline-none focus:ring-1 focus:ring-pb-accent/50"
              />
            </div>

            {/* On Win */}
            <div>
              <div className="text-xs text-pb-text-muted mb-1.5">On Win</div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setAutoOnWin("reset")}
                  className="flex-1 py-1.5 rounded-md text-xs font-heading transition-colors"
                  style={toggleBtnStyle(autoOnWin === "reset")}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setAutoOnWin("increase")}
                  className="flex-1 py-1.5 rounded-md text-xs font-heading transition-colors"
                  style={toggleBtnStyle(autoOnWin === "increase")}
                >
                  Increase by
                </button>
              </div>
              {autoOnWin === "increase" && (
                <div className="mt-1.5 relative">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={increaseOnWinPercent}
                    onChange={(e) => setIncreaseOnWinPercent(e.target.value)}
                    className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-1.5 pl-3 pr-7 text-xs font-mono-stats text-pb-text-primary focus:outline-none focus:ring-1 focus:ring-pb-accent/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">
                    %
                  </span>
                </div>
              )}
            </div>

            {/* On Loss */}
            <div>
              <div className="text-xs text-pb-text-muted mb-1.5">On Loss</div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setAutoOnLoss("reset")}
                  className="flex-1 py-1.5 rounded-md text-xs font-heading transition-colors"
                  style={toggleBtnStyle(autoOnLoss === "reset")}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setAutoOnLoss("increase")}
                  className="flex-1 py-1.5 rounded-md text-xs font-heading transition-colors"
                  style={toggleBtnStyle(autoOnLoss === "increase")}
                >
                  Increase by
                </button>
              </div>
              {autoOnLoss === "increase" && (
                <div className="mt-1.5 relative">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={increaseOnLossPercent}
                    onChange={(e) => setIncreaseOnLossPercent(e.target.value)}
                    className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-1.5 pl-3 pr-7 text-xs font-mono-stats text-pb-text-primary focus:outline-none focus:ring-1 focus:ring-pb-accent/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">
                    %
                  </span>
                </div>
              )}
            </div>

            {/* Stop on Profit */}
            <div>
              <div className="text-xs text-pb-text-muted mb-1.5">Stop on Profit</div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="No limit"
                  value={stopOnProfit}
                  onChange={(e) => setStopOnProfit(e.target.value)}
                  className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-1.5 pl-7 pr-3 text-xs font-mono-stats text-pb-text-primary placeholder:text-pb-text-muted/50 focus:outline-none focus:ring-1 focus:ring-pb-accent/50"
                />
              </div>
            </div>

            {/* Stop on Loss */}
            <div>
              <div className="text-xs text-pb-text-muted mb-1.5">Stop on Loss</div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="No limit"
                  value={stopOnLoss}
                  onChange={(e) => setStopOnLoss(e.target.value)}
                  className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-1.5 pl-7 pr-3 text-xs font-mono-stats text-pb-text-primary placeholder:text-pb-text-muted/50 focus:outline-none focus:ring-1 focus:ring-pb-accent/50"
                />
              </div>
            </div>

            {/* Stop on Win Multiplier */}
            <div>
              <div className="text-xs text-pb-text-muted mb-1.5">Stop on Win</div>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  placeholder="No limit"
                  value={stopOnWinMultiplier}
                  onChange={(e) => setStopOnWinMultiplier(e.target.value)}
                  className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-1.5 pl-3 pr-7 text-xs font-mono-stats text-pb-text-primary placeholder:text-pb-text-muted/50 focus:outline-none focus:ring-1 focus:ring-pb-accent/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">
                  x
                </span>
              </div>
            </div>

            {/* Speed */}
            <div>
              <div className="text-xs text-pb-text-muted mb-1.5">Speed</div>
              <div className="flex gap-1.5">
                {(["normal", "fast", "turbo"] as AutoPlaySpeed[]).map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setAutoSpeed(speed)}
                    className="flex-1 py-1.5 rounded-md text-xs capitalize font-heading transition-colors"
                    style={toggleBtnStyle(autoSpeed === speed)}
                  >
                    {speed === "normal" ? "1x" : speed === "fast" ? "2x" : "3x"}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoPlayStart}
              disabled={!canDrop}
              className="w-full py-2.5 rounded-lg bg-pb-accent/15 text-pb-accent font-heading font-semibold text-sm border border-pb-accent/30 hover:bg-pb-accent/25 transition-colors disabled:opacity-40"
            >
              Start Auto-Play
            </button>
          </div>
        )}
      </div>

      {/* Session Reminder */}
      {state.showSessionReminder && (
        <div className="bg-pb-bg-secondary border border-pb-warning/30 rounded-xl p-3 text-xs text-pb-text-secondary">
          <p>
            You&apos;ve played {state.sessionBetCount} rounds. Remember, this is
            practice mode.
          </p>
          <button
            type="button"
            onClick={() => dispatch({ type: "DISMISS_SESSION_REMINDER" })}
            className="text-pb-warning text-xs mt-1 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Keyboard hint */}
      <div className="text-center text-xs text-pb-text-muted">
        Press <kbd className="px-1.5 py-0.5 rounded bg-pb-bg-tertiary border border-pb-border font-mono-stats text-[10px]">Space</kbd> to drop
      </div>
    </div>
  );
}
