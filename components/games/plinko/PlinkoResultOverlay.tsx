"use client";

import { motion, AnimatePresence } from "framer-motion";
import { getResultColor, getWinTier, formatCurrency } from "@/lib/utils";

interface PlinkoResultOverlayProps {
  multiplier: number | null;
  profit: number | null;
  visible: boolean;
}

export default function PlinkoResultOverlay({
  multiplier,
  profit,
  visible,
}: PlinkoResultOverlayProps) {
  if (multiplier === null || profit === null) return null;

  const color = getResultColor(multiplier);
  const tier = getWinTier(multiplier);
  const isJackpot = tier === "jackpot";
  const isBigWin = tier === "big" || tier === "jackpot";

  const formatMult = (m: number): string => {
    if (m >= 1000) return `${(m / 1000).toFixed(0)},000x`;
    if (m >= 100) return `${m.toFixed(0)}x`;
    return `${m.toFixed(1)}x`;
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="result-overlay"
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          <div
            className="font-mono-stats font-bold select-none"
            style={{
              color,
              fontSize: "clamp(32px, 6vw, 48px)",
              textShadow: isJackpot
                ? `0 0 20px ${color}, 0 0 40px ${color}`
                : isBigWin
                  ? `0 0 12px ${color}`
                  : "none",
            }}
          >
            {formatMult(multiplier)}
          </div>
          <div
            className="font-mono-stats text-xl select-none mt-1"
            style={{
              color: profit >= 0 ? "#00E5A0" : "#EF4444",
            }}
          >
            {profit >= 0 ? "+" : ""}
            {formatCurrency(profit)}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
