"use client";

import type { LimboGameState } from "./limboTypes";
import LimboPreviousResults from "./LimboPreviousResults";
import LimboResultDisplay from "./LimboResultDisplay";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LimboGameAreaProps {
  state: LimboGameState;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LimboGameArea({ state }: LimboGameAreaProps) {
  const { phase, currentResult, currentIsWin, currentProfit, previousResults, targetMultiplier } = state;

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
    </div>
  );
}
