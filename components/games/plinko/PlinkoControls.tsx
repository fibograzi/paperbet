"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Zap } from "lucide-react";
import type { RiskLevel, PlinkoRows } from "@/lib/types";
import type { PlinkoGameState, PlinkoAction } from "./plinkoTypes";
import { formatCurrency } from "@/lib/utils";
import { useBetInput } from "@/lib/useBetInput";
import BalanceBar from "@/components/shared/BalanceBar";

interface PlinkoControlsProps {
  state: PlinkoGameState;
  dispatch: React.Dispatch<PlinkoAction>;
  onDrop: () => void;
  canDrop: boolean;
  onStartAutoPlay: (config: {
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

const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high", "expert"];
const ROW_RANGE: PlinkoRows[] = [8, 9, 10, 11, 12, 13, 14, 15, 16];

const selectStyle: React.CSSProperties = {
  backgroundColor: "#1F2937",
  border: "1px solid #374151",
  color: "#F9FAFB",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
};

export default function PlinkoControls({
  state,
  dispatch,
  onDrop,
  canDrop,
  onStartAutoPlay,
  onStopAutoPlay,
}: PlinkoControlsProps) {
  const { config, balance, autoPlay, activeBalls, speedMode } = state;
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");
  const [autoCountInput, setAutoCountInput] = useState("10");
  const [isInfinite, setIsInfinite] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const betInput = useBetInput(
    config.betAmount,
    (amount) => dispatch({ type: "SET_BET_AMOUNT", amount })
  );

  // Stop conditions
  const [stopOnProfit, setStopOnProfit] = useState("");
  const [stopOnLoss, setStopOnLoss] = useState("");
  const [stopOnWinMultiplier, setStopOnWinMultiplier] = useState("");

  // Config locked while balls in flight
  const configLocked = activeBalls > 0 || autoPlay.active;

  // Refs to avoid stale closures in the hold-interval
  const canDropRef = useRef(canDrop);
  const onDropRef = useRef(onDrop);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    canDropRef.current = canDrop;
    onDropRef.current = onDrop;
  }, [canDrop, onDrop]);

  // Spacebar shortcut — smart cascade: evenly spaces 25 balls across animation duration
  useEffect(() => {
    const clearHold = () => {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();

      if (autoPlay.active) {
        if (!e.repeat) onStopAutoPlay();
        return;
      }

      // Ignore OS key-repeat — the interval handles continuous drops
      if (e.repeat) return;

      // First press: drop immediately + start timed interval
      if (canDropRef.current) onDropRef.current();

      // Very small delay between drops for rapid-fire cascade
      const interval = 150;

      clearHold();
      holdIntervalRef.current = setInterval(() => {
        if (canDropRef.current) onDropRef.current();
      }, interval);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") clearHold();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearHold);

    return () => {
      clearHold();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearHold);
    };
  }, [autoPlay.active, onStopAutoPlay, config.rows]);

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

  const handleAutoPlayStart = useCallback(() => {
    let resolvedCount: number | null = null;
    if (!isInfinite) {
      const parsed = parseInt(autoCountInput, 10);
      resolvedCount = !isNaN(parsed) && parsed > 0 ? Math.min(500, parsed) : 10;
    }

    onStartAutoPlay({
      totalCount: resolvedCount,
      stopOnWinMultiplier:
        stopOnWinMultiplier.trim() !== ""
          ? parseFloat(stopOnWinMultiplier)
          : null,
      stopOnProfit:
        stopOnProfit.trim() !== "" ? parseFloat(stopOnProfit) : null,
      stopOnLoss:
        stopOnLoss.trim() !== "" ? parseFloat(stopOnLoss) : null,
      onWin: "reset",
      onLoss: "reset",
      increaseOnWinPercent: 0,
      increaseOnLossPercent: 0,
    });
  }, [
    isInfinite,
    autoCountInput,
    stopOnWinMultiplier,
    stopOnProfit,
    stopOnLoss,
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
    <div className="flex flex-col gap-2 w-full">
      {/* Balance */}
      <BalanceBar balance={balance} onReset={() => dispatch({ type: "RESET_BALANCE" })} />

      {/* Manual / Auto tab toggle */}
      <div className="flex rounded-md p-0.5" style={{ backgroundColor: "#1F2937" }}>
        {(["manual", "auto"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => !autoPlay.active && setActiveTab(tab)}
            className="flex-1 py-1.5 rounded text-center text-xs font-heading font-semibold transition-colors duration-150"
            style={{
              backgroundColor: activeTab === tab ? "#0B0F1A" : "transparent",
              color: activeTab === tab ? "#F9FAFB" : "#6B7280",
            }}
          >
            {tab === "manual" ? "Manual" : "Auto"}
          </button>
        ))}
      </div>

      {/* Bet Amount + Config */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-lg p-3">
        <label className="text-[10px] text-pb-text-muted mb-1 block uppercase tracking-wider">
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
              disabled={autoPlay.active}
              className="flex-1 bg-transparent font-mono-stats text-sm text-right outline-none"
              style={{ color: "#F9FAFB", opacity: autoPlay.active ? 0.5 : 1 }}
              aria-label="Bet amount"
            />
          </div>
          <div className="w-px self-stretch" style={{ backgroundColor: "#374151" }} />
          <div className="flex items-center shrink-0" style={{ backgroundColor: "#263040" }}>
            <button
              type="button"
              disabled={autoPlay.active}
              onClick={() => setBetQuick("half")}
              className="px-2.5 py-1.5 font-body text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ color: "#9CA3AF" }}
            >
              &frac12;
            </button>
            <div className="w-px h-3.5 shrink-0" style={{ backgroundColor: "#374151" }} />
            <button
              type="button"
              disabled={autoPlay.active}
              onClick={() => setBetQuick("double")}
              className="px-2.5 py-1.5 font-body text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ color: "#9CA3AF" }}
            >
              2&times;
            </button>
          </div>
        </div>

        {/* Difficulty + Rows — side by side */}
        <div className="flex gap-2 mt-2.5">
          <div className="flex-1">
            <label className="text-[10px] text-pb-text-muted mb-1 block uppercase tracking-wider">Difficulty</label>
            <select
              value={config.risk}
              onChange={(e) => dispatch({ type: "SET_RISK", risk: e.target.value as RiskLevel })}
              disabled={configLocked}
              className="w-full rounded-md py-1.5 px-2.5 text-xs font-heading font-semibold capitalize appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-pb-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={selectStyle}
              aria-label="Difficulty level"
            >
              {RISK_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="w-[80px] shrink-0">
            <label className="text-[10px] text-pb-text-muted mb-1 block uppercase tracking-wider">Rows</label>
            <select
              value={config.rows}
              onChange={(e) => {
                const v = parseInt(e.target.value) as PlinkoRows;
                dispatch({ type: "SET_ROWS", rows: v });
              }}
              disabled={configLocked}
              className="w-full rounded-md py-1.5 px-2.5 text-xs font-mono-stats appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-pb-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={selectStyle}
              aria-label="Number of rows"
            >
              {ROW_RANGE.map((rows) => (
                <option key={rows} value={rows}>
                  {rows}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Manual tab content */}
      {activeTab === "manual" && (
        <>
          <div className="hidden lg:block">
            {autoPlay.active ? (
              <button
                type="button"
                onClick={onStopAutoPlay}
                className="w-full h-9 rounded-lg bg-pb-danger text-white font-heading font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Stop ({autoPlay.currentCount}
                {autoPlay.totalCount ? ` / ${autoPlay.totalCount}` : ""})
              </button>
            ) : (
              <button
                type="button"
                onClick={onDrop}
                disabled={!canDrop}
                className="w-full h-9 rounded-lg bg-pb-accent text-pb-bg-primary font-heading font-bold text-sm transition-all hover:shadow-[0_0_24px_rgba(0,229,160,0.3)] hover:brightness-105 active:scale-[0.98] disabled:bg-pb-border disabled:text-pb-text-muted disabled:cursor-not-allowed disabled:shadow-none"
                style={{
                  boxShadow: canDrop ? "0 0 16px rgba(0, 229, 160, 0.2)" : "none",
                }}
              >
                Bet
              </button>
            )}
          </div>
          <div className="hidden lg:block text-center text-[10px] text-pb-text-muted">
            Press <kbd className="px-1 py-px rounded bg-pb-bg-tertiary border border-pb-border font-mono-stats text-[9px]">Space</kbd> to drop
          </div>
        </>
      )}

      {/* Auto tab content */}
      {activeTab === "auto" && (
        <>
          {!autoPlay.active && (
            <div className="space-y-2">
              {/* Number of Bets */}
              <div className="bg-pb-bg-secondary border border-pb-border rounded-lg p-2.5">
                <div className="text-[10px] text-pb-text-muted mb-1 uppercase tracking-wider">Number of Bets</div>
                <div className="flex gap-1.5">
                  <div className="flex-1 relative">
                    <input suppressHydrationWarning
                      type="number"
                      min={1}
                      max={500}
                      value={isInfinite ? "" : autoCountInput}
                      placeholder={isInfinite ? "\u221E" : "10"}
                      disabled={isInfinite}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setAutoCountInput("");
                          return;
                        }
                        const parsed = parseInt(val, 10);
                        if (!isNaN(parsed)) {
                          setAutoCountInput(String(Math.min(500, Math.max(1, parsed))));
                        }
                      }}
                      className="w-full bg-pb-bg-tertiary border border-pb-border rounded-md py-1.5 px-2.5 text-xs font-mono-stats text-pb-text-primary placeholder:text-pb-text-muted/50 focus:outline-none focus:ring-1 focus:ring-pb-accent/50 disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsInfinite(!isInfinite)}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-base font-mono-stats shrink-0 transition-colors"
                    style={toggleBtnStyle(isInfinite)}
                    aria-label="Toggle infinite bets"
                  >
                    &infin;
                  </button>
                </div>
              </div>

              {/* Advanced collapsible */}
              <div className="bg-pb-bg-secondary border border-pb-border rounded-lg">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full px-2.5 py-2 text-left"
                >
                  <span className="text-xs font-heading font-semibold text-pb-text-secondary">
                    Advanced
                  </span>
                  <ChevronDown
                    size={14}
                    className="text-pb-text-muted transition-transform duration-200"
                    style={{ transform: showAdvanced ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>

                {showAdvanced && (
                  <div className="px-2.5 pb-2.5 space-y-2">
                    {/* Stop on Profit */}
                    <div>
                      <div className="text-xs text-pb-text-muted mb-1.5">Stop on Profit</div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pb-text-muted text-xs">
                          $
                        </span>
                        <input suppressHydrationWarning
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
                        <input suppressHydrationWarning
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
                        <input suppressHydrationWarning
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
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Speed mode selector — always visible in Auto tab */}
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
                {speedMode === "quick" ? "Faster drops — reduced delays" : "Maximum speed — instant drops"}
              </p>
            )}
          </div>

          {/* Start / Stop autobet button — desktop only */}
          <div className="hidden lg:block">
            {autoPlay.active ? (
              <button
                type="button"
                onClick={onStopAutoPlay}
                className="w-full h-9 rounded-lg bg-pb-danger text-white font-heading font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Stop ({autoPlay.currentCount}
                {autoPlay.totalCount ? ` / ${autoPlay.totalCount}` : ""})
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAutoPlayStart}
                disabled={!canDrop}
                className="w-full h-9 rounded-lg bg-pb-accent/15 text-pb-accent font-heading font-bold text-sm border border-pb-accent/30 hover:bg-pb-accent/25 transition-colors disabled:opacity-40"
              >
                Start Autobet
              </button>
            )}
          </div>
        </>
      )}

      {/* Mobile: Fixed action bar at bottom of viewport */}
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
            onClick={onStopAutoPlay}
            className="w-full h-11 rounded-lg bg-pb-danger text-white font-heading font-bold text-sm transition-all active:scale-[0.98]"
          >
            Stop ({autoPlay.currentCount}
            {autoPlay.totalCount ? ` / ${autoPlay.totalCount}` : ""})
          </button>
        ) : activeTab === "manual" ? (
          <button
            type="button"
            onClick={onDrop}
            disabled={!canDrop}
            className="w-full h-11 rounded-lg bg-pb-accent text-pb-bg-primary font-heading font-bold text-sm transition-all active:scale-[0.98] disabled:bg-pb-border disabled:text-pb-text-muted disabled:cursor-not-allowed disabled:shadow-none"
            style={{
              boxShadow: canDrop ? "0 0 16px rgba(0, 229, 160, 0.2)" : "none",
            }}
          >
            Bet
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAutoPlayStart}
            disabled={!canDrop}
            className="w-full h-11 rounded-lg bg-pb-accent/15 text-pb-accent font-heading font-bold text-sm border border-pb-accent/30 transition-colors disabled:opacity-40"
          >
            Start Autobet
          </button>
        )}
      </div>

    </div>
  );
}
