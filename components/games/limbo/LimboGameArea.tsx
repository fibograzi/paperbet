"use client";

import type { LimboGameState, LimboAction } from "./limboTypes";
import LimboPreviousResults from "./LimboPreviousResults";
import LimboResultDisplay from "./LimboResultDisplay";
import LimboParameters from "./LimboParameters";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LimboGameAreaProps {
  state: LimboGameState;
  dispatch: React.Dispatch<LimboAction>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LimboGameArea({ state, dispatch }: LimboGameAreaProps) {
  const { phase, currentResult, currentIsWin, currentProfit, previousResults, targetMultiplier, winChance } = state;

  return (
    <div className="flex flex-col gap-4">
      {/* Previous results row */}
      <LimboPreviousResults results={previousResults} />

      {/* Result display */}
      <LimboResultDisplay
        phase={phase}
        result={currentResult}
        isWin={currentIsWin}
        profit={currentProfit}
        targetMultiplier={targetMultiplier}
      />

      {/* Parameter bar */}
      <LimboParameters
        targetMultiplier={targetMultiplier}
        winChance={winChance}
        disabled={phase !== "idle"}
        dispatch={dispatch}
      />
    </div>
  );
}
