"use client";

import type { DiceGameState, DiceAction } from "./diceTypes";
import { isOnTheLine as checkOnTheLine } from "./diceEngine";
import DicePreviousResults from "./DicePreviousResults";
import DiceResultDisplay from "./DiceResultDisplay";
import DiceSlider from "./DiceSlider";
import DiceParametersPanel from "./DiceParameters";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DiceGameAreaProps {
  state: DiceGameState;
  dispatch: React.Dispatch<DiceAction>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DiceGameArea({ state, dispatch }: DiceGameAreaProps) {
  const { phase, params, currentResult, currentIsWin, currentProfit, previousResults, betAmount } = state;
  const isRolling = phase === "rolling";
  const disabled = phase !== "idle";

  const onTheLine = currentResult !== null && checkOnTheLine(currentResult, params.target);

  return (
    <div className="flex flex-col gap-4">
      {/* Previous results row */}
      <DicePreviousResults results={previousResults} />

      {/* Result display */}
      <DiceResultDisplay
        phase={phase}
        result={currentResult}
        isWin={currentIsWin}
        profit={currentProfit}
        multiplier={params.multiplier}
        isOnTheLine={onTheLine}
      />

      {/* Slider bar */}
      <DiceSlider
        target={params.target}
        direction={params.direction}
        winChance={params.winChance}
        result={currentResult}
        isWin={currentIsWin}
        isRolling={isRolling}
        onTargetChange={(t) => dispatch({ type: "SYNC_PARAM", field: "target", value: t })}
      />

      {/* Parameters row + direction toggle */}
      <DiceParametersPanel
        params={params}
        betAmount={betAmount}
        disabled={disabled}
        onSyncParam={(field, value) => dispatch({ type: "SYNC_PARAM", field, value })}
        onSetDirection={(d) => dispatch({ type: "SET_DIRECTION", direction: d })}
        onSwapDirection={() => dispatch({ type: "SWAP_DIRECTION" })}
      />
    </div>
  );
}
