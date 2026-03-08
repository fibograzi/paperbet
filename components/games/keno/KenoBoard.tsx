"use client";

import { useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { KenoGameState, KenoAction } from "./kenoTypes";
import KenoTile from "./KenoTile";
import KenoResultOverlay from "./KenoResultOverlay";
import { MAX_PICKS } from "./kenoEngine";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface KenoBoardProps {
  state: KenoGameState;
  dispatch: React.Dispatch<KenoAction>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function KenoBoard({ state, dispatch }: KenoBoardProps) {
  const {
    phase,
    selectedNumbers,
    currentDraw,
    revealedNumbers,
    maxPicksShake,
  } = state;

  const selectedSet = useMemo(() => new Set(selectedNumbers), [selectedNumbers]);
  const revealedSet = useMemo(() => new Set(revealedNumbers), [revealedNumbers]);
  const matchSet = useMemo(
    () => new Set(currentDraw?.matches ?? []),
    [currentDraw?.matches],
  );

  const isDrawing = phase === "drawing" || phase === "result";

  // Handle tile click
  const handleTileClick = useCallback(
    (num: number) => {
      if (isDrawing) return;

      // If already selected, toggle off
      if (selectedSet.has(num)) {
        dispatch({ type: "TOGGLE_NUMBER", number: num });
        return;
      }

      // If at max, shake
      if (selectedNumbers.length >= MAX_PICKS) {
        dispatch({ type: "MAX_PICKS_SHAKE" });
        return;
      }

      dispatch({ type: "TOGGLE_NUMBER", number: num });
    },
    [isDrawing, selectedSet, selectedNumbers.length, dispatch],
  );

  // Clear shake after 300ms
  useEffect(() => {
    if (!maxPicksShake) return;
    const timer = setTimeout(() => {
      dispatch({ type: "CLEAR_MAX_PICKS_SHAKE" });
    }, 300);
    return () => clearTimeout(timer);
  }, [maxPicksShake, dispatch]);

  // Determine visual state for each tile
  const getTileState = useCallback(
    (num: number) => {
      if (isDrawing && revealedSet.has(num)) {
        // Revealed during draw
        if (matchSet.has(num)) return "hit" as const;
        return "miss" as const;
      }

      // During/after draw, selected but not drawn
      if (isDrawing && selectedSet.has(num)) {
        return "not_drawn_selected" as const;
      }

      if (selectedSet.has(num)) return "selected" as const;
      return "default" as const;
    },
    [isDrawing, revealedSet, matchSet, selectedSet],
  );

  // Generate tiles 1–40
  const tiles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => i + 1);
  }, []);

  return (
    <div className="relative">
      {/* Board container */}
      <motion.div
        className="rounded-xl p-3 sm:p-4"
        style={{
          backgroundColor: "#0B0F1A",
          border: "1px solid #1F2937",
        }}
        animate={maxPicksShake ? { x: [0, -3, 3, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* 8×5 Grid */}
        <div
          className="grid gap-1.5 sm:gap-2"
          style={{ gridTemplateColumns: "repeat(8, 1fr)" }}
          role="grid"
          aria-label="Keno number board"
        >
          {tiles.map((num) => (
            <KenoTile
              key={num}
              number={num}
              visualState={getTileState(num)}
              disabled={isDrawing}
              onClick={handleTileClick}
            />
          ))}
        </div>
      </motion.div>

      {/* Result overlay */}
      <AnimatePresence>
        {phase === "result" && state.currentDraw && (
          <KenoResultOverlay
            multiplier={state.currentDraw.multiplier}
            profit={state.currentDraw.profit}
            matchCount={state.currentDraw.matchCount}
            picks={state.currentDraw.picks}
          />
        )}
      </AnimatePresence>

      {/* Accessibility live region — always in DOM */}
      <div aria-live="polite" className="sr-only">
        {phase === "result" && state.currentDraw && (
          <span>
            Draw complete. {state.currentDraw.matchCount} out of {state.currentDraw.picks} matches.
            {state.currentDraw.multiplier > 0
              ? ` You won ${state.currentDraw.multiplier.toFixed(2)} times your bet.`
              : " No payout this round."}
          </span>
        )}
      </div>
    </div>
  );
}
