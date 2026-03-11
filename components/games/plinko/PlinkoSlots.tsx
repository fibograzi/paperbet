"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PlinkoRows, RiskLevel } from "@/lib/types";
import { getMultipliers } from "./plinkoMultipliers";
import { getSlotColor, formatMultiplier } from "@/lib/utils";

interface PlinkoSlotsProps {
  rows: PlinkoRows;
  risk: RiskLevel;
  activeSlot: number | null;
  winTier: "loss" | "normal" | "good" | "big" | "jackpot" | null;
}

export default function PlinkoSlots({
  rows,
  risk,
  activeSlot,
  winTier,
}: PlinkoSlotsProps) {
  const multipliers = useMemo(() => getMultipliers(rows, risk), [rows, risk]);

  return (
    <div className="flex gap-[2px] px-[6%] w-full" role="list" aria-label="Multiplier slots">
      {multipliers.map((mult, i) => {
        const isActive = activeSlot === i;
        const color = getSlotColor(mult);
        const isJackpot = isActive && winTier === "jackpot";
        const isBigWin = isActive && (winTier === "big" || winTier === "jackpot");

        return (
          <div
            key={`${rows}-${risk}-${i}`}
            role="listitem"
            className="flex-1 flex items-center justify-center rounded-sm relative overflow-hidden transition-all duration-150"
            style={{
              backgroundColor: color,
              height: "32px",
              opacity: isActive ? 1 : 0.85,
              transform: isActive ? "scale(1.08)" : "scale(1)",
              transition: "transform 300ms ease, opacity 150ms ease",
              boxShadow: isBigWin
                ? `0 0 16px ${color}, 0 0 32px ${color}`
                : isActive
                  ? `0 0 8px ${color}`
                  : "none",
              zIndex: isActive ? 10 : 1,
            }}
          >
            <span
              className="font-mono-stats text-white font-bold leading-none select-none"
              style={{
                fontSize: multipliers.length > 13 ? "9px" : "11px",
              }}
            >
              {mult >= 1000
                ? `${(mult / 1000).toFixed(mult >= 10000 ? 0 : 1).replace(/\.0$/, "")}K`
                : mult >= 100
                  ? `${mult.toFixed(0)}x`
                  : `${mult % 1 === 0 ? mult.toFixed(0) : mult.toFixed(1)}x`}
            </span>
            <AnimatePresence>
              {isJackpot && (
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.4, 0] }}
                  transition={{ duration: 0.6, repeat: 2 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
