"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { KenoDifficulty } from "./kenoTypes";
import { getMultiplier, getBadgeColor, formatKenoMultiplier } from "./kenoEngine";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface KenoMultiplierRowProps {
  picks: number;
  difficulty: KenoDifficulty;
  currentMatchCount: number;
  isDrawing: boolean;
  isResult: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function KenoMultiplierRow({
  picks,
  difficulty,
  currentMatchCount,
  isDrawing,
  isResult,
}: KenoMultiplierRowProps) {
  // Build badge data for 0 to picks matches
  const badges = useMemo(() => {
    if (picks === 0) return [];

    return Array.from({ length: picks + 1 }, (_, matchCount) => {
      const multiplier = getMultiplier(difficulty, picks, matchCount);
      return {
        matchCount,
        multiplier,
        label: `${matchCount} hit${matchCount !== 1 ? "s" : ""}`,
      };
    });
  }, [picks, difficulty]);

  if (picks === 0) return null;

  const showActive = isDrawing || isResult;

  return (
    <div className="mt-3">
      <div
        className="flex justify-center gap-1.5 overflow-x-auto py-1 px-1"
        style={{ scrollbarWidth: "thin" }}
      >
        {badges.map((badge) => {
          const isActive = showActive && badge.matchCount === currentMatchCount;
          const isPassed = showActive && badge.matchCount < currentMatchCount;
          const colors = getBadgeColor(badge.multiplier);
          const isLoss = badge.multiplier === 0;

          let bg = "#1F2937";
          let textColor = "#6B7280";
          let border = "1px solid #374151";
          let shadow: string | undefined;

          if (isActive) {
            bg = colors.bg;
            textColor = colors.text;
            border = `1px solid ${colors.bg}`;
            shadow = colors.glow;
          } else if (isPassed) {
            bg = "#111827";
            textColor = "#6B7280";
            border = "1px solid transparent";
          } else if (isLoss) {
            textColor = "#4B5563";
          }

          return (
            <motion.div
              key={badge.matchCount}
              className="flex flex-col items-center justify-center rounded-full min-w-[44px] sm:min-w-[56px] px-2 sm:px-3 py-1 sm:py-1.5 shrink-0"
              style={{
                backgroundColor: bg,
                border,
                boxShadow: shadow,
              }}
              animate={isActive ? { scale: [1, 1.15, 1] } : { scale: isPassed ? 0.95 : 1 }}
              transition={isActive ? { duration: 0.3, type: "tween", ease: "easeInOut" } : { duration: 0.3, type: "spring" }}
            >
              <span
                className="font-mono-stats text-[10px] sm:text-xs font-bold leading-tight"
                style={{ color: textColor }}
              >
                {badge.multiplier === 0 ? "0x" : formatKenoMultiplier(badge.multiplier)}
              </span>
              <span
                className="font-body text-[8px] sm:text-[10px] leading-tight"
                style={{ color: isActive ? "rgba(255,255,255,0.8)" : "#4B5563" }}
              >
                {badge.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
