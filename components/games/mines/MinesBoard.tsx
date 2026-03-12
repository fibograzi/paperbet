"use client";

import MinesTile from "./MinesTile";
import type { TileState, MinesPhase } from "./minesTypes";

interface MinesBoardProps {
  tileStates: TileState[];
  phase: MinesPhase;
  mineCount: number;
  minePositions: number[];
  onTileClick: (index: number) => void;
  shaking?: boolean;
  speedMode: "normal" | "quick" | "instant";
}

export default function MinesBoard({
  tileStates,
  phase,
  mineCount,
  minePositions,
  onTileClick,
  shaking = false,
  speedMode,
}: MinesBoardProps) {
  // Subtle red tint for 24 mines "pick one and pray" mode
  const extremeRiskTint = phase === "PLAYING" && mineCount >= 24;

  return (
    <div
      className={`
        relative bg-[#111827] border border-[#374151] rounded-xl
        p-3 md:p-4 w-full max-w-[500px] mx-auto
        ${shaking ? "mines-board-shake" : ""}
      `}
      style={{
        aspectRatio: "1 / 1",
        touchAction: "manipulation",
        ...(extremeRiskTint
          ? { boxShadow: "inset 0 0 40px rgba(239, 68, 68, 0.08)" }
          : {}),
      }}
    >
      <div className="grid grid-cols-5 gap-1.5 md:gap-2 h-full">
        {tileStates.map((state, index) => (
          <MinesTile
            key={index}
            index={index}
            tileState={state}
            phase={phase}
            isMine={minePositions.includes(index)}
            onClick={onTileClick}
            speedMode={speedMode}
          />
        ))}
      </div>
    </div>
  );
}
