"use client";

import type { RouletteGameState, RouletteAction, WheelType } from "@/lib/roulette/rouletteTypes";
import BalanceBar from "@/components/shared/BalanceBar";
import RouletteChipSelector from "./RouletteChipSelector";
import RouletteBetSlip from "./RouletteBetSlip";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RouletteControlsProps {
  state: RouletteGameState;
  dispatch: (action: RouletteAction) => void;
  onSpin: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RouletteControls({
  state,
  dispatch,
  onSpin,
}: RouletteControlsProps) {
  const isSpinning = state.phase === "spinning";
  const isResult = state.phase === "result";
  const disabled = isSpinning || isResult;

  const totalBetAmount = state.currentBets.reduce((s, b) => s + b.amount, 0);
  const canSpin =
    !disabled &&
    state.currentBets.length > 0 &&
    state.balance >= 0;

  const insufficientBalance = state.balance < 0.10 && state.currentBets.length === 0;

  return (
    <div className="space-y-4">
      {/* Balance */}
      <BalanceBar
        balance={state.balance}
        onReset={() => dispatch({ type: "RESET_BALANCE" })}
      />

      {/* Wheel type toggle */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-body uppercase tracking-wider text-pb-text-muted">
          Wheel Type
        </p>
        <div
          className="grid grid-cols-2 gap-1 rounded-lg p-1"
          style={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
          role="radiogroup"
          aria-label="Select wheel type"
        >
          {(["european", "american"] as WheelType[]).map((type) => {
            const isSelected = state.wheelType === type;
            return (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={disabled}
                onClick={() => dispatch({ type: "SET_WHEEL_TYPE", wheelType: type })}
                className="rounded-md py-1.5 text-xs font-body font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed capitalize"
                style={{
                  backgroundColor: isSelected ? "#00E5A0" : "transparent",
                  color: isSelected ? "#0B0F1A" : "#9CA3AF",
                }}
              >
                {type === "european" ? "European" : "American"}
                <span
                  className="block text-[9px] font-normal"
                  style={{ color: isSelected ? "#0B0F1A" : "#6B7280" }}
                >
                  {type === "european" ? "2.7% edge" : "5.3% edge"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chip selector */}
      <RouletteChipSelector
        selectedValue={state.selectedChipValue}
        onSelect={(value) => dispatch({ type: "SET_CHIP_VALUE", value })}
      />

      {/* Bet slip */}
      <RouletteBetSlip
        bets={state.currentBets}
        onUndo={() => dispatch({ type: "UNDO_LAST_BET" })}
        onClear={() => dispatch({ type: "CLEAR_BETS" })}
        onRepeat={() => dispatch({ type: "REPEAT_BETS" })}
        onDouble={() => dispatch({ type: "DOUBLE_BETS" })}
        onRemoveBet={(betId) => dispatch({ type: "REMOVE_BET", betId })}
        totalBetAmount={totalBetAmount}
        disabled={disabled}
        hasPreviousBets={state.previousBets.length > 0}
      />

      {/* Spin button */}
      <button
        type="button"
        onClick={onSpin}
        disabled={!canSpin}
        className="w-full rounded-xl py-4 font-heading font-bold text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: canSpin ? "#00E5A0" : "#1F2937",
          color: canSpin ? "#0B0F1A" : "#6B7280",
          border: canSpin ? "none" : "1px solid #374151",
          boxShadow: canSpin ? "0 0 20px rgba(0,229,160,0.3)" : "none",
          transform: canSpin ? "none" : "none",
        }}
        onMouseEnter={(e) => {
          if (canSpin) {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 30px rgba(0,229,160,0.5)";
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.01)";
          }
        }}
        onMouseLeave={(e) => {
          if (canSpin) {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 20px rgba(0,229,160,0.3)";
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }
        }}
        aria-label={
          isSpinning
            ? "Wheel is spinning"
            : state.currentBets.length === 0
              ? "Place bets to spin"
              : `Spin — ${totalBetAmount.toFixed(2)} wagered`
        }
      >
        {isSpinning ? (
          <span className="flex items-center justify-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
            />
            Spinning...
          </span>
        ) : isResult ? (
          "Settling..."
        ) : state.currentBets.length === 0 ? (
          "Place Bets to Spin"
        ) : (
          `Spin — $${totalBetAmount.toFixed(2)}`
        )}
      </button>

      {insufficientBalance && (
        <p className="text-xs text-center font-body" style={{ color: "#EF4444" }}>
          Insufficient balance.{" "}
          <button
            type="button"
            className="underline"
            onClick={() => dispatch({ type: "RESET_BALANCE" })}
          >
            Reset to $1,000
          </button>
        </p>
      )}
    </div>
  );
}
