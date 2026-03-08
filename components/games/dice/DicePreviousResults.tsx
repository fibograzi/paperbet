"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DiceRound } from "./diceTypes";
import { formatDiceResult } from "./diceEngine";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DicePreviousResultsProps {
  results: DiceRound[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DicePreviousResults({ results }: DicePreviousResultsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to start (left) when new result is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [results.length]);

  if (results.length === 0) return null;

  return (
    <div className="w-full">
      {/* Badge row */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`.dice-prev-scroll::-webkit-scrollbar { display: none; }`}</style>
        <AnimatePresence initial={false}>
          {results.map((round) => (
            <motion.div
              key={round.id}
              className="shrink-0 font-mono-stats text-xs font-bold rounded-full px-3 flex items-center"
              style={{
                height: 28,
                backgroundColor: round.isWin
                  ? "rgba(0,229,160,0.1)"
                  : "rgba(239,68,68,0.1)",
                color: round.isWin ? "#00E5A0" : "#EF4444",
              }}
              initial={{ scale: 0.8, opacity: 0, x: -20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {formatDiceResult(round.result)}
            </motion.div>
          ))}
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
