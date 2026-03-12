"use client";

import { useRef, useEffect, useState } from "react";
import { Crown, Diamond } from "lucide-react";
import type { CoinSide, FlipPhase } from "./flipTypes";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FlipCoinProps {
  phase: FlipPhase;
  lastResult: CoinSide | null;
  pendingResult: CoinSide | null;
  instantBet: boolean;
  speedMode: "normal" | "quick" | "instant";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FlipCoin({
  phase,
  lastResult,
  pendingResult,
  instantBet,
  speedMode,
}: FlipCoinProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const coinRef = useRef<HTMLDivElement>(null);

  // Use a key to force re-mount the coin div when a new flip starts,
  // which restarts the CSS animation
  const [flipKey, setFlipKey] = useState(0);

  useEffect(() => {
    if (phase === "flipping") {
      setFlipKey((k) => k + 1);
    }
  }, [phase]);

  const isFlipping = phase === "flipping";
  const isIdle = phase === "idle" && lastResult === null;
  const isWon = phase === "won" || phase === "cashing_out";
  const isLost = phase === "lost";

  // During flipping: use pendingResult to determine animation class
  // After flipping: use lastResult
  const displayResult = isFlipping ? pendingResult : lastResult;

  const skipAnimation = instantBet || speedMode !== "normal";

  // Determine the CSS animation class
  const getAnimationClass = () => {
    if (isFlipping && !skipAnimation && !prefersReducedMotion) {
      // Use tails animation if result is tails (ends at 180deg offset)
      return pendingResult === "tails"
        ? "flip-coin-spinning-tails"
        : "flip-coin-spinning";
    }
    if (isWon) return "flip-coin-float";
    if (isLost) return "flip-coin-lost";
    if (isIdle && !prefersReducedMotion) return "flip-coin-idle";
    return "";
  };

  // Determine the final rotation for non-animating states
  const getFinalRotation = () => {
    if (isFlipping) {
      if (skipAnimation || prefersReducedMotion) {
        return pendingResult === "tails" ? 180 : 0;
      }
      return undefined; // CSS animation handles it
    }
    if (lastResult === "tails") return 180;
    return 0;
  };

  const rotation = getFinalRotation();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Coin container with perspective */}
      <div className="relative" style={{ perspective: "600px" }}>
        <div
          ref={coinRef}
          key={flipKey}
          className={`relative w-[96px] h-[96px] md:w-[120px] md:h-[120px] ${getAnimationClass()}`}
          style={{
            transformStyle: "preserve-3d",
            transform: rotation !== undefined
              ? `rotateY(${rotation}deg)`
              : undefined,
            transition:
              (isFlipping && skipAnimation)
                ? "transform 0.2s ease-out"
                : (!isFlipping && !isIdle)
                  ? "transform 0.3s ease-out"
                  : undefined,
          }}
          role="img"
          aria-label={
            isFlipping
              ? "Coin is spinning"
              : lastResult
                ? `Coin showing ${lastResult}`
                : "Coin ready to flip"
          }
        >
          {/* Heads face */}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              border: `3px solid ${isWon && lastResult === "heads" ? "#00E5A0" : "#F59E0B"}`,
              boxShadow: [
                "0 4px 20px rgba(0, 0, 0, 0.3)",
                "inset 0 0 20px rgba(245, 158, 11, 0.3)",
                isWon && lastResult === "heads"
                  ? "0 0 30px rgba(0, 229, 160, 0.3)"
                  : "",
              ]
                .filter(Boolean)
                .join(", "),
              opacity: isLost ? 0.5 : 1,
              transition: "opacity 0.3s, border-color 0.3s, box-shadow 0.3s",
            }}
          >
            <Crown
              size={48}
              strokeWidth={2.5}
              color="#0B0F1A"
              className="md:w-12 md:h-12 w-9 h-9"
            />
          </div>

          {/* Tails face */}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(135deg, #00B4D8, #0284C7)",
              border: `3px solid ${isWon && lastResult === "tails" ? "#00E5A0" : "#00B4D8"}`,
              boxShadow: [
                "0 4px 20px rgba(0, 0, 0, 0.3)",
                "inset 0 0 20px rgba(0, 180, 216, 0.3)",
                isWon && lastResult === "tails"
                  ? "0 0 30px rgba(0, 229, 160, 0.3)"
                  : "",
              ]
                .filter(Boolean)
                .join(", "),
              opacity: isLost ? 0.5 : 1,
              transition: "opacity 0.3s, border-color 0.3s, box-shadow 0.3s",
            }}
          >
            <Diamond
              size={48}
              strokeWidth={2.5}
              color="#0B0F1A"
              className="md:w-12 md:h-12 w-9 h-9"
            />
          </div>
        </div>

        {/* Loss X overlay */}
        {isLost && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ animation: "fadeIn 0.2s ease-out" }}
          >
            <span
              className="font-mono-stats text-5xl font-bold"
              style={{
                color: "#EF4444",
                textShadow: "0 0 10px rgba(239, 68, 68, 0.5)",
              }}
            >
              &times;
            </span>
          </div>
        )}
      </div>

      {/* Idle text */}
      {isIdle && (
        <p
          className="font-body text-sm text-center"
          style={{ color: "#6B7280" }}
        >
          Pick a side and flip!
        </p>
      )}

      {/* ARIA live region for screen readers */}
      <div aria-live="polite" className="sr-only">
        {isFlipping && "Coin is flipping..."}
        {!isFlipping &&
          lastResult &&
          (phase === "won" || phase === "cashing_out"
            ? `${lastResult}! You won!`
            : `${lastResult}. You lost.`)}
      </div>
    </div>
  );
}
