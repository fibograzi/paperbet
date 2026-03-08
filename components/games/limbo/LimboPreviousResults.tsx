"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LimboRound } from "./limboTypes";
import { formatLimboResult, getResultBadgeColor } from "./limboEngine";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LimboPreviousResultsProps {
  results: LimboRound[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LimboPreviousResults({ results }: LimboPreviousResultsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to start (left) when new result is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [results.length]);

  if (results.length === 0) return null;

  return (
    <div className="w-full" role="list" aria-label="Previous results">
      {/* Badge row */}
      <div
        ref={scrollRef}
        className="limbo-prev-scroll flex gap-1.5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`.limbo-prev-scroll::-webkit-scrollbar { display: none; }`}</style>
        <AnimatePresence initial={false}>
          {results.map((round) => {
            const colors = getResultBadgeColor(round.resultMultiplier);
            return (
              <motion.div
                key={round.id}
                role="listitem"
                className="shrink-0 font-mono-stats text-xs font-bold rounded-full px-3 flex items-center"
                style={{
                  height: 28,
                  backgroundColor: colors.bg,
                  color: colors.text,
                }}
                initial={{ scale: 0.8, opacity: 0, x: -20 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                {formatLimboResult(round.resultMultiplier)}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Streak dots */}
      <div className="flex gap-0.5 mt-1.5 overflow-hidden" style={{ maxWidth: "100%" }}>
        {results.slice(0, 20).map((round) => (
          <div
            key={`dot-${round.id}`}
            className="rounded-full shrink-0"
            style={{
              width: 4,
              height: 4,
              backgroundColor: round.isWin ? "#00E5A0" : "#EF4444",
            }}
          />
        ))}
      </div>
    </div>
  );
}
