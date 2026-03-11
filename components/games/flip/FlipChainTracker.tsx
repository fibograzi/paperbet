"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import type { FlipPhase, FlipStreak } from "./flipTypes";
import { MAX_FLIPS, CHAIN_MILESTONES, formatFlipMultiplier, getMultiplier } from "./flipEngine";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FlipChainTrackerProps {
  phase: FlipPhase;
  streak: FlipStreak | null;
  targetFlips?: number; // for auto-play display
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FlipChainTracker({
  phase,
  streak,
  targetFlips,
}: FlipChainTrackerProps) {
  const totalFlips = targetFlips ?? MAX_FLIPS;
  const currentFlips = streak?.flips ?? 0;
  const isFlipping = phase === "flipping";
  const isLost = phase === "lost";

  // Determine which circles to show (max 20, or target for auto-play)
  const displayCount = Math.min(totalFlips, MAX_FLIPS);

  // On mobile (< 10 circles), show compact version
  const showCompact = displayCount > 10;

  const milestonePositions = useMemo(
    () =>
      CHAIN_MILESTONES.filter((m) => m.flip <= displayCount).map((m) => ({
        ...m,
        index: m.flip - 1,
      })),
    [displayCount]
  );

  // ---------------------------------------------------------------------------
  // Compact view (mobile or when too many circles)
  // ---------------------------------------------------------------------------

  if (showCompact) {
    const progress = currentFlips / displayCount;
    const currentMultiplier = currentFlips > 0 ? getMultiplier(currentFlips) : 0;
    const nextMultiplier = currentFlips < MAX_FLIPS ? getMultiplier(currentFlips + 1) : null;

    return (
      <div className="w-full max-w-[400px] mx-auto px-2">
        {/* Flip counter */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-body text-xs" style={{ color: "#9CA3AF" }}>
            Flip {currentFlips} / {displayCount}
          </span>
          {currentMultiplier > 0 && (
            <span
              className="font-mono-stats text-sm font-bold"
              style={{ color: "#00E5A0" }}
            >
              {formatFlipMultiplier(currentMultiplier)}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: "#374151" }}
          role="progressbar"
          aria-valuenow={currentFlips}
          aria-valuemin={0}
          aria-valuemax={displayCount}
          aria-label={`Flip progress: ${currentFlips} of ${displayCount}`}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress * 100}%`,
              background: isLost
                ? "#EF4444"
                : "linear-gradient(90deg, #00E5A0, #00B4D8)",
            }}
          />
        </div>

        {/* Milestone labels */}
        <div className="flex justify-between mt-1">
          {milestonePositions
            .filter((_, i) => i === 0 || i === milestonePositions.length - 1 || milestonePositions.length <= 5)
            .map((m) => (
              <span
                key={m.flip}
                className="font-mono-stats text-[10px]"
                style={{
                  color:
                    currentFlips >= m.flip ? "#00E5A0" : "#6B7280",
                }}
              >
                {m.label}
              </span>
            ))}
        </div>

        {/* Next multiplier preview */}
        {nextMultiplier && currentFlips > 0 && phase === "won" && (
          <p
            className="text-center font-mono-stats text-xs mt-1"
            style={{ color: "#6B7280" }}
          >
            Next: {formatFlipMultiplier(nextMultiplier)}
          </p>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Full circle view (desktop, ≤10 circles)
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full max-w-[400px] mx-auto">
      {/* Circles */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {Array.from({ length: displayCount }, (_, i) => {
          const flipNumber = i + 1;
          const isWon = flipNumber <= currentFlips && !isLost;
          const isWonBeforeLoss = flipNumber < currentFlips && isLost;
          const isCurrentlyFlipping =
            isFlipping && flipNumber === currentFlips + 1;
          const isLostFlip = isLost && flipNumber === currentFlips;
          const isFuture = flipNumber > currentFlips;

          return (
            <div key={flipNumber} className="flex flex-col items-center gap-0.5">
              <div
                className={`
                  w-3 h-3 rounded-full flex items-center justify-center
                  ${isCurrentlyFlipping ? "flip-chain-pulsing" : ""}
                  ${isLost && isWonBeforeLoss ? "flip-chain-loss-collapse" : ""}
                `}
                style={{
                  backgroundColor: isWon || isWonBeforeLoss
                    ? "#00E5A0"
                    : isLostFlip
                      ? "#EF4444"
                      : isCurrentlyFlipping
                        ? "#1F2937"
                        : "#374151",
                  border: `1.5px solid ${
                    isWon || isWonBeforeLoss
                      ? "#00E5A0"
                      : isLostFlip
                        ? "#EF4444"
                        : isCurrentlyFlipping
                          ? "#F59E0B"
                          : "#4B5563"
                  }`,
                  transition: "all 0.2s ease",
                }}
              >
                {(isWon || isWonBeforeLoss) && (
                  <Check size={8} color="#0B0F1A" strokeWidth={3} />
                )}
                {isLostFlip && (
                  <span
                    className="text-[8px] font-bold leading-none"
                    style={{ color: "#0B0F1A" }}
                  >
                    &times;
                  </span>
                )}
              </div>

              {/* Milestone label below specific circles */}
              {milestonePositions.find((m) => m.index === i) && (
                <span
                  className="font-mono-stats text-[9px]"
                  style={{
                    color:
                      flipNumber <= currentFlips ? "#00E5A0" : "#6B7280",
                  }}
                >
                  {milestonePositions.find((m) => m.index === i)!.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Screen reader description */}
      <div className="sr-only" role="progressbar" aria-valuenow={currentFlips} aria-valuemax={displayCount}>
        Flip {currentFlips} of {displayCount}
        {streak && currentFlips > 0 && `, current multiplier ${formatFlipMultiplier(streak.currentMultiplier)}`}
      </div>
    </div>
  );
}
