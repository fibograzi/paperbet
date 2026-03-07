"use client";

import type { MinesPhase, GameOverReason } from "./minesTypes";
import {
  formatMinesMultiplier,
  getMultiplierColor,
  getMultiplier,
} from "./minesCalculator";
import { formatCurrency } from "@/lib/utils";

interface MinesMultiplierBarProps {
  phase: MinesPhase;
  gameOverReason: GameOverReason | null;
  gemsRevealed: number;
  mineCount: number;
  currentMultiplier: number;
  nextMultiplier: number;
  betAmount: number;
  profit: number;
}

export default function MinesMultiplierBar({
  phase,
  gameOverReason,
  gemsRevealed,
  mineCount,
  currentMultiplier,
  nextMultiplier,
  betAmount,
  profit,
}: MinesMultiplierBarProps) {
  const multiplierColor = getMultiplierColor(currentMultiplier);
  const firstGemMultiplier = getMultiplier(1, mineCount);
  const profitOnNextTile =
    nextMultiplier > 0 && currentMultiplier > 0
      ? (nextMultiplier - currentMultiplier) * betAmount
      : nextMultiplier > 0
        ? nextMultiplier * betAmount - betAmount
        : 0;

  // --- IDLE ---
  if (phase === "IDLE") {
    return (
      <div className="w-full bg-[#111827] border border-[#374151] rounded-t-xl px-4 py-3 border-b-0">
        <p className="text-[#6B7280] text-sm font-body">
          Place your bet and start
        </p>
        <p className="text-[#9CA3AF] text-xs font-mono-stats mt-1">
          First gem: {formatMinesMultiplier(firstGemMultiplier)}
        </p>
      </div>
    );
  }

  // --- GAME OVER ---
  if (phase === "GAME_OVER") {
    if (gameOverReason === "mine_hit") {
      return (
        <div className="w-full bg-[#111827] border border-[#374151] rounded-t-xl px-4 py-3 border-b-0">
          <p className="text-[#EF4444] text-lg md:text-xl font-heading font-bold">
            GAME OVER
          </p>
          <p className="text-[#EF4444] text-sm font-mono-stats mt-0.5">
            -{formatCurrency(Math.abs(profit))}
          </p>
        </div>
      );
    }
    if (gameOverReason === "full_clear") {
      const safeTiles = 25 - mineCount;
      // Compute odds: 1 / P(surviving all)
      let survivalProb = 1;
      for (let i = 0; i < safeTiles; i++) {
        survivalProb *= (safeTiles - i) / (25 - i);
      }
      const odds = Math.round(1 / survivalProb);
      return (
        <div className="w-full bg-[#111827] border border-[#374151] rounded-t-xl px-4 py-3 border-b-0">
          <p className="text-[#F59E0B] text-lg md:text-xl font-heading font-bold mines-gold-pulse">
            PERFECT CLEAR
          </p>
          <p className="text-[#00E5A0] text-sm font-mono-stats mt-0.5">
            +{formatCurrency(profit)} at{" "}
            {formatMinesMultiplier(currentMultiplier)}
          </p>
          <p className="text-[#F59E0B] text-xs font-mono-stats mt-0.5">
            Odds: 1 in {odds.toLocaleString()}
          </p>
        </div>
      );
    }
    // Cashout
    return (
      <div className="w-full bg-[#111827] border border-[#374151] rounded-t-xl px-4 py-3 border-b-0">
        <p className="text-[#00E5A0] text-lg md:text-xl font-heading font-bold">
          CASHED OUT
        </p>
        <p className="text-[#00E5A0] text-sm font-mono-stats mt-0.5">
          +{formatCurrency(profit)} at{" "}
          {formatMinesMultiplier(currentMultiplier)}
        </p>
      </div>
    );
  }

  // --- PLAYING, 0 gems ---
  if (gemsRevealed === 0) {
    return (
      <div className="w-full bg-[#111827] border border-[#374151] rounded-t-xl px-4 py-3 border-b-0">
        <p className="text-[#6B7280] text-sm font-body">
          Click a tile to reveal
        </p>
      </div>
    );
  }

  // --- PLAYING, 1+ gems ---
  return (
    <div className="w-full bg-[#111827] border border-[#374151] rounded-t-xl px-4 py-3 border-b-0">
      <div className="flex items-center justify-between">
        {/* Left: current multiplier */}
        <div>
          <p className="text-[#6B7280] text-xs font-body">Multiplier</p>
          <p
            className="font-mono-stats text-2xl md:text-[28px] font-bold transition-colors duration-150"
            style={{ color: multiplierColor }}
          >
            {formatMinesMultiplier(currentMultiplier)}
          </p>
        </div>

        {/* Right: profit on next tile */}
        {nextMultiplier > 0 && (
          <div className="text-right">
            <p className="text-[#6B7280] text-xs font-body">
              Profit on Next Tile
            </p>
            <p className="text-[#9CA3AF] text-sm font-mono-stats">
              +{formatCurrency(profitOnNextTile)}
            </p>
            <p className="text-[#6B7280] text-xs font-mono-stats">
              Next: {formatMinesMultiplier(nextMultiplier)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
