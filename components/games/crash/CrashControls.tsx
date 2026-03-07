"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Zap, ChevronDown } from "lucide-react";
import type {
  CrashGameState,
  CrashAction,
} from "./crashTypes";
import { formatCrashMultiplier, calculateCrashProfit } from "./crashEngine";
import { formatCurrency, cn } from "@/lib/utils";

interface CrashControlsProps {
  state: CrashGameState;
  dispatch: React.Dispatch<CrashAction>;
  onPlaceBet: () => void;
  onCancelBet: () => void;
  onCashOut: () => void;
  onStartAutoPlay: (config: {
    totalCount: number | null;
    cashoutAt: number;
    onWin: "same" | "increase" | "reset";
    onLoss: "same" | "increase" | "reset";
    increaseOnWinPercent: number;
    increaseOnLossPercent: number;
    baseBet: number;
    stopOnProfit: number | null;
    stopOnLoss: number | null;
  }) => void;
  onStopAutoPlay: () => void;
}

const AUTO_PLAY_COUNTS: (number | null)[] = [10, 25, 50, 100, null];
const CASHOUT_PRESETS = [1.5, 2, 5, 10];
const INCREASE_PRESETS = [25, 50, 100, 200];

type WinLossAction = "same" | "increase" | "reset";

export default function CrashControls({
  state,
  dispatch,
  onPlaceBet,
  onCancelBet,
  onCashOut,
  onStartAutoPlay,
  onStopAutoPlay,
}: CrashControlsProps) {
  const { config, balance, autoPlay, phase, hasBet, cashedOut, cashoutMultiplier, currentMultiplier } = state;

  const [showAutoPlay, setShowAutoPlay] = useState(false);
  const [autoCount, setAutoCount] = useState<number | null>(10);
  const [autoCashoutAt, setAutoCashoutAt] = useState<number>(config.autoCashout ?? 2.0);
  const [autoOnWin, setAutoOnWin] = useState<WinLossAction>("reset");
  const [autoOnLoss, setAutoOnLoss] = useState<WinLossAction>("reset");
  const [increaseOnWinPercent, setIncreaseOnWinPercent] = useState(50);
  const [increaseOnLossPercent, setIncreaseOnLossPercent] = useState(100);
  const [stopOnProfitEnabled, setStopOnProfitEnabled] = useState(false);
  const [stopOnLossEnabled, setStopOnLossEnabled] = useState(false);
  const [stopOnProfitAmount, setStopOnProfitAmount] = useState(100);
  const [stopOnLossAmount, setStopOnLossAmount] = useState(50);
  const inputRef = useRef<HTMLInputElement>(null);

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

        if (phase === "betting") {
          if (hasBet) {
            onCancelBet();
          } else {
            onPlaceBet();
          }
        } else if (phase === "running" && hasBet && !cashedOut) {
          onCashOut();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, hasBet, cashedOut, onPlaceBet, onCancelBet, onCashOut]);

  // ---------------------------------------------------------------------------
  // Bet amount helpers
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Cashout at helpers
  // ---------------------------------------------------------------------------

  const adjustCashout = useCallback(
    (delta: number) => {
      const current = config.autoCashout ?? 2.0;
      const newVal = Math.round((current + delta) * 100) / 100;
      dispatch({
        type: "SET_AUTO_CASHOUT",
        value: Math.max(1.01, Math.min(10000, newVal)),
      });
    },
    [config.autoCashout, dispatch]
  );

  const handleCashoutInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        dispatch({
          type: "SET_AUTO_CASHOUT",
          value: Math.max(1.01, Math.min(10000, Math.round(val * 100) / 100)),
        });
      }
    },
    [dispatch]
  );

  const setCashoutPreset = useCallback(
    (value: number) => {
      dispatch({ type: "SET_AUTO_CASHOUT", value });
    },
    [dispatch]
  );

  // ---------------------------------------------------------------------------
  // Auto-play start
  // ---------------------------------------------------------------------------

  const handleAutoPlayStart = useCallback(() => {
    onStartAutoPlay({
      totalCount: autoCount,
      cashoutAt: autoCashoutAt,
      onWin: autoOnWin,
      onLoss: autoOnLoss,
      increaseOnWinPercent,
      increaseOnLossPercent,
      baseBet: config.betAmount,
      stopOnProfit: stopOnProfitEnabled ? stopOnProfitAmount : null,
      stopOnLoss: stopOnLossEnabled ? stopOnLossAmount : null,
    });
  }, [
    autoCount, autoCashoutAt, autoOnWin, autoOnLoss,
    increaseOnWinPercent, increaseOnLossPercent,
    config.betAmount, stopOnProfitEnabled, stopOnProfitAmount,
    stopOnLossEnabled, stopOnLossAmount, onStartAutoPlay,
  ]);

  // ---------------------------------------------------------------------------
  // Computed values for action button
  // ---------------------------------------------------------------------------

  const controlsDisabled = phase === "running" || phase === "crashed";

  const potentialProfit =
    hasBet && !cashedOut
      ? calculateCrashProfit(config.betAmount, true, currentMultiplier)
      : 0;

  // Auto-play profit since start
  const autoPlayProfit = autoPlay.active
    ? state.stats.netProfit - autoPlay.startingNetProfit
    : 0;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
            disabled={config.betAmount <= 0.1 || autoPlay.active || controlsDisabled}
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
              disabled={autoPlay.active || controlsDisabled}
              className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-2 pl-7 pr-3 text-right font-mono-stats text-lg text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50"
              aria-label="Bet amount"
            />
          </div>
          <button
            type="button"
            onClick={() => adjustBet(0.1)}
            disabled={config.betAmount >= 1000 || autoPlay.active || controlsDisabled}
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
              disabled={autoPlay.active || controlsDisabled}
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

      {/* Cashout At */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-4">
        <label className="text-xs text-pb-text-muted mb-2 block">
          Cashout At
        </label>
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => adjustCashout(-0.1)}
            disabled={(config.autoCashout ?? 2.0) <= 1.01 || autoPlay.active || controlsDisabled}
            className="w-9 h-9 rounded-full bg-pb-bg-tertiary border border-pb-border flex items-center justify-center text-pb-text-secondary hover:bg-pb-border hover:text-pb-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Decrease cashout"
          >
            <Minus size={16} />
          </button>
          <div className="flex-1 relative">
            <input
              type="number"
              min={1.01}
              max={10000}
              step={0.1}
              value={(config.autoCashout ?? 2.0).toFixed(2)}
              onChange={handleCashoutInput}
              disabled={autoPlay.active || controlsDisabled}
              className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-2 pl-3 pr-8 text-right font-mono-stats text-lg text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50"
              aria-label="Cashout multiplier"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-sm">
              x
            </span>
          </div>
          <button
            type="button"
            onClick={() => adjustCashout(0.1)}
            disabled={(config.autoCashout ?? 2.0) >= 10000 || autoPlay.active || controlsDisabled}
            className="w-9 h-9 rounded-full bg-pb-bg-tertiary border border-pb-border flex items-center justify-center text-pb-text-secondary hover:bg-pb-border hover:text-pb-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Increase cashout"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex gap-2">
          {CASHOUT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setCashoutPreset(preset)}
              disabled={autoPlay.active || controlsDisabled}
              className={cn(
                "flex-1 py-1.5 rounded-md text-xs transition-colors disabled:opacity-40",
                config.autoCashout === preset
                  ? "bg-pb-accent/15 text-pb-accent border border-pb-accent/30"
                  : "bg-pb-bg-tertiary border border-pb-border text-pb-text-secondary hover:bg-pb-border hover:text-pb-text-primary"
              )}
            >
              {preset}x
            </button>
          ))}
        </div>
      </div>

      {/* Action Button */}
      {renderActionButton()}

      {/* Auto-Play Panel */}
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
            className={cn(
              "text-sm font-heading font-semibold",
              autoPlay.active ? "text-pb-accent" : "text-pb-text-secondary"
            )}
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
          {!autoPlay.active && (
            <ChevronDown
              size={14}
              className={cn(
                "ml-auto text-pb-text-muted transition-transform",
                showAutoPlay && "rotate-180"
              )}
            />
          )}
        </button>

        {/* Auto-Play Config (when not active) */}
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
                    onClick={() => setAutoCount(count)}
                    className="flex-1 py-1.5 rounded-md text-xs font-mono-stats transition-colors"
                    style={{
                      backgroundColor:
                        autoCount === count ? "rgba(0, 229, 160, 0.15)" : "",
                      color: autoCount === count ? "#00E5A0" : "#9CA3AF",
                      border:
                        autoCount === count
                          ? "1px solid rgba(0, 229, 160, 0.3)"
                          : "1px solid #374151",
                    }}
                  >
                    {count ?? "\u221E"}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Cashout At */}
            <div>
              <div className="text-xs text-pb-text-muted mb-1.5">Auto Cashout</div>
              <div className="relative mb-2">
                <input
                  type="number"
                  min={1.01}
                  max={10000}
                  step={0.1}
                  value={autoCashoutAt.toFixed(2)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setAutoCashoutAt(Math.max(1.01, Math.min(10000, Math.round(val * 100) / 100)));
                    }
                  }}
                  className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-2 pl-3 pr-8 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50"
                  aria-label="Auto-play cashout multiplier"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">
                  x
                </span>
              </div>
              <div className="flex gap-1.5">
                {CASHOUT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAutoCashoutAt(preset)}
                    className="flex-1 py-1 rounded-md text-xs font-mono-stats transition-colors"
                    style={{
                      backgroundColor:
                        autoCashoutAt === preset ? "rgba(0, 229, 160, 0.15)" : "",
                      color: autoCashoutAt === preset ? "#00E5A0" : "#9CA3AF",
                      border:
                        autoCashoutAt === preset
                          ? "1px solid rgba(0, 229, 160, 0.3)"
                          : "1px solid #374151",
                    }}
                  >
                    {preset}x
                  </button>
                ))}
              </div>
            </div>

            {/* On Win */}
            <div>
              <div className="text-xs text-pb-text-muted mb-1.5">On Win</div>
              <div className="flex gap-1 bg-pb-bg-tertiary rounded-lg p-1">
                {renderStrategyControl(
                  [
                    { value: "reset", label: "Reset" },
                    { value: "increase", label: "Increase" },
                    { value: "same", label: "Same" },
                  ],
                  autoOnWin,
                  setAutoOnWin
                )}
              </div>
              {autoOnWin === "increase" && (
                <div className="mt-2">
                  <div className="text-xs text-pb-text-muted mb-1">Increase by</div>
                  <div className="flex gap-1.5 mb-1.5">
                    {INCREASE_PRESETS.map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setIncreaseOnWinPercent(pct)}
                        className="flex-1 py-1 rounded-md text-xs font-mono-stats transition-colors"
                        style={{
                          backgroundColor:
                            increaseOnWinPercent === pct ? "rgba(0, 229, 160, 0.15)" : "",
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
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      step={1}
                      value={increaseOnWinPercent}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1) {
                          setIncreaseOnWinPercent(Math.min(10000, val));
                        }
                      }}
                      className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-1.5 pl-3 pr-8 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50"
                      aria-label="Custom increase on win percentage"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">
                      %
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* On Loss */}
            <div>
              <div className="text-xs text-pb-text-muted mb-1.5">On Loss</div>
              <div className="flex gap-1 bg-pb-bg-tertiary rounded-lg p-1">
                {renderStrategyControl(
                  [
                    { value: "reset", label: "Reset" },
                    { value: "increase", label: "Increase" },
                    { value: "same", label: "Same" },
                  ],
                  autoOnLoss,
                  setAutoOnLoss
                )}
              </div>
              {autoOnLoss === "increase" && (
                <div className="mt-2">
                  <div className="text-xs text-pb-text-muted mb-1">Increase by</div>
                  <div className="flex gap-1.5 mb-1.5">
                    {INCREASE_PRESETS.map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setIncreaseOnLossPercent(pct)}
                        className="flex-1 py-1 rounded-md text-xs font-mono-stats transition-colors"
                        style={{
                          backgroundColor:
                            increaseOnLossPercent === pct ? "rgba(0, 229, 160, 0.15)" : "",
                          color: increaseOnLossPercent === pct ? "#00E5A0" : "#9CA3AF",
                          border:
                            increaseOnLossPercent === pct
                              ? "1px solid rgba(0, 229, 160, 0.3)"
                              : "1px solid #374151",
                        }}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      step={1}
                      value={increaseOnLossPercent}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1) {
                          setIncreaseOnLossPercent(Math.min(10000, val));
                        }
                      }}
                      className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-1.5 pl-3 pr-8 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50"
                      aria-label="Custom increase on loss percentage"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">
                      %
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Stop on Profit */}
            <div>
              <label className="flex items-center gap-2 mb-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stopOnProfitEnabled}
                  onChange={(e) => setStopOnProfitEnabled(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-pb-border accent-pb-accent"
                />
                <span className="text-xs text-pb-text-muted">Stop on Profit</span>
              </label>
              {stopOnProfitEnabled && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={100000}
                    step={1}
                    value={stopOnProfitAmount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val > 0) {
                        setStopOnProfitAmount(Math.round(val * 100) / 100);
                      }
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
                <input
                  type="checkbox"
                  checked={stopOnLossEnabled}
                  onChange={(e) => setStopOnLossEnabled(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-pb-border accent-pb-accent"
                />
                <span className="text-xs text-pb-text-muted">Stop on Loss</span>
              </label>
              {stopOnLossEnabled && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={100000}
                    step={1}
                    value={stopOnLossAmount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val > 0) {
                        setStopOnLossAmount(Math.round(val * 100) / 100);
                      }
                    }}
                    className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg py-1.5 pl-7 pr-3 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50"
                    aria-label="Stop on loss amount"
                  />
                </div>
              )}
            </div>

            {/* Start Button */}
            <button
              type="button"
              onClick={handleAutoPlayStart}
              className="w-full py-2.5 rounded-lg bg-pb-accent/15 text-pb-accent font-heading font-semibold text-sm border border-pb-accent/30 hover:bg-pb-accent/25 transition-colors disabled:opacity-40"
            >
              Start Auto-Play
            </button>
          </div>
        )}

        {/* Active Auto-Play Summary */}
        {showAutoPlay && autoPlay.active && (
          <div className="mt-3 space-y-3">
            {/* Strategy Summary */}
            <div className="bg-pb-bg-tertiary rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-pb-text-muted">Cashout</span>
                <span className="text-pb-text-primary font-mono-stats">
                  {autoPlay.cashoutAt.toFixed(2)}x
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-pb-text-muted">On Win</span>
                <span className="text-pb-text-primary font-mono-stats">
                  {autoPlay.onWin === "reset"
                    ? "Reset"
                    : autoPlay.onWin === "increase"
                      ? `+${autoPlay.increaseOnWinPercent}%`
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
                      : "Same"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-pb-text-muted">Current Bet</span>
                <span className="text-pb-text-primary font-mono-stats">
                  {formatCurrency(config.betAmount)}
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
            <div className="flex justify-between items-center bg-pb-bg-tertiary rounded-lg px-3 py-2">
              <span className="text-xs text-pb-text-muted">Session P/L</span>
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

            {/* Stop Button */}
            <button
              type="button"
              onClick={onStopAutoPlay}
              className="w-full py-2.5 rounded-lg bg-pb-danger/15 text-pb-danger font-heading font-semibold text-sm border border-pb-danger/30 hover:bg-pb-danger/25 transition-colors"
            >
              Stop Auto-Play
            </button>
          </div>
        )}
      </div>

      {/* Session Reminder */}
      {state.showSessionReminder && (
        <div className="bg-pb-bg-secondary border border-pb-warning/30 rounded-xl p-3 text-xs text-pb-text-secondary">
          <p>
            You&apos;ve played {state.sessionRoundCount} rounds. Remember, this is
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
        Press{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-pb-bg-tertiary border border-pb-border font-mono-stats text-[10px]">
          Space
        </kbd>{" "}
        to bet/cashout
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Sub-renders
  // ---------------------------------------------------------------------------

  function renderActionButton() {
    // AUTO-PLAY: show status during non-running phases (keep Cash Out available during running)
    if (autoPlay.active && phase !== "running") {
      const countLabel = autoPlay.totalCount
        ? `${autoPlay.currentCount}/${autoPlay.totalCount}`
        : `${autoPlay.currentCount}`;
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

    // BETTING + no bet: Green "Bet (Next Round)"
    if (phase === "betting" && !hasBet) {
      return (
        <button
          type="button"
          onClick={onPlaceBet}
          disabled={config.betAmount > balance}
          className="w-full h-[52px] rounded-[10px] bg-pb-accent text-pb-bg-primary font-heading font-bold text-base transition-all hover:shadow-[0_0_30px_rgba(0,229,160,0.3)] hover:brightness-105 active:scale-[0.98] disabled:bg-pb-border disabled:text-pb-text-muted disabled:cursor-not-allowed disabled:shadow-none"
          style={{
            boxShadow:
              config.betAmount <= balance
                ? "0 0 20px rgba(0, 229, 160, 0.2)"
                : "none",
          }}
        >
          Bet (Next Round)
        </button>
      );
    }

    // BETTING + has bet: Red "Cancel Bet"
    if (phase === "betting" && hasBet) {
      return (
        <button
          type="button"
          onClick={onCancelBet}
          className="w-full h-[52px] rounded-[10px] bg-pb-danger text-white font-heading font-bold text-base transition-all hover:brightness-110 active:scale-[0.98]"
        >
          Cancel Bet
        </button>
      );
    }

    // RUNNING + has bet + not cashed out: Amber pulsing "Cash Out"
    if (phase === "running" && hasBet && !cashedOut) {
      return (
        <motion.button
          type="button"
          onClick={onCashOut}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-[52px] rounded-[10px] font-heading font-bold text-base text-pb-bg-primary transition-all hover:brightness-110 active:scale-[0.98]"
          style={{
            backgroundColor: "#F59E0B",
            boxShadow: "0 0 20px rgba(245, 158, 11, 0.3)",
          }}
        >
          <span>Cash Out @ {formatCrashMultiplier(currentMultiplier)}</span>
          <span className="block text-xs font-mono-stats mt-0.5 opacity-90">
            +{formatCurrency(potentialProfit)}
          </span>
        </motion.button>
      );
    }

    // RUNNING + no bet: Disabled gray "Watching..."
    if (phase === "running" && !hasBet) {
      return (
        <button
          type="button"
          disabled
          className="w-full h-[52px] rounded-[10px] bg-pb-border text-pb-text-muted font-heading font-bold text-base cursor-not-allowed"
        >
          Watching...
        </button>
      );
    }

    // RUNNING + cashed out: Green disabled "Cashed Out"
    if (phase === "running" && cashedOut && cashoutMultiplier !== null) {
      return (
        <button
          type="button"
          disabled
          className="w-full h-[52px] rounded-[10px] bg-pb-accent text-pb-bg-primary font-heading font-bold text-base cursor-not-allowed opacity-80"
        >
          Cashed Out @ {formatCrashMultiplier(cashoutMultiplier)}!
        </button>
      );
    }

    // CRASHED: Gray disabled "Next round in..."
    return (
      <button
        type="button"
        disabled
        className="w-full h-[52px] rounded-[10px] bg-pb-border text-pb-text-muted font-heading font-bold text-base cursor-not-allowed"
      >
        Next round in...
      </button>
    );
  }

  function renderStrategyControl(
    options: { value: WinLossAction; label: string }[],
    selected: WinLossAction,
    onChange: (value: WinLossAction) => void
  ) {
    return options.map((option) => {
      const isActive = selected === option.value;
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className="flex-1 py-2 rounded-md text-xs font-heading font-semibold transition-all duration-150"
          style={{
            backgroundColor: isActive ? "rgba(0, 229, 160, 0.15)" : "transparent",
            color: isActive ? "#00E5A0" : "#9CA3AF",
          }}
        >
          {option.label}
        </button>
      );
    });
  }
}
