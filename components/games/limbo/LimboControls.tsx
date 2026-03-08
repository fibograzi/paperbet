"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Zap, ChevronDown } from "lucide-react";
import type {
  LimboGameState,
  LimboAction,
  LimboAutoPlayConfig,
  LimboBetAdjustment,
  LimboTargetAdjustment,
  LimboAutoBetSpeed,
  LimboStrategy,
  LimboAnimationSpeed,
} from "./limboTypes";
import {
  MIN_BET,
  MAX_BET,
  MIN_TARGET,
  MAX_TARGET,
  clampBet,
  clampTarget,
  calculateWinChance,
  getWinChanceColor,
} from "./limboEngine";
import { formatCurrency } from "@/lib/utils";

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
// Strategy presets
// ---------------------------------------------------------------------------

interface StrategyPreset {
  id: LimboStrategy;
  name: string;
  description: string;
  target: number;
  betAmount?: number;
  onWinBet: LimboBetAdjustment;
  onWinBetValue: number;
  onLossBet: LimboBetAdjustment;
  onLossBetValue: number;
  stopOnLoss?: number;    // multiplier of base bet
  stopOnProfit?: number;  // multiplier of base bet
}

const STRATEGY_PRESETS: StrategyPreset[] = [
  { id: "safe_grinder", name: "Safe Grinder", description: "90% win, tiny profit", target: 1.10, onWinBet: "same", onWinBetValue: 0, onLossBet: "same", onLossBetValue: 0, stopOnLoss: 20 },
  { id: "coin_flip", name: "Coin Flip", description: "49.5% win chance", target: 2.00, onWinBet: "same", onWinBetValue: 0, onLossBet: "same", onLossBetValue: 0 },
  { id: "sniper", name: "Sniper", description: "9.9% win, 10x payout", target: 10.00, onWinBet: "same", onWinBetValue: 0, onLossBet: "same", onLossBetValue: 0, stopOnLoss: 25 },
  { id: "moon_shot", name: "Moon Shot", description: "0.99% win, 100x payout", target: 100.00, betAmount: 0.10, onWinBet: "same", onWinBetValue: 0, onLossBet: "same", onLossBetValue: 0, stopOnProfit: 50 },
  { id: "martingale", name: "Martingale", description: "Double on loss", target: 2.00, onWinBet: "reset", onWinBetValue: 0, onLossBet: "increase_percent", onLossBetValue: 100 },
  { id: "anti_martingale", name: "Anti-Martingale", description: "Double on win", target: 2.00, onWinBet: "increase_percent", onWinBetValue: 100, onLossBet: "reset", onLossBetValue: 0 },
  { id: "dalembert", name: "D'Alembert", description: "+$0.10 loss, -$0.10 win", target: 2.00, onWinBet: "decrease_flat", onWinBetValue: 0.10, onLossBet: "increase_flat", onLossBetValue: 0.10 },
];

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
  const { phase, betAmount, balance, targetMultiplier, winChance, animationSpeed, autoPlay } = state;
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");
  const isIdle = phase === "idle";
  const isAnimating = phase === "animating";
  const isAutoRunning = autoPlay.active;

  // -------------------------------------------------------------------------
  // Auto-play config state
  // -------------------------------------------------------------------------

  const [autoNumberOfBets, setAutoNumberOfBets] = useState(100);
  const [autoSpeed, setAutoSpeed] = useState<LimboAutoBetSpeed>("normal");
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
  const [selectedStrategy, setSelectedStrategy] = useState<LimboStrategy>("custom");
  const [showStrategies, setShowStrategies] = useState(false);
  const [showOnWin, setShowOnWin] = useState(false);
  const [showOnLoss, setShowOnLoss] = useState(false);

  // -------------------------------------------------------------------------
  // Strategy application
  // -------------------------------------------------------------------------

  const applyStrategy = useCallback((preset: StrategyPreset) => {
    setSelectedStrategy(preset.id);
    setOnWinBetAction(preset.onWinBet);
    setOnWinBetValue(preset.onWinBetValue);
    setOnLossBetAction(preset.onLossBet);
    setOnLossBetValue(preset.onLossBetValue);
    setOnWinTargetAction("same");
    setOnLossTargetAction("same");
    dispatch({ type: "SET_TARGET", target: preset.target });

    // Set bet amount if preset specifies one
    if (preset.betAmount !== undefined) {
      dispatch({ type: "SET_BET_AMOUNT", amount: preset.betAmount });
    }

    // Configure stop-on-loss if preset specifies (multiplier of current bet)
    if (preset.stopOnLoss !== undefined) {
      setStopOnLossEnabled(true);
      setStopOnLossAmount(preset.stopOnLoss * (preset.betAmount ?? betAmount));
    } else {
      setStopOnLossEnabled(false);
    }

    // Configure stop-on-profit if preset specifies (multiplier of current bet)
    if (preset.stopOnProfit !== undefined) {
      setStopOnProfitEnabled(true);
      setStopOnProfitAmount(preset.stopOnProfit * (preset.betAmount ?? betAmount));
    } else {
      setStopOnProfitEnabled(false);
    }
  }, [dispatch, betAmount]);

  // -------------------------------------------------------------------------
  // Build auto-play config
  // -------------------------------------------------------------------------

  const buildAutoConfig = useCallback((): LimboAutoPlayConfig => ({
    numberOfBets: autoNumberOfBets,
    speed: autoSpeed,
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
    strategy: selectedStrategy,
  }), [
    autoNumberOfBets, autoSpeed,
    onWinBetAction, onWinBetValue,
    onLossBetAction, onLossBetValue,
    onWinTargetAction, onWinTargetValue,
    onLossTargetAction, onLossTargetValue,
    stopOnProfitEnabled, stopOnProfitAmount,
    stopOnLossEnabled, stopOnLossAmount,
    stopOnWinMultEnabled, stopOnWinMultValue,
    selectedStrategy,
  ]);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const setBet = useCallback((amount: number) => {
    dispatch({ type: "SET_BET_AMOUNT", amount });
  }, [dispatch]);

  const isMartingaleType = selectedStrategy === "martingale" || selectedStrategy === "anti_martingale";

  // Target step logic
  const getTargetStep = (target: number) => {
    if (target < 2) return 0.01;
    if (target < 100) return 0.10;
    return 1.00;
  };

  // Payout display
  const payout = Math.floor(betAmount * targetMultiplier * 100) / 100;

  // Win chance color
  const wcColor = getWinChanceColor(winChance);

  // -------------------------------------------------------------------------
  // Editable linked fields
  // -------------------------------------------------------------------------

  const [editingTarget, setEditingTarget] = useState(false);
  const [editTargetValue, setEditTargetValue] = useState("");
  const [editingWinChance, setEditingWinChance] = useState(false);
  const [editWinChanceValue, setEditWinChanceValue] = useState("");
  const targetInputRef = useRef<HTMLInputElement>(null);
  const wcInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Tab toggle */}
      <div
        className="flex rounded-lg p-1"
        style={{ backgroundColor: "#1F2937" }}
      >
        {(["manual", "auto"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-md text-center font-body text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeTab === tab ? "#0B0F1A" : "transparent",
              color: activeTab === tab ? "#F9FAFB" : "#6B7280",
            }}
          >
            {tab === "manual" ? "Manual" : "Auto"}
          </button>
        ))}
      </div>

      {/* Bet amount */}
      <div className="rounded-xl p-4" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-body text-sm" style={{ color: "#9CA3AF" }}>Bet Amount</span>
          {isAutoRunning && isMartingaleType && (
            <span className="text-xs font-body px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,229,160,0.15)", color: "#00E5A0" }}>
              {STRATEGY_PRESETS.find((s) => s.id === selectedStrategy)?.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!isIdle || betAmount <= MIN_BET}
            onClick={() => setBet(betAmount - 0.10)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              opacity: !isIdle || betAmount <= MIN_BET ? 0.4 : 1,
            }}
          >
            <Minus size={16} style={{ color: "#9CA3AF" }} />
          </button>

          <div
            className="flex-1 rounded-lg px-3 py-2 flex items-center"
            style={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
          >
            <span className="font-mono-stats" style={{ color: "#6B7280", fontSize: 18 }}>$</span>
            <input
              type="number"
              value={betAmount.toFixed(2)}
              onChange={(e) => setBet(parseFloat(e.target.value) || MIN_BET)}
              disabled={!isIdle}
              className="flex-1 bg-transparent font-mono-stats text-right outline-none"
              style={{ fontSize: 18, color: "#F9FAFB" }}
              step={0.10}
              min={MIN_BET}
              max={MAX_BET}
              aria-label="Bet amount"
            />
          </div>

          <button
            type="button"
            disabled={!isIdle || betAmount >= MAX_BET}
            onClick={() => setBet(betAmount + 0.10)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              opacity: !isIdle || betAmount >= MAX_BET ? 0.4 : 1,
            }}
          >
            <Plus size={16} style={{ color: "#9CA3AF" }} />
          </button>
        </div>

        {/* Quick-select buttons */}
        <div className="grid grid-cols-4 gap-2 mt-2">
          {[
            { label: "\u00BD", action: () => setBet(betAmount / 2) },
            { label: "2\u00D7", action: () => setBet(betAmount * 2) },
            { label: "Min", action: () => setBet(MIN_BET) },
            { label: "Max", action: () => setBet(MAX_BET) },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              disabled={!isIdle}
              onClick={btn.action}
              className="py-1.5 rounded-md font-body text-xs transition-colors"
              style={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                color: "#9CA3AF",
                opacity: !isIdle ? 0.5 : 1,
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {isMartingaleType && (
          <p className="text-xs mt-2 font-body" style={{ color: "#F59E0B" }}>
            Can lead to rapid bankroll depletion
          </p>
        )}
      </div>

      {/* Target Multiplier */}
      <div className="rounded-xl p-4" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
        <span className="font-body text-sm block mb-2" style={{ color: "#9CA3AF" }}>Target Multiplier</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!isIdle || targetMultiplier <= MIN_TARGET}
            onClick={() => dispatch({ type: "SET_TARGET", target: targetMultiplier - getTargetStep(targetMultiplier) })}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              opacity: !isIdle || targetMultiplier <= MIN_TARGET ? 0.4 : 1,
            }}
          >
            <Minus size={16} style={{ color: "#9CA3AF" }} />
          </button>

          <div
            className="flex-1 rounded-lg px-3 py-2 flex items-center"
            style={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
          >
            <input
              ref={targetInputRef}
              type={editingTarget ? "text" : "number"}
              value={editingTarget ? editTargetValue : targetMultiplier.toFixed(2)}
              onChange={(e) => {
                if (editingTarget) {
                  setEditTargetValue(e.target.value);
                } else {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) dispatch({ type: "SET_TARGET", target: val });
                }
              }}
              onFocus={() => {
                setEditingTarget(true);
                setEditTargetValue(targetMultiplier.toFixed(2));
                setTimeout(() => targetInputRef.current?.select(), 0);
              }}
              onBlur={() => {
                setEditingTarget(false);
                const val = parseFloat(editTargetValue);
                if (!isNaN(val)) dispatch({ type: "SET_TARGET", target: val });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") setEditingTarget(false);
              }}
              disabled={!isIdle}
              className="flex-1 bg-transparent font-mono-stats text-right outline-none"
              style={{ fontSize: 18, color: "#F9FAFB" }}
              step={0.01}
              min={MIN_TARGET}
              max={MAX_TARGET}
              aria-label="Target multiplier"
            />
            <span className="font-mono-stats ml-1" style={{ fontSize: 18, color: "#6B7280" }}>x</span>
          </div>

          <button
            type="button"
            disabled={!isIdle || targetMultiplier >= MAX_TARGET}
            onClick={() => dispatch({ type: "SET_TARGET", target: targetMultiplier + getTargetStep(targetMultiplier) })}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              opacity: !isIdle || targetMultiplier >= MAX_TARGET ? 0.4 : 1,
            }}
          >
            <Plus size={16} style={{ color: "#9CA3AF" }} />
          </button>
        </div>

        {/* Quick-select targets */}
        <div className="grid grid-cols-4 gap-2 mt-2">
          {[1.5, 2, 10, 100].map((t) => (
            <button
              key={t}
              type="button"
              disabled={!isIdle}
              onClick={() => dispatch({ type: "SET_TARGET", target: t })}
              className="py-1.5 rounded-md font-body text-xs transition-colors"
              style={{
                backgroundColor: targetMultiplier === t ? "rgba(0,229,160,0.15)" : "#1F2937",
                border: targetMultiplier === t ? "1px solid rgba(0,229,160,0.3)" : "1px solid #374151",
                color: targetMultiplier === t ? "#00E5A0" : "#9CA3AF",
                opacity: !isIdle ? 0.5 : 1,
              }}
            >
              {t}x
            </button>
          ))}
        </div>
      </div>

      {/* Linked fields indicator */}
      <div className="flex items-center justify-center gap-1.5 -mb-2">
        <div className="h-px flex-1" style={{ backgroundColor: "#374151" }} />
        <span className="font-mono-stats text-xs px-1.5" style={{ color: "#6B7280" }}>&harr;</span>
        <div className="h-px flex-1" style={{ backgroundColor: "#374151" }} />
      </div>

      {/* Win Chance & Payout row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Win Chance (editable, linked to target) */}
        <div className="rounded-xl p-3" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
          <span className="font-body text-xs block mb-1" style={{ color: "#6B7280" }}>Win Chance</span>
          <div className="flex items-center">
            <input
              ref={wcInputRef}
              type={editingWinChance ? "text" : "number"}
              value={editingWinChance ? editWinChanceValue : winChance.toFixed(winChance < 1 ? 4 : 2)}
              onChange={(e) => {
                if (editingWinChance) {
                  setEditWinChanceValue(e.target.value);
                } else {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) dispatch({ type: "SET_WIN_CHANCE", winChance: val });
                }
              }}
              onFocus={() => {
                setEditingWinChance(true);
                setEditWinChanceValue(winChance.toFixed(winChance < 1 ? 4 : 2));
                setTimeout(() => wcInputRef.current?.select(), 0);
              }}
              onBlur={() => {
                setEditingWinChance(false);
                const val = parseFloat(editWinChanceValue);
                if (!isNaN(val)) dispatch({ type: "SET_WIN_CHANCE", winChance: val });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") setEditingWinChance(false);
              }}
              disabled={!isIdle}
              className="flex-1 bg-transparent font-mono-stats font-medium outline-none"
              style={{ fontSize: 16, color: wcColor }}
              aria-label="Win chance"
            />
            <span className="font-mono-stats" style={{ fontSize: 14, color: "#6B7280" }}>%</span>
          </div>
        </div>

        {/* Payout (read-only) */}
        <div className="rounded-xl p-3" style={{ backgroundColor: "#111827", border: "1px solid #374151" }}>
          <span className="font-body text-xs block mb-1" style={{ color: "#6B7280" }}>Payout on Win</span>
          <p className="font-mono-stats font-medium" style={{ fontSize: 16, color: "#F9FAFB" }}>
            {formatCurrency(payout)}
          </p>
        </div>
      </div>

      {/* ===== MANUAL TAB ===== */}
      {activeTab === "manual" && (
        <>
          {/* Bet button */}
          <motion.button
            type="button"
            disabled={isAnimating || balance < betAmount || isAutoRunning}
            onClick={onBet}
            className="w-full flex items-center justify-center gap-2 rounded-xl font-body font-bold transition-colors"
            style={{
              height: 48,
              backgroundColor: isAnimating || isAutoRunning ? "#374151" : "#00E5A0",
              color: isAnimating || isAutoRunning ? "#9CA3AF" : "#0B0F1A",
              boxShadow: isAnimating || isAutoRunning ? "none" : "0 0 20px rgba(0,229,160,0.2)",
              cursor: isAnimating || balance < betAmount || isAutoRunning ? "not-allowed" : "pointer",
              fontSize: 16,
            }}
            whileHover={!isAnimating && !isAutoRunning ? { backgroundColor: "#1AFFA8", boxShadow: "0 0 30px rgba(0,229,160,0.3)" } : {}}
            whileTap={!isAnimating && !isAutoRunning ? { scale: 0.98 } : {}}
            aria-label="Place bet"
          >
            <Zap size={18} />
            {isAnimating ? "..." : "Bet"}
          </motion.button>

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
          {/* Number of Bets */}
          <div>
            <span className="font-body text-sm block mb-1.5" style={{ color: "#9CA3AF" }}>Number of Bets</span>
            <div className="grid grid-cols-6 gap-1">
              {[10, 25, 50, 100, 500, Infinity].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={isAutoRunning}
                  onClick={() => setAutoNumberOfBets(n)}
                  className="py-1.5 rounded-md font-body text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor: autoNumberOfBets === n ? "rgba(0,229,160,0.15)" : "transparent",
                    color: autoNumberOfBets === n ? "#00E5A0" : "#9CA3AF",
                  }}
                >
                  {isFinite(n) ? n : "\u221E"}
                </button>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div>
            <span className="font-body text-xs block mb-1.5" style={{ color: "#6B7280" }}>Speed</span>
            <div className="flex rounded-lg p-1" style={{ backgroundColor: "#1F2937" }}>
              {(["normal", "fast", "turbo"] as LimboAutoBetSpeed[]).map((speed) => (
                <button
                  key={speed}
                  type="button"
                  disabled={isAutoRunning}
                  onClick={() => setAutoSpeed(speed)}
                  className="flex-1 py-1.5 rounded-md text-center font-body text-xs font-semibold transition-colors capitalize"
                  style={{
                    backgroundColor: autoSpeed === speed ? "rgba(0,229,160,0.15)" : "transparent",
                    color: autoSpeed === speed ? "#00E5A0" : "#9CA3AF",
                  }}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* On Win (collapsible) */}
          <CollapsibleSection title="On Win" open={showOnWin} onToggle={() => setShowOnWin(!showOnWin)}>
            <BetAdjustmentSelector
              label="Bet"
              action={onWinBetAction}
              value={onWinBetValue}
              disabled={isAutoRunning}
              onActionChange={setOnWinBetAction}
              onValueChange={setOnWinBetValue}
            />
            <TargetAdjustmentSelector
              action={onWinTargetAction}
              value={onWinTargetValue}
              disabled={isAutoRunning}
              onActionChange={setOnWinTargetAction}
              onValueChange={setOnWinTargetValue}
            />
          </CollapsibleSection>

          {/* On Loss (collapsible) */}
          <CollapsibleSection title="On Loss" open={showOnLoss} onToggle={() => setShowOnLoss(!showOnLoss)}>
            <BetAdjustmentSelector
              label="Bet"
              action={onLossBetAction}
              value={onLossBetValue}
              disabled={isAutoRunning}
              onActionChange={setOnLossBetAction}
              onValueChange={setOnLossBetValue}
            />
            <TargetAdjustmentSelector
              action={onLossTargetAction}
              value={onLossTargetValue}
              disabled={isAutoRunning}
              onActionChange={setOnLossTargetAction}
              onValueChange={setOnLossTargetValue}
            />
          </CollapsibleSection>

          {/* Stop conditions */}
          <div className="space-y-2">
            <StopCondition
              label="Stop on Profit"
              prefix="$"
              enabled={stopOnProfitEnabled}
              value={stopOnProfitAmount}
              disabled={isAutoRunning}
              onToggle={setStopOnProfitEnabled}
              onValueChange={setStopOnProfitAmount}
            />
            <StopCondition
              label="Stop on Loss"
              prefix="$"
              enabled={stopOnLossEnabled}
              value={stopOnLossAmount}
              disabled={isAutoRunning}
              onToggle={setStopOnLossEnabled}
              onValueChange={setStopOnLossAmount}
            />
            <StopCondition
              label="Stop on Result"
              prefix=""
              suffix="x"
              enabled={stopOnWinMultEnabled}
              value={stopOnWinMultValue}
              disabled={isAutoRunning}
              onToggle={setStopOnWinMultEnabled}
              onValueChange={setStopOnWinMultValue}
            />
          </div>

          {/* Strategy presets */}
          <CollapsibleSection
            title="Strategy Presets"
            open={showStrategies}
            onToggle={() => setShowStrategies(!showStrategies)}
          >
            <div className="grid grid-cols-2 gap-2">
              {STRATEGY_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  disabled={isAutoRunning}
                  onClick={() => applyStrategy(preset)}
                  className="text-left rounded-lg p-3 transition-colors"
                  style={{
                    backgroundColor: selectedStrategy === preset.id ? "rgba(0,229,160,0.1)" : "#111827",
                    border: selectedStrategy === preset.id ? "2px solid #00E5A0" : "1px solid #374151",
                    opacity: isAutoRunning ? 0.5 : 1,
                  }}
                >
                  <span className="font-body text-sm font-semibold block" style={{ color: "#F9FAFB" }}>
                    {preset.name}
                  </span>
                  <span className="font-body text-xs block mt-0.5" style={{ color: "#6B7280" }}>
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* Start/Stop Auto button */}
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
            className="w-full flex items-center justify-center gap-2 rounded-xl font-body font-bold transition-colors"
            style={{
              height: 48,
              backgroundColor: isAutoRunning ? "#EF4444" : "#00E5A0",
              color: isAutoRunning ? "#F9FAFB" : "#0B0F1A",
              fontSize: 16,
              cursor: !isAutoRunning && balance < betAmount ? "not-allowed" : "pointer",
              opacity: !isAutoRunning && balance < betAmount ? 0.5 : 1,
            }}
            whileTap={{ scale: 0.98 }}
          >
            {isAutoRunning ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
                Stop Auto
              </>
            ) : (
              <>
                <Zap size={18} />
                Start Auto
              </>
            )}
          </motion.button>

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

      {/* Balance display */}
      <div className="text-center mt-1">
        <span className="font-body text-xs" style={{ color: "#6B7280" }}>Balance: </span>
        <span className="font-mono-stats text-sm font-bold" style={{ color: "#F9FAFB" }}>
          {formatCurrency(balance)}
        </span>
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
        className="w-full flex items-center justify-between px-3 py-2"
      >
        <span className="font-body text-sm" style={{ color: "#9CA3AF" }}>{title}</span>
        <ChevronDown
          size={14}
          style={{
            color: "#6B7280",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 150ms",
          }}
        />
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
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
