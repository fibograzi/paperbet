"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import type { PlinkoBetResult } from "./plinkoTypes";
import { usePlinkoGame } from "./usePlinkoGame";
import { usePlinkoAutoPlay } from "./usePlinkoAutoPlay";
import PlinkoBoard, { type PlinkoBoardRef } from "./PlinkoBoard";
import PlinkoSlots from "./PlinkoSlots";
import PlinkoResultOverlay from "./PlinkoResultOverlay";
import PlinkoControls from "./PlinkoControls";
import PlinkoSidebar from "./PlinkoSidebar";
import { getWinTier } from "@/lib/utils";
import type { WinTier } from "@/lib/utils";

export default function PlinkoGame() {
  const { state, dispatch, dropBall, canDrop } = usePlinkoGame();
  const boardRef = useRef<PlinkoBoardRef>(null);

  // Result overlay state
  const [resultDisplay, setResultDisplay] = useState<{
    multiplier: number;
    profit: number;
  } | null>(null);
  const [resultVisible, setResultVisible] = useState(false);
  const resultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Active slot highlight
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [winTier, setWinTier] = useState<WinTier | null>(null);

  // Post-session nudge timer
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const clearResultTimeout = useCallback(() => {
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
      resultTimeoutRef.current = null;
    }
  }, []);

  const showResult = useCallback(
    (result: PlinkoBetResult) => {
      clearResultTimeout();

      setResultDisplay({
        multiplier: result.multiplier,
        profit: result.profit,
      });
      setResultVisible(true);
      setActiveSlot(result.slotIndex);
      setWinTier(getWinTier(result.multiplier));

      resultTimeoutRef.current = setTimeout(() => {
        setResultVisible(false);
        setActiveSlot(null);
        setWinTier(null);
      }, 2000);
    },
    [clearResultTimeout]
  );

  // Core drop handler: generates path, animates ball, completes
  const handleDrop = useCallback((): PlinkoBetResult | null => {
    const result = dropBall();
    if (!result) return null;

    dispatch({ type: "BALL_ADDED" });

    // Clear nudge timer on each drop
    if (nudgeTimerRef.current) {
      clearTimeout(nudgeTimerRef.current);
      nudgeTimerRef.current = null;
    }

    const path = {
      directions: result.path,
      slotIndex: result.slotIndex,
      multiplier: result.multiplier,
    };

    const dropPromise = boardRef.current?.dropBall(path, result);
    if (dropPromise) {
      dropPromise
        .then(() => {
          dispatch({ type: "DROP_COMPLETE", result });
          dispatch({ type: "BALL_REMOVED" });
          showResult(result);

          // Start post-session nudge timer after drop completes
          const currentState = stateRef.current;
          if (
            currentState.sessionBetCount >= 9 &&
            !currentState.postSessionNudgeDismissed
          ) {
            nudgeTimerRef.current = setTimeout(() => {
              if (!stateRef.current.autoPlay.active) {
                dispatch({ type: "SHOW_POST_SESSION_NUDGE" });
              }
            }, 60000);
          }
        })
        .catch(() => {
          // Ball animation failed (e.g., canvas unavailable) — still complete the round
          dispatch({ type: "DROP_COMPLETE", result });
          dispatch({ type: "BALL_REMOVED" });
        });
    }

    return result;
  }, [dropBall, dispatch, showResult, state.sessionBetCount, state.postSessionNudgeDismissed, state.autoPlay.active]);

  // Auto-play integration
  const { startAutoPlay, stopAutoPlay } = usePlinkoAutoPlay(
    state,
    dispatch,
    handleDrop
  );

  const handleStartAutoPlay = useCallback(
    (config: {
      totalCount: number | null;
      stopOnWinMultiplier: number | null;
      stopOnProfit: number | null;
      stopOnLoss: number | null;
      onWin: "reset" | "increase";
      onLoss: "reset" | "increase";
      increaseOnWinPercent: number;
      increaseOnLossPercent: number;
    }) => {
      startAutoPlay({
        totalCount: config.totalCount,
        stopOnWinMultiplier: config.stopOnWinMultiplier,
        stopOnProfit: config.stopOnProfit,
        stopOnLoss: config.stopOnLoss,
        onWin: config.onWin,
        onLoss: config.onLoss,
        increaseOnWinPercent: config.increaseOnWinPercent,
        increaseOnLossPercent: config.increaseOnLossPercent,
        baseBet: state.config.betAmount,
        startBalance: state.balance,
      });
    },
    [startAutoPlay, state.config.betAmount, state.balance]
  );

  const handleStopAutoPlay = useCallback(() => {
    stopAutoPlay();
  }, [stopAutoPlay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearResultTimeout();
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, [clearResultTimeout]);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-3 pt-3 pb-20 lg:pb-3">
      {/* Desktop: 3-column layout | Tablet: board + side | Mobile: stacked */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Left: Controls (desktop only) */}
        <div className="hidden lg:block w-[260px] shrink-0">
          <PlinkoControls
            state={state}
            dispatch={dispatch}
            onDrop={handleDrop}
            canDrop={canDrop()}
            onStartAutoPlay={handleStartAutoPlay}
            onStopAutoPlay={handleStopAutoPlay}
          />
        </div>

        {/* Center: Board + Slots */}
        <div className="flex-1 min-w-0">
          <div className="relative max-w-[600px] mx-auto">
            {/* Result Overlay */}
            <PlinkoResultOverlay
              multiplier={resultDisplay?.multiplier ?? null}
              profit={resultDisplay?.profit ?? null}
              visible={resultVisible}
            />

            {/* Plinko Board Canvas */}
            <PlinkoBoard
              ref={boardRef}
              rows={state.config.rows}
              risk={state.config.risk}
              slotHeight={32}
            />

            {/* Multiplier Slots */}
            <div className="mt-1">
              <PlinkoSlots
                rows={state.config.rows}
                risk={state.config.risk}
                activeSlot={activeSlot}
                winTier={winTier}
              />
            </div>
          </div>

          {/* Mobile/Tablet: Controls below game */}
          <div className="lg:hidden mt-2">
            <PlinkoControls
              state={state}
              dispatch={dispatch}
              onDrop={handleDrop}
              canDrop={canDrop()}
              onStartAutoPlay={handleStartAutoPlay}
              onStopAutoPlay={handleStopAutoPlay}
            />
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="w-full lg:w-[280px] shrink-0">
          <PlinkoSidebar
            state={state}
            onDismissNudge={() =>
              dispatch({ type: "DISMISS_POST_SESSION_NUDGE" })
            }
          />
        </div>
      </div>
    </div>
  );
}
