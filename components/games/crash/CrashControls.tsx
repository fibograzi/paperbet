"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, Zap } from "lucide-react";
import type {
  CrashGameState,
  CrashAction,
} from "./crashTypes";
import { formatCrashMultiplier, calculateCrashProfit } from "./crashEngine";
import { useBetInput } from "@/lib/useBetInput";
import { formatCurrency, cn } from "@/lib/utils";
import BalanceBar from "@/components/shared/BalanceBar";

interface CrashControlsProps {
  state: CrashGameState;
  dispatch: React.Dispatch<CrashAction>;
  onPlaceBet: () => void;
  onCancelBet: () => void;
  onQueueBet: () => void;
  onCancelQueue: () => void;
  onCashOut: () => void;
  onStartAutoPlay: (config: {
    totalCount: number | null;
    cashoutAt: number;
    onWin: "same" | "increase" | "decrease" | "reset";
    onLoss: "same" | "increase" | "decrease" | "reset";
    increaseOnWinPercent: number;
    increaseOnLossPercent: number;
    baseBet: number;
    stopOnProfit: number | null;
    stopOnLoss: number | null;
  }) => void;
  onStopAutoPlay: () => void;
}

const INCREASE_PRESETS = [25, 50, 100, 200];

type WinLossAction = "same" | "increase" | "decrease" | "reset";

