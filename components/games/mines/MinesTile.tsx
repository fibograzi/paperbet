"use client";

import { memo } from "react";
import { Gem, Bomb } from "lucide-react";
import type { TileState, MinesPhase } from "./minesTypes";

interface MinesTileProps {
  index: number;
  tileState: TileState;
  phase: MinesPhase;
  isMine: boolean;
  onClick: (index: number) => void;
}

function MinesTileInner({
  index,
  tileState,
  phase,
  isMine,
  onClick,
}: MinesTileProps) {
  const row = Math.floor(index / 5);
  const col = index % 5;

  const isClickable = phase === "PLAYING" && tileState === "hidden";

  const handleClick = () => {
    if (!isClickable) return;
    onClick(index);
  };

  // Determine visual state
  const isIdle = phase === "IDLE" && tileState === "hidden";
  const isUnrevealed = phase === "PLAYING" && tileState === "hidden";
  const isRevealing = tileState === "revealing";
  const isGem = tileState === "gem";
  const isMineHit = tileState === "mine_hit";
  const isMineRevealed = tileState === "mine_revealed";
  const isGemFaded = tileState === "gem_faded";
  const isGameOverHidden = phase === "GAME_OVER" && tileState === "hidden";

  // Base classes
  let bgClass = "";
  let borderColor = "";
  let cursorClass = "";
  let opacityClass = "";

  if (isIdle || isGameOverHidden) {
    bgClass = "bg-[#1F2937]";
    borderColor = "border-[#374151]";
    cursorClass = "cursor-default";
    opacityClass = "opacity-70";
  } else if (isUnrevealed) {
    bgClass = "bg-[#1F2937]";
    borderColor = "border-[#374151]";
    cursorClass = "cursor-pointer";
    opacityClass = "";
  } else if (isRevealing) {
    bgClass = "bg-[#1F2937]";
    borderColor = "border-[#374151]";
    cursorClass = "cursor-default";
    opacityClass = "";
  } else if (isGem) {
    bgClass = "bg-[rgba(0,229,160,0.15)]";
    borderColor = "border-[rgba(0,229,160,0.4)]";
    cursorClass = "cursor-default";
    opacityClass = "";
  } else if (isMineHit) {
    bgClass = "bg-[rgba(239,68,68,0.30)]";
    borderColor = "border-[rgba(239,68,68,0.6)]";
    cursorClass = "cursor-default";
    opacityClass = "";
  } else if (isMineRevealed) {
    bgClass = "bg-[rgba(239,68,68,0.10)]";
    borderColor = "border-[rgba(239,68,68,0.3)]";
    cursorClass = "cursor-default";
    opacityClass = "";
  } else if (isGemFaded) {
    bgClass = "bg-[rgba(0,229,160,0.05)]";
    borderColor = "border-[rgba(0,229,160,0.15)]";
    cursorClass = "cursor-default";
    opacityClass = "";
  }

  // Aria label
  let ariaLabel = `Tile row ${row + 1}, column ${col + 1}`;
  if (isIdle) ariaLabel += " — inactive";
  else if (isUnrevealed) ariaLabel += " — unrevealed";
  else if (isRevealing) ariaLabel += " — revealing";
  else if (isGem) ariaLabel += " — revealed gem";
  else if (isMineHit) ariaLabel += " — mine hit";
  else if (isMineRevealed) ariaLabel += " — revealed mine";
  else if (isGemFaded) ariaLabel += " — gem (faded)";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isClickable}
      aria-label={ariaLabel}
      className={`
        relative aspect-square rounded-xl border
        ${bgClass} ${borderColor} ${cursorClass} ${opacityClass}
        transition-all duration-150 select-none
        focus-visible:outline-2 focus-visible:outline-[#00E5A0] focus-visible:outline-offset-2
        ${isUnrevealed ? "hover:bg-[#374151] hover:-translate-y-0.5 hover:shadow-lg active:scale-95 active:bg-[#4B5563]" : ""}
        ${isRevealing ? "mines-tile-flip" : ""}
        ${isGem ? "mines-gem-glow" : ""}
        ${isMineHit ? "mines-mine-explode" : ""}
        ${isMineRevealed || isGemFaded ? "mines-post-reveal" : ""}
      `}
      style={{
        transformStyle: "preserve-3d",
        perspective: "600px",
      }}
    >
      {/* Content */}
      <span className="absolute inset-0 flex items-center justify-center">
        {isGem && (
          <Gem
            className="text-[#00E5A0] w-5 h-5 md:w-7 md:h-7"
            strokeWidth={2}
          />
        )}
        {isRevealing && (
          <span className="mines-flip-content">
            {isMine ? (
              <Bomb
                className="text-[#EF4444] w-5 h-5 md:w-7 md:h-7"
                strokeWidth={2}
              />
            ) : (
              <Gem
                className="text-[#00E5A0] w-5 h-5 md:w-7 md:h-7"
                strokeWidth={2}
              />
            )}
          </span>
        )}
        {isMineHit && (
          <Bomb
            className="text-[#EF4444] w-5 h-5 md:w-7 md:h-7"
            strokeWidth={2}
          />
        )}
        {isMineRevealed && (
          <Bomb
            className="text-[#EF4444] w-5 h-5 md:w-7 md:h-7 opacity-60"
            strokeWidth={2}
          />
        )}
        {isGemFaded && (
          <Gem
            className="text-[#00E5A0] w-5 h-5 md:w-7 md:h-7 opacity-30"
            strokeWidth={2}
          />
        )}
      </span>
    </button>
  );
}

const MinesTile = memo(MinesTileInner);
export default MinesTile;
