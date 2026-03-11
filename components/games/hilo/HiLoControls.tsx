"use client";

import { useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Infinity as InfinityIcon } from "lucide-react";
import { useBetInput } from "@/lib/useBetInput";
import type {
  HiLoGameState,
  HiLoAction,
  Prediction,
  HiLoAutoPlayConfig,
} from "./hiloTypes";
import { getPredictionInfo } from "./hiloEngine";
import { formatCurrency, cn } from "@/lib/utils";
import HiLoActionButtons from "./HiLoActionButtons";
import BalanceBar from "@/components/shared/BalanceBar";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HiLoControlsProps {
  state: HiLoGameState;
  dispatch: React.Dispatch<HiLoAction>;
  onPlaceBet: () => void;
  onPredict: (prediction: Prediction) => void;
  onSkip: () => void;
  onCashOut: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_AUTO_ROUNDS = 500;
const INCREASE_PRESETS = [25, 50, 100, 200];

type WinLossAction = "reset" | "increase";
type AutoStrategy = "always_higher" | "always_lower" | "smart";
type Tab = "manual" | "auto";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HiLoControls({
  state,
  dispatch,
  onPlaceBet,
  onPredict,
  onSkip,
  onCashOut,
}: HiLoControlsProps) {
  const { phase, config, balance, round, autoPlay } = state;

  const [activeTab, setActiveTab] = useState<Tab>("manual");

  // Auto-play local state
  const [autoStrategy, setAutoStrategy] = useState<AutoStrategy>("smart");
  const [autoCashOutAt, setAutoCashOutAt] = useState(2.0);
  const [autoCount, setAutoCount] = useState<number>(10);
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
  const isPredicting = phase === "predicting";
  const isRoundActive =
    phase === "predicting" ||
    phase === "revealing" ||
    phase === "skipping" ||
    phase === "dealing" ||
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
    [dispatch],
  );

  const betInput = useBetInput(config.betAmount, setBet);

  // --- Auto-play start ---
  const handleAutoPlayStart = useCallback(() => {
    const autoConfig: HiLoAutoPlayConfig = {
      strategy: autoStrategy,
      cashOutAt: autoCashOutAt,
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
    autoStrategy,
    autoCashOutAt,
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

  // --- Prediction info for current card ---
  const predictionInfo = round ? getPredictionInfo(round.currentCard) : null;

  // --- Auto-play session P/L ---
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
            className="flex-1 py-1.5 rounded-md text-xs font-body transition-all duration-150"
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
              style={{ color: "#F9FAFB", opacity: controlsDisabled ? 0.5 : 1 }}
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

      {/* Instant Bet Toggle */}
      <div className="flex items-center justify-between px-1">
        <span
          className="font-body text-xs"
          style={{ color: "#6B7280" }}
        >
          Instant Bet
        </span>
        <button
          type="button"
          onClick={() =>
            dispatch({ type: "SET_INSTANT_BET", enabled: !config.instantBet })
          }
          className="relative rounded-full transition-colors duration-200"
          style={{
            width: 36,
            height: 20,
            backgroundColor: config.instantBet ? "#6366F1" : "#374151",
          }}
          aria-label="Toggle instant bet"
        >
          <span
            className="absolute left-0 top-0.5 rounded-full bg-white transition-transform duration-200"
            style={{
              width: 16,
              height: 16,
              transform: config.instantBet
                ? "translateX(18px)"
                : "translateX(2px)",
            }}
          />
        </button>
      </div>

      {/* === MANUAL TAB CONTENT === */}
      {activeTab === "manual" && (
        <>
          {/* Bet / Action button when idle */}
          <div className="hidden lg:block">
            {isIdle && !autoPlay.active && (
              <button
                type="button"
                onClick={onPlaceBet}
                disabled={balance < config.betAmount}
                className="w-full h-9 rounded-lg font-body font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#6366F1",
                  color: "#F9FAFB",
                }}
              >
                Bet
              </button>
            )}

            {/* Round Active disabled button */}
            {isRoundActive &&
              phase !== "predicting" &&
              phase !== "lost" && (
                <button
                  type="button"
                  disabled
                  className="w-full h-9 rounded-lg font-body font-bold text-sm cursor-not-allowed"
                  style={{
                    backgroundColor: "#374151",
                    color: "#9CA3AF",
                  }}
                >
                  Round Active
                </button>
              )}
          </div>

          {/* Action buttons during predicting phase */}
          {isPredicting && round && predictionInfo && (
            <HiLoActionButtons
                predictionInfo={predictionInfo}
                cumulativeMultiplier={round.cumulativeMultiplier}
                correctPredictions={round.correctPredictions}
                betAmount={config.betAmount}
                skipsUsed={round.skipsUsed}
                currentRank={round.currentCard.rank}
                disabled={autoPlay.active}
                onHigher={() => onPredict("higher")}
                onLower={() => onPredict("lower")}
                onSkip={onSkip}
                onCashOut={onCashOut}
              />
          )}

          {/* Loss phase — show "New Round" hint */}
          {phase === "lost" && (
            <div
              className="text-center text-sm font-body py-2"
              style={{ color: "#EF4444" }}
            >
              Wrong prediction! Returning to lobby...
            </div>
          )}

        </>
      )}

      {/* === AUTO TAB CONTENT === */}
      {activeTab === "auto" && (
        <div className="space-y-2">
          {/* Strategy Selector */}
          <div>
            <label
              className="font-body text-xs block mb-1.5"
              style={{ color: "#6B7280" }}
            >
              Strategy
            </label>
            <div className="flex gap-1.5">
              {(
                [
                  { value: "always_higher", label: "Always Higher" },
                  { value: "always_lower", label: "Always Lower" },
                  { value: "smart", label: "Smart" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={autoPlay.active}
                  onClick={() => setAutoStrategy(opt.value)}
                  className="flex-1 py-1.5 rounded-md text-xs font-body transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor:
                      autoStrategy === opt.value
                        ? "rgba(99, 102, 241, 0.15)"
                        : "#1F2937",
                    color:
                      autoStrategy === opt.value ? "#6366F1" : "#9CA3AF",
                    border:
                      autoStrategy === opt.value
                        ? "1px solid rgba(99, 102, 241, 0.3)"
                        : "1px solid #374151",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Out At */}
          <div>
            <label
              className="font-body text-xs block mb-1.5"
              style={{ color: "#6B7280" }}
            >
              Cash Out At
            </label>
            <div className="relative">
              <input suppressHydrationWarning
                type="text"
                inputMode="decimal"
                value={autoCashOutAt.toFixed(2)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    setAutoCashOutAt(
                      Math.max(1.01, Math.min(10000, Math.round(val * 100) / 100))
                    );
                  }
                }}
                disabled={autoPlay.active}
                className="w-full rounded-md py-1.5 px-2.5 pr-8 text-right font-mono-stats text-xs text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 disabled:opacity-50"
                style={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                }}
                aria-label="Auto cashout multiplier"
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: "#6B7280" }}
              >
                x
              </span>
            </div>
          </div>

          {/* Number of Rounds */}
          <div>
            <label
              className="font-body text-xs block mb-1.5"
              style={{ color: "#6B7280" }}
            >
              Number of Rounds
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  suppressHydrationWarning
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
                  className="w-full rounded-md py-1.5 px-2.5 text-right font-mono-stats text-xs text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 disabled:opacity-50"
                  style={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                  }}
                  aria-label="Number of auto-play rounds"
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
                      ? "rgba(99, 102, 241, 0.15)"
                      : "#1F2937",
                  border:
                    autoCount === MAX_AUTO_ROUNDS
                      ? "1px solid rgba(99, 102, 241, 0.3)"
                      : "1px solid #374151",
                  color:
                    autoCount === MAX_AUTO_ROUNDS ? "#6366F1" : "#9CA3AF",
                }}
                aria-label="Set to maximum rounds"
              >
                <InfinityIcon size={16} />
              </button>
            </div>
          </div>

          {/* Advanced (collapsible) */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 w-full text-left py-1"
          >
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform",
                showAdvanced && "rotate-180"
              )}
              style={{ color: "#6B7280" }}
            />
            <span
              className="font-body text-xs"
              style={{ color: "#6B7280" }}
            >
              Advanced
            </span>
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-2 overflow-hidden"
              >
                {/* On Win */}
                <div>
                  <label
                    className="font-body text-xs block mb-1.5"
                    style={{ color: "#6B7280" }}
                  >
                    On Win
                  </label>
                  <div className="flex gap-1.5 mb-1.5">
                    {(
                      [
                        { value: "reset", label: "Reset" },
                        { value: "increase", label: "Increase" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={autoPlay.active}
                        onClick={() => setAutoOnWin(opt.value)}
                        className="flex-1 py-1.5 rounded-md text-xs font-body transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor:
                            autoOnWin === opt.value
                              ? "rgba(0, 229, 160, 0.15)"
                              : "#1F2937",
                          color:
                            autoOnWin === opt.value ? "#00E5A0" : "#9CA3AF",
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
                  {autoOnWin === "increase" && (
                    <div className="mt-1.5">
                      <div className="flex gap-1 mb-1">
                        {INCREASE_PRESETS.map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            disabled={autoPlay.active}
                            onClick={() => setIncreaseOnWinPercent(pct)}
                            className="flex-1 py-1 text-[10px] font-mono-stats rounded transition-colors disabled:opacity-50"
                            style={{
                              backgroundColor:
                                increaseOnWinPercent === pct
                                  ? "rgba(0, 229, 160, 0.15)"
                                  : "#1F2937",
                              color:
                                increaseOnWinPercent === pct
                                  ? "#00E5A0"
                                  : "#9CA3AF",
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
                          value={increaseOnWinPercent}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 1)
                              setIncreaseOnWinPercent(Math.min(10000, val));
                          }}
                          disabled={autoPlay.active}
                          className="w-full rounded-lg py-1.5 pl-3 pr-8 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50"
                          style={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                          }}
                          aria-label="Increase on win percentage"
                        />
                        <span
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                          style={{ color: "#6B7280" }}
                        >
                          %
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* On Loss */}
                <div>
                  <label
                    className="font-body text-xs block mb-1.5"
                    style={{ color: "#6B7280" }}
                  >
                    On Loss
                  </label>
                  <div className="flex gap-1.5 mb-1.5">
                    {(
                      [
                        { value: "reset", label: "Reset" },
                        { value: "increase", label: "Increase" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={autoPlay.active}
                        onClick={() => setAutoOnLoss(opt.value)}
                        className="flex-1 py-1.5 rounded-md text-xs font-body transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor:
                            autoOnLoss === opt.value
                              ? "rgba(239, 68, 68, 0.15)"
                              : "#1F2937",
                          color:
                            autoOnLoss === opt.value ? "#EF4444" : "#9CA3AF",
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
                  {autoOnLoss === "increase" && (
                    <div className="mt-1.5">
                      <div className="flex gap-1 mb-1">
                        {INCREASE_PRESETS.map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            disabled={autoPlay.active}
                            onClick={() => setIncreaseOnLossPercent(pct)}
                            className="flex-1 py-1 text-[10px] font-mono-stats rounded transition-colors disabled:opacity-50"
                            style={{
                              backgroundColor:
                                increaseOnLossPercent === pct
                                  ? "rgba(239, 68, 68, 0.15)"
                                  : "#1F2937",
                              color:
                                increaseOnLossPercent === pct
                                  ? "#EF4444"
                                  : "#9CA3AF",
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
                          value={increaseOnLossPercent}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 1)
                              setIncreaseOnLossPercent(Math.min(10000, val));
                          }}
                          disabled={autoPlay.active}
                          className="w-full rounded-lg py-1.5 pl-3 pr-8 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50"
                          style={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                          }}
                          aria-label="Increase on loss percentage"
                        />
                        <span
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                          style={{ color: "#6B7280" }}
                        >
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
                      onChange={(e) =>
                        setStopOnProfitEnabled(e.target.checked)
                      }
                      disabled={autoPlay.active}
                      className="w-3.5 h-3.5 rounded accent-pb-accent"
                    />
                    <span
                      className="font-body text-xs"
                      style={{ color: "#6B7280" }}
                    >
                      Stop on Profit
                    </span>
                  </label>
                  {stopOnProfitEnabled && (
                    <div className="relative">
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                        style={{ color: "#6B7280" }}
                      >
                        $
                      </span>
                      <input suppressHydrationWarning
                        type="number"
                        min={1}
                        max={100000}
                        value={stopOnProfitAmount}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val > 0)
                            setStopOnProfitAmount(
                              Math.round(val * 100) / 100
                            );
                        }}
                        disabled={autoPlay.active}
                        className="w-full rounded-lg py-1.5 pl-7 pr-3 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50"
                        style={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                        }}
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
                      onChange={(e) =>
                        setStopOnLossEnabled(e.target.checked)
                      }
                      disabled={autoPlay.active}
                      className="w-3.5 h-3.5 rounded accent-pb-accent"
                    />
                    <span
                      className="font-body text-xs"
                      style={{ color: "#6B7280" }}
                    >
                      Stop on Loss
                    </span>
                  </label>
                  {stopOnLossEnabled && (
                    <div className="relative">
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                        style={{ color: "#6B7280" }}
                      >
                        $
                      </span>
                      <input suppressHydrationWarning
                        type="number"
                        min={1}
                        max={100000}
                        value={stopOnLossAmount}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val > 0)
                            setStopOnLossAmount(
                              Math.round(val * 100) / 100
                            );
                        }}
                        disabled={autoPlay.active}
                        className="w-full rounded-lg py-1.5 pl-7 pr-3 text-right font-mono-stats text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 disabled:opacity-50"
                        style={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                        }}
                        aria-label="Stop on loss amount"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                Stop Autobet
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAutoPlayStart}
                disabled={!isIdle}
                className="w-full h-9 rounded-lg font-body font-bold text-sm transition-colors hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#6366F1",
                  color: "#F9FAFB",
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
                  style={{ backgroundColor: "#6366F1" }}
                />
                Round {autoPlay.progress.currentRound + 1}
                {autoPlay.progress.totalRounds
                  ? ` / ${autoPlay.progress.totalRounds}`
                  : ""}{" "}
                — W: {autoPlay.progress.wins} | L: {autoPlay.progress.losses}
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
            Stop Autobet
          </button>
        ) : activeTab === "manual" ? (
          <button
            type="button"
            onClick={onPlaceBet}
            disabled={balance < config.betAmount || isRoundActive}
            className="w-full h-11 rounded-lg font-heading font-bold text-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed"
            style={{
              backgroundColor: isRoundActive ? "#374151" : "#6366F1",
              color: isRoundActive ? "#9CA3AF" : "#F9FAFB",
              boxShadow: !isRoundActive && balance >= config.betAmount ? "0 0 16px rgba(99, 102, 241, 0.2)" : "none",
            }}
          >
            {isRoundActive ? "Round Active" : "Bet"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAutoPlayStart}
            disabled={!isIdle}
            className="w-full h-11 rounded-lg font-heading font-bold text-sm border transition-colors disabled:opacity-40"
            style={{
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              color: "#6366F1",
              borderColor: "rgba(99, 102, 241, 0.3)",
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
      <div
        className="hidden lg:block text-center text-xs"
        style={{ color: "#6B7280" }}
      >
        Press{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-pb-bg-tertiary border border-pb-border font-mono-stats text-[10px]">
          Space
        </kbd>{" "}
        to bet |{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-pb-bg-tertiary border border-pb-border font-mono-stats text-[10px]">
          Q
        </kbd>{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-pb-bg-tertiary border border-pb-border font-mono-stats text-[10px]">
          W
        </kbd>{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-pb-bg-tertiary border border-pb-border font-mono-stats text-[10px]">
          E
        </kbd>{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-pb-bg-tertiary border border-pb-border font-mono-stats text-[10px]">
          C
        </kbd>
      </div>
    </div>
  );
}