export default function CrashControls({
  state,
  dispatch,
  onPlaceBet,
  onCancelBet,
  onQueueBet,
  onCancelQueue,
  onCashOut,
  onStartAutoPlay,
  onStopAutoPlay,
}: CrashControlsProps) {
  const { config, balance, autoPlay, phase, hasBet, betQueued, cashedOut, cashoutMultiplier, currentMultiplier, speedMode } = state;

  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoCount, setAutoCount] = useState<number | null>(10);
  const [autoOnWin, setAutoOnWin] = useState<WinLossAction>("reset");
  const [autoOnLoss, setAutoOnLoss] = useState<WinLossAction>("reset");
  const [increaseOnWinPercent, setIncreaseOnWinPercent] = useState(50);
  const [increaseOnLossPercent, setIncreaseOnLossPercent] = useState(100);
  const [stopOnProfitEnabled, setStopOnProfitEnabled] = useState(false);
  const [stopOnLossEnabled, setStopOnLossEnabled] = useState(false);
  const [stopOnProfitAmount, setStopOnProfitAmount] = useState(100);
  const [stopOnLossAmount, setStopOnLossAmount] = useState(50);
  const inputRef = useRef<HTMLInputElement>(null);

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

        if (phase === "betting") {
          if (hasBet) {
            onCancelBet();
          } else {
            onPlaceBet();
          }
        } else if (phase === "running" && hasBet && !cashedOut) {
          onCashOut();
        } else if ((phase === "running" || phase === "crashed") && !autoPlay.active) {
          // Queue/cancel bet for next round
          if (betQueued) {
            onCancelQueue();
          } else if (!hasBet || cashedOut) {
            onQueueBet();
          }
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, hasBet, cashedOut, betQueued, autoPlay.active, onPlaceBet, onCancelBet, onCashOut, onQueueBet, onCancelQueue]);

  // ---------------------------------------------------------------------------
  // Bet amount helpers
  // ---------------------------------------------------------------------------

  const setBetQuick = useCallback(
    (action: "half" | "double") => {
      let amount: number;
      switch (action) {
        case "half":
          amount = Math.max(0.1, Math.round((config.betAmount / 2) * 100) / 100);
          break;
        case "double":
          amount = Math.min(1000, Math.round(config.betAmount * 2 * 100) / 100);
          break;
      }
      dispatch({ type: "SET_BET_AMOUNT", amount });
    },
    [config.betAmount, dispatch]
  );

  const betInput = useBetInput(
    config.betAmount,
    (amount) => dispatch({ type: "SET_BET_AMOUNT", amount })
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

  // ---------------------------------------------------------------------------
  // Auto-play start
  // ---------------------------------------------------------------------------

  const handleAutoPlayStart = useCallback(() => {
    onStartAutoPlay({
      totalCount: autoCount !== null ? Math.min(500, autoCount) : null,
      cashoutAt: config.autoCashout ?? 2.0,
      onWin: autoOnWin,
      onLoss: autoOnLoss,
      increaseOnWinPercent,
      increaseOnLossPercent,
      baseBet: config.betAmount,
      stopOnProfit: stopOnProfitEnabled ? stopOnProfitAmount : null,
      stopOnLoss: stopOnLossEnabled ? stopOnLossAmount : null,
    });
  }, [
    autoCount, config.autoCashout, autoOnWin, autoOnLoss,
    increaseOnWinPercent, increaseOnLossPercent,
    config.betAmount, stopOnProfitEnabled, stopOnProfitAmount,
    stopOnLossEnabled, stopOnLossAmount, onStartAutoPlay,
  ]);

  // ---------------------------------------------------------------------------
  // Computed values
  // ---------------------------------------------------------------------------

  // Bet amount input: disabled during autoplay or when a bet is queued (amount locked)
  const betAmountDisabled = autoPlay.active || betQueued;

  // Cashout input: disabled during autoplay only (can change target anytime else)
  const cashoutDisabled = autoPlay.active;

  const potentialProfit =
    hasBet && !cashedOut
      ? calculateCrashProfit(config.betAmount, true, currentMultiplier)
      : 0;

  const profitOnWin = config.betAmount * (config.autoCashout ?? 2.0) - config.betAmount;

  // Auto-play profit since start
  const autoPlayProfit = autoPlay.active
    ? state.stats.netProfit - autoPlay.startingNetProfit
    : 0;

  // ---------------------------------------------------------------------------
  // Shared UI sections
  // ---------------------------------------------------------------------------

  function renderBetAmount() {
    return (
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
            <span className="font-mono-stats text-pb-text-muted shrink-0 text-sm">$</span>
            <input
              suppressHydrationWarning
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={betInput.value}
              onChange={betInput.onChange}
              onFocus={betInput.onFocus}
              onBlur={betInput.onBlur}
              onKeyDown={betInput.onKeyDown}
              disabled={betAmountDisabled}
              className="flex-1 bg-transparent font-mono-stats text-sm text-right outline-none"
              style={{ color: "#F9FAFB", opacity: betAmountDisabled ? 0.5 : 1 }}
              aria-label="Bet amount"
            />
          </div>
          <div className="w-px self-stretch" style={{ backgroundColor: "#374151" }} />
          <div className="flex items-center shrink-0" style={{ backgroundColor: "#263040" }}>
            <button
              type="button"
              disabled={betAmountDisabled}
              onClick={() => setBetQuick("half")}
              className="px-2.5 py-1.5 font-body text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ color: "#9CA3AF" }}
            >
              &frac12;
            </button>
            <div className="w-px h-4 shrink-0" style={{ backgroundColor: "#374151" }} />
            <button
              type="button"
              disabled={betAmountDisabled}
              onClick={() => setBetQuick("double")}
              className="px-2.5 py-1.5 font-body text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ color: "#9CA3AF" }}
            >
              2&times;
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderCashoutAt() {
    return (
      <div className="mt-2.5">
        <label className="text-[10px] uppercase tracking-wider text-pb-text-muted mb-1 block">
          Cashout At
        </label>
        <div className="relative">
          <input suppressHydrationWarning
            type="text"
            inputMode="decimal"
            value={(config.autoCashout ?? 2.0).toFixed(2)}
            onChange={handleCashoutInput}
            disabled={cashoutDisabled}
            className="w-full bg-pb-bg-tertiary border border-pb-border py-1.5 px-2.5 text-xs rounded-md text-right font-mono-stats text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50 pr-14"
            aria-label="Cashout multiplier"
          />
          {/* Stepper arrows */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col -gap-px">
            <button
              type="button"
              onClick={() => adjustCashout(0.1)}
              disabled={(config.autoCashout ?? 2.0) >= 10000 || cashoutDisabled}
              className="text-pb-text-muted hover:text-pb-text-primary transition-colors disabled:opacity-30"
              aria-label="Increase cashout"
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => adjustCashout(-0.1)}
              disabled={(config.autoCashout ?? 2.0) <= 1.01 || cashoutDisabled}
              className="text-pb-text-muted hover:text-pb-text-primary transition-colors disabled:opacity-30"
              aria-label="Decrease cashout"
            >
              <ChevronDown size={14} />
            </button>
          </div>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">
            x
          </span>
        </div>
      </div>
    );
  }

  function renderProfitOnWin() {
    return (
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-pb-text-muted">Profit on Win</span>
        <span className="font-mono-stats text-xs text-pb-accent">
          {formatCurrency(profitOnWin)}
        </span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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

      {/* Merged: Bet Amount + Cashout At + Profit on Win */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-lg p-3">
        {renderBetAmount()}
        {renderCashoutAt()}
        {renderProfitOnWin()}
      </div>

      {/* ================================================================= */}
      {/* MANUAL TAB                                                        */}
      {/* ================================================================= */}
      {activeTab === "manual" && (
        <>
          {/* Action Button (desktop only — mobile uses fixed bar) */}
          <div className="hidden lg:block">
            {renderActionButton()}
          </div>
        </>
      )}

      {/* ================================================================= */}
      {/* AUTO TAB                                                          */}
      {/* ================================================================= */}
      {activeTab === "auto" && (
        <>
          {/* Number of Bets */}
          <div className="bg-pb-bg-secondary border border-pb-border rounded-lg p-2.5">
            <label className="text-[10px] uppercase tracking-wider text-pb-text-muted mb-1 block">
              Number of Bets
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input suppressHydrationWarning
                  type="text"
                  inputMode="numeric"
                  value={autoCount !== null ? autoCount : ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (e.target.value === "") {
                      setAutoCount(1);
                    } else if (!isNaN(val) && val >= 1) {
                      setAutoCount(Math.min(500, val));
                    }
                  }}
                  disabled={autoCount === null || autoPlay.active}
                  placeholder={autoCount === null ? "\u221E" : ""}
                  className="w-full bg-pb-bg-tertiary border border-pb-border py-1.5 px-2.5 text-xs rounded-md text-right font-mono-stats text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50"
                  aria-label="Number of bets"
                />
              </div>
              <button
                type="button"
                onClick={() => setAutoCount(autoCount === null ? 10 : null)}
                disabled={autoPlay.active}
                className={cn(
                  "w-8 h-8 rounded-md border flex items-center justify-center font-mono-stats text-lg transition-colors disabled:opacity-40",
                  autoCount === null
                    ? "bg-pb-accent/15 text-pb-accent border-pb-accent/30"
                    : "bg-pb-bg-tertiary text-pb-text-secondary border-pb-border hover:bg-pb-border hover:text-pb-text-primary"
                )}
                aria-label="Toggle infinite bets"
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
                {speedMode === "quick" ? "750ms rounds — skip animations" : "150ms rounds — maximum speed"}
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
                <div className="px-2.5 pb-2.5 space-y-2">
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
                          {INCREASE_PRESETS.map((pct) => (
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
                            aria-label="On win percentage"
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
                          {INCREASE_PRESETS.map((pct) => (
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
                            aria-label="On loss percentage"
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
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">
                          $
                        </span>
                        <input suppressHydrationWarning
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
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">
                          $
                        </span>
                        <input suppressHydrationWarning
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
                </div>
              )}
            </div>
          )}

          {/* Start Autobet / Active summary */}
          {!autoPlay.active && (
            <button
              type="button"
              onClick={handleAutoPlayStart}
              className="w-full py-2.5 rounded-lg bg-pb-accent/15 text-pb-accent font-heading font-semibold text-sm border border-pb-accent/30 hover:bg-pb-accent/25 transition-colors disabled:opacity-40"
            >
              Start Autobet
            </button>
          )}

          {autoPlay.active && (
            <>
              {/* Strategy Summary */}
              <div className="bg-pb-bg-secondary border border-pb-border rounded-lg p-2.5 space-y-1.5">
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
                <div className="flex justify-between text-xs">
                  <span className="text-pb-text-muted">Current Bet</span>
                  <span className="text-pb-text-primary font-mono-stats">
                    {formatCurrency(config.betAmount)}
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

              {/* Stop Autobet */}
              <button
                type="button"
                onClick={onStopAutoPlay}
                className="w-full py-2.5 rounded-lg bg-pb-danger/15 text-pb-danger font-heading font-semibold text-sm border border-pb-danger/30 hover:bg-pb-danger/25 transition-colors"
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

      {/* Session Reminder */}
      {state.showSessionReminder && (
        <div className="bg-pb-bg-secondary border border-pb-warning/30 rounded-lg px-2.5 py-1.5 text-[10px] text-pb-text-secondary">
          <p>
            {state.sessionRoundCount} rounds — practice mode.
          </p>
          <button
            type="button"
            onClick={() => dispatch({ type: "DISMISS_SESSION_REMINDER" })}
            className="text-pb-warning text-[10px] mt-1 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Keyboard hint (desktop only) */}
      <div className="hidden lg:block text-center text-xs text-pb-text-muted">
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
    // 1. CASH OUT: highest priority during running phase with active bet
    if (phase === "running" && hasBet && !cashedOut) {
      return (
        <motion.button
          key="cashout"
          type="button"
          onClick={onCashOut}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-9 rounded-lg font-heading font-bold text-sm text-pb-bg-primary hover:brightness-110 active:scale-[0.98]"
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

    // 2. AUTOPLAY STATUS: when autoplay active and no cashout needed
    if (autoPlay.active && !(phase === "running" && cashedOut)) {
      const countLabel = autoPlay.totalCount
        ? `${autoPlay.currentCount}/${autoPlay.totalCount}`
        : `${autoPlay.currentCount}`;
      return (
        <button
          key="auto-playing"
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

    // 3. BETTING PHASE: place or cancel bet
    if (phase === "betting" && !hasBet) {
      const canBet = config.betAmount <= balance;
      return (
        <button
          key="bet-next"
          type="button"
          onClick={onPlaceBet}
          disabled={!canBet}
          className="w-full h-9 rounded-lg font-heading font-bold text-sm hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed"
          style={{
            backgroundColor: canBet ? "#00E5A0" : "#374151",
            color: canBet ? "#0B0F1A" : "#6B7280",
            boxShadow: canBet
              ? "0 0 20px rgba(0, 229, 160, 0.2)"
              : "none",
          }}
        >
          Place Bet
        </button>
      );
    }

    if (phase === "betting" && hasBet) {
      return (
        <button
          key="cancel-bet"
          type="button"
          onClick={onCancelBet}
          className="w-full h-9 rounded-lg bg-pb-danger text-white font-heading font-bold text-sm hover:brightness-110 active:scale-[0.98]"
        >
          Cancel Bet
        </button>
      );
    }

    // 4. CASHED OUT: show result + allow queueing next bet
    if (phase === "running" && cashedOut && cashoutMultiplier !== null) {
      const canQueue = !betQueued && config.betAmount <= balance;
      return (
        <div className="space-y-1.5">
          <div className="text-center text-xs font-mono-stats text-pb-accent">
            Cashed Out @ {formatCrashMultiplier(cashoutMultiplier)}!
          </div>
          {betQueued ? (
            <button
              key="cancel-queue-cashed"
              type="button"
              onClick={onCancelQueue}
              className="w-full h-9 rounded-lg bg-pb-danger text-white font-heading font-bold text-sm hover:brightness-110 active:scale-[0.98]"
            >
              Cancel Bet (Next Round)
            </button>
          ) : (
            <button
              key="queue-after-cashout"
              type="button"
              onClick={onQueueBet}
              disabled={!canQueue}
              className="w-full h-9 rounded-lg font-heading font-bold text-sm hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed"
              style={{
                backgroundColor: canQueue ? "#00E5A0" : "#374151",
                color: canQueue ? "#0B0F1A" : "#6B7280",
                boxShadow: canQueue ? "0 0 20px rgba(0, 229, 160, 0.2)" : "none",
              }}
            >
              Bet (Next Round)
            </button>
          )}
        </div>
      );
    }

    // 5. RUNNING/CRASHED without bet: queue for next round
    if (betQueued) {
      return (
        <button
          key="cancel-queue"
          type="button"
          onClick={onCancelQueue}
          className="w-full h-9 rounded-lg bg-pb-danger text-white font-heading font-bold text-sm hover:brightness-110 active:scale-[0.98]"
        >
          Cancel Bet (Next Round)
        </button>
      );
    }

    // 6. DEFAULT: Bet for next round (running without bet, or crashed)
    const canQueue = config.betAmount <= balance;
    return (
      <button
        key="bet-next-round"
        type="button"
        onClick={onQueueBet}
        disabled={!canQueue}
        className="w-full h-9 rounded-lg font-heading font-bold text-sm hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed"
        style={{
          backgroundColor: canQueue ? "#00E5A0" : "#374151",
          color: canQueue ? "#0B0F1A" : "#6B7280",
          boxShadow: canQueue ? "0 0 20px rgba(0, 229, 160, 0.2)" : "none",
        }}
      >
        Bet (Next Round)
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
