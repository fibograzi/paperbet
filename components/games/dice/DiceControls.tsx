"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Dices, ChevronDown } from "lucide-react";
import type {
  DiceGameState,
  DiceAction,
  DiceAutoPlayConfig,
  DiceBetAdjustment,
  DiceTargetAdjustment,
  DiceAutoBetSpeed,
  DiceStrategy,
  DiceAnimationSpeed,
} from "./diceTypes";
import { MIN_BET, MAX_BET, clampBet } from "./diceEngine";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DiceControlsProps {
  state: DiceGameState;
  dispatch: React.Dispatch<DiceAction>;
  onRoll: () => void;
  onStartAutoPlay: (config: DiceAutoPlayConfig) => void;
  onStopAutoPlay: () => void;
}

// ---------------------------------------------------------------------------
// Strategy presets
// ---------------------------------------------------------------------------

interface StrategyPreset {
  id: DiceStrategy;
  name: string;
  description: string;
  target: number;
  direction: "over" | "under";
  onWinBet: DiceBetAdjustment;
  onWinBetValue: number;
  onLossBet: DiceBetAdjustment;
  onLossBetValue: number;
  switchOnWin: boolean;
  switchOnLoss: boolean;
}

const STRATEGY_PRESETS: StrategyPreset[] = [
  { id: "safe_grinder", name: "Safe Grinder", description: "Tiny frequent wins", target: 10.00, direction: "over", onWinBet: "same", onWinBetValue: 0, onLossBet: "same", onLossBetValue: 0, switchOnWin: false, switchOnLoss: false },
  { id: "coin_flip", name: "Coin Flip", description: "Classic 50/50", target: 50.00, direction: "over", onWinBet: "same", onWinBetValue: 0, onLossBet: "same", onLossBetValue: 0, switchOnWin: false, switchOnLoss: false },
  { id: "sniper", name: "Sniper", description: "Long droughts, big hits", target: 90.00, direction: "over", onWinBet: "same", onWinBetValue: 0, onLossBet: "same", onLossBetValue: 0, switchOnWin: false, switchOnLoss: false },
  { id: "moon_shot", name: "Moon Shot", description: "Lottery-style", target: 1.00, direction: "under", onWinBet: "same", onWinBetValue: 0, onLossBet: "same", onLossBetValue: 0, switchOnWin: false, switchOnLoss: false },
  { id: "martingale", name: "Martingale", description: "Double on loss", target: 50.00, direction: "over", onWinBet: "reset", onWinBetValue: 0, onLossBet: "increase_percent", onLossBetValue: 100, switchOnWin: false, switchOnLoss: false },
  { id: "anti_martingale", name: "Anti-Martingale", description: "Double on win", target: 50.00, direction: "over", onWinBet: "increase_percent", onWinBetValue: 100, onLossBet: "reset", onLossBetValue: 0, switchOnWin: false, switchOnLoss: false },
  { id: "dalembert", name: "D'Alembert", description: "+$0.10 loss, -$0.10 win", target: 50.00, direction: "over", onWinBet: "decrease_flat", onWinBetValue: 0.10, onLossBet: "increase_flat", onLossBetValue: 0.10, switchOnWin: false, switchOnLoss: false },
  { id: "zigzag", name: "Zigzag", description: "Alternate direction", target: 50.00, direction: "over", onWinBet: "same", onWinBetValue: 0, onLossBet: "same", onLossBetValue: 0, switchOnWin: true, switchOnLoss: true },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DiceControls({
  state,
  dispatch,
  onRoll,
  onStartAutoPlay,
  onStopAutoPlay,
}: DiceControlsProps) {
  const { phase, betAmount, balance, animationSpeed, autoPlay } = state;
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");
  const isIdle = phase === "idle";
  const isRolling = phase === "rolling";
  const isAutoRunning = autoPlay.active;

  // -------------------------------------------------------------------------
  // Auto-play config state
  // -------------------------------------------------------------------------

  const [autoNumberOfRolls, setAutoNumberOfRolls] = useState(100);
  const [autoSpeed, setAutoSpeed] = useState<DiceAutoBetSpeed>("normal");
  const [onWinBetAction, setOnWinBetAction] = useState<DiceBetAdjustment>("same");
  const [onWinBetValue, setOnWinBetValue] = useState(100);
  const [onLossBetAction, setOnLossBetAction] = useState<DiceBetAdjustment>("same");
  const [onLossBetValue, setOnLossBetValue] = useState(100);
  const [onWinTargetAction, setOnWinTargetAction] = useState<DiceTargetAdjustment>("same");
  const [onWinTargetValue, setOnWinTargetValue] = useState(1);
  const [onLossTargetAction, setOnLossTargetAction] = useState<DiceTargetAdjustment>("same");
  const [onLossTargetValue, setOnLossTargetValue] = useState(1);
  const [switchOnWin, setSwitchOnWin] = useState(false);
  const [switchOnLoss, setSwitchOnLoss] = useState(false);
  const [stopOnProfitEnabled, setStopOnProfitEnabled] = useState(false);
  const [stopOnProfitAmount, setStopOnProfitAmount] = useState(10);
  const [stopOnLossEnabled, setStopOnLossEnabled] = useState(false);
  const [stopOnLossAmount, setStopOnLossAmount] = useState(10);
  const [selectedStrategy, setSelectedStrategy] = useState<DiceStrategy>("custom");
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
    setSwitchOnWin(preset.switchOnWin);
    setSwitchOnLoss(preset.switchOnLoss);
    setOnWinTargetAction("same");
    setOnLossTargetAction("same");

    // Apply target & direction
    dispatch({ type: "SYNC_PARAM", field: "target", value: preset.target });
    if (preset.direction !== state.params.direction) {
      dispatch({ type: "SET_DIRECTION", direction: preset.direction });
    }
  }, [dispatch, state.params.direction]);

  // -------------------------------------------------------------------------
  // Build auto-play config
  // -------------------------------------------------------------------------

  const buildAutoConfig = useCallback((): DiceAutoPlayConfig => ({
    numberOfRolls: autoNumberOfRolls,
    speed: autoSpeed,
    onWinBetAction,
    onWinBetValue,
    onLossBetAction,
    onLossBetValue,
    onWinTargetAction,
    onWinTargetValue,
    onLossTargetAction,
    onLossTargetValue,
    switchDirectionOnWin: switchOnWin,
    switchDirectionOnLoss: switchOnLoss,
    stopOnProfit: stopOnProfitEnabled ? stopOnProfitAmount : null,
    stopOnLoss: stopOnLossEnabled ? stopOnLossAmount : null,
    stopOnWinStreak: null,
    stopOnLossStreak: null,
    strategy: selectedStrategy,
  }), [
    autoNumberOfRolls, autoSpeed,
    onWinBetAction, onWinBetValue,
    onLossBetAction, onLossBetValue,
    onWinTargetAction, onWinTargetValue,
    onLossTargetAction, onLossTargetValue,
    switchOnWin, switchOnLoss,
    stopOnProfitEnabled, stopOnProfitAmount,
    stopOnLossEnabled, stopOnLossAmount,
    selectedStrategy,
  ]);

  // -------------------------------------------------------------------------
  // Bet amount helpers
  // -------------------------------------------------------------------------

  const setBet = useCallback((amount: number) => {
    dispatch({ type: "SET_BET_AMOUNT", amount });
  }, [dispatch]);

  const isMartingaleType = selectedStrategy === "martingale" || selectedStrategy === "anti_martingale";

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
            <span className="text-xs font-body px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(20,184,166,0.15)", color: "#14B8A6" }}>
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
            { label: "½", action: () => setBet(betAmount / 2) },
            { label: "2×", action: () => setBet(betAmount * 2) },
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

      {/* ===== MANUAL TAB ===== */}
      {activeTab === "manual" && (
        <>
          {/* Roll button */}
          <motion.button
            type="button"
            disabled={isRolling || balance < betAmount || isAutoRunning}
            onClick={onRoll}
            className="w-full flex items-center justify-center gap-2 rounded-xl font-body font-bold transition-colors"
            style={{
              height: 48,
              backgroundColor: isRolling || isAutoRunning ? "#374151" : "#14B8A6",
              color: isRolling || isAutoRunning ? "#9CA3AF" : "#0B0F1A",
              boxShadow: isRolling || isAutoRunning ? "none" : "0 0 20px rgba(20,184,166,0.2)",
              cursor: isRolling || balance < betAmount || isAutoRunning ? "not-allowed" : "pointer",
              fontSize: 16,
            }}
            whileHover={!isRolling && !isAutoRunning ? { backgroundColor: "#2DD4BF", boxShadow: "0 0 30px rgba(20,184,166,0.3)" } : {}}
            whileTap={!isRolling && !isAutoRunning ? { scale: 0.98 } : {}}
            aria-label="Roll the dice"
          >
            <Dices size={18} />
            {isRolling ? "Rolling..." : "Roll"}
          </motion.button>

          {/* Speed toggle */}
          <div>
            <span className="font-body text-xs block mb-1.5" style={{ color: "#6B7280" }}>Speed</span>
            <div className="flex rounded-lg p-1" style={{ backgroundColor: "#1F2937" }}>
              {(["normal", "fast"] as DiceAnimationSpeed[]).map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => dispatch({ type: "SET_ANIMATION_SPEED", speed })}
                  className="flex-1 py-1.5 rounded-md text-center font-body text-xs font-semibold transition-colors capitalize"
                  style={{
                    backgroundColor: animationSpeed === speed ? "rgba(20,184,166,0.15)" : "transparent",
                    color: animationSpeed === speed ? "#14B8A6" : "#9CA3AF",
                  }}
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
          {/* Number of Rolls */}
          <div>
            <span className="font-body text-sm block mb-1.5" style={{ color: "#9CA3AF" }}>Number of Rolls</span>
            <div className="grid grid-cols-6 gap-1">
              {[10, 25, 50, 100, 500, Infinity].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={isAutoRunning}
                  onClick={() => setAutoNumberOfRolls(n)}
                  className="py-1.5 rounded-md font-body text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor: autoNumberOfRolls === n ? "rgba(20,184,166,0.15)" : "transparent",
                    color: autoNumberOfRolls === n ? "#14B8A6" : "#9CA3AF",
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
              {(["normal", "fast", "turbo"] as DiceAutoBetSpeed[]).map((speed) => (
                <button
                  key={speed}
                  type="button"
                  disabled={isAutoRunning}
                  onClick={() => setAutoSpeed(speed)}
                  className="flex-1 py-1.5 rounded-md text-center font-body text-xs font-semibold transition-colors capitalize"
                  style={{
                    backgroundColor: autoSpeed === speed ? "rgba(20,184,166,0.15)" : "transparent",
                    color: autoSpeed === speed ? "#14B8A6" : "#9CA3AF",
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
            <ToggleOption
              label="Switch direction on win"
              checked={switchOnWin}
              disabled={isAutoRunning}
              onChange={setSwitchOnWin}
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
            <ToggleOption
              label="Switch direction on loss"
              checked={switchOnLoss}
              disabled={isAutoRunning}
              onChange={setSwitchOnLoss}
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
          </div>

          {/* Strategy presets (collapsible) */}
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
                    backgroundColor: selectedStrategy === preset.id ? "rgba(20,184,166,0.1)" : "#111827",
                    border: selectedStrategy === preset.id ? "2px solid #14B8A6" : "1px solid #374151",
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
              backgroundColor: isAutoRunning ? "#EF4444" : "#14B8A6",
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
                <Dices size={18} />
                Start Auto
              </>
            )}
          </motion.button>

          {/* Auto progress counter */}
          {isAutoRunning && autoPlay.progress && (
            <div className="text-center font-mono-stats text-sm" style={{ color: "#9CA3AF" }}>
              <p>
                Roll {autoPlay.progress.currentRoll}
                {isFinite(autoPlay.progress.totalRolls)
                  ? ` / ${autoPlay.progress.totalRolls}`
                  : ""}
                {" — "}
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
  action: DiceBetAdjustment;
  value: number;
  disabled: boolean;
  onActionChange: (a: DiceBetAdjustment) => void;
  onValueChange: (v: number) => void;
}) {
  const options: { value: DiceBetAdjustment; label: string }[] = [
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
        onChange={(e) => onActionChange(e.target.value as DiceBetAdjustment)}
        className="w-full rounded-md px-2 py-1.5 font-body text-xs outline-none"
        style={{
          backgroundColor: "#1F2937",
          border: "1px solid #374151",
          color: "#F9FAFB",
        }}
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
  action: DiceTargetAdjustment;
  value: number;
  disabled: boolean;
  onActionChange: (a: DiceTargetAdjustment) => void;
  onValueChange: (v: number) => void;
}) {
  const options: { value: DiceTargetAdjustment; label: string }[] = [
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
        onChange={(e) => onActionChange(e.target.value as DiceTargetAdjustment)}
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

function ToggleOption({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded"
        style={{ accentColor: "#14B8A6" }}
      />
      <span className="font-body text-xs" style={{ color: "#9CA3AF" }}>{label}</span>
    </label>
  );
}

function StopCondition({
  label,
  prefix,
  enabled,
  value,
  disabled,
  onToggle,
  onValueChange,
}: {
  label: string;
  prefix: string;
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
        style={{ accentColor: "#14B8A6" }}
      />
      <span className="font-body text-xs shrink-0" style={{ color: "#9CA3AF" }}>
        {label} &ge;
      </span>
      <div
        className="flex-1 rounded-md px-2 py-1 flex items-center"
        style={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
      >
        <span className="font-mono-stats text-xs" style={{ color: "#6B7280" }}>{prefix}</span>
        <input
          type="number"
          value={value}
          disabled={disabled || !enabled}
          onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
          className="flex-1 bg-transparent font-mono-stats text-xs text-right outline-none"
          style={{ color: "#F9FAFB" }}
          min={0}
          step={1}
        />
      </div>
    </div>
  );
}
