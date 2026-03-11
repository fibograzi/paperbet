"use client";

import { useCallback, useEffect } from "react";
import { useCrashGame } from "./useCrashGame";
import { getTimeForMultiplier } from "./crashEngine";
import type { CrashAutoPlayState } from "./crashTypes";
import CrashChart from "./CrashChart";
import CrashControls from "./CrashControls";
import CrashPreviousRounds from "./CrashPreviousRounds";
import CrashSidebar from "./CrashSidebar";

export default function CrashGame() {
  const { state, dispatch, placeBet, cancelBet, queueBet, cancelQueue, cashOut, startGame } =
    useCrashGame();

  // Start the game loop on mount. The hook's internal gameActiveRef
  // handles Strict Mode's double-mount (cleanup resets it, allowing restart).
  useEffect(() => {
    startGame();
  }, [startGame]);

  // Derive elapsed time from current multiplier for the chart
  const elapsedTime =
    state.phase === "running" || state.phase === "crashed"
      ? getTimeForMultiplier(state.currentMultiplier)
      : 0;

  // Auto-play handlers
  const handleStartAutoPlay = useCallback(
    (config: {
      totalCount: number | null;
      cashoutAt: number;
      onWin: "same" | "increase" | "reset";
      onLoss: "same" | "increase" | "reset";
      increaseOnWinPercent: number;
      increaseOnLossPercent: number;
      baseBet: number;
      stopOnProfit: number | null;
      stopOnLoss: number | null;
    }) => {
      dispatch({
        type: "AUTO_PLAY_START",
        config: config as Omit<CrashAutoPlayState, "active" | "currentCount" | "startingNetProfit">,
      });
      // If in betting phase and no bet yet, immediately place bet for current round
      if (state.phase === "betting" && !state.hasBet && state.balance >= state.config.betAmount) {
        dispatch({ type: "PLACE_BET" });
        dispatch({ type: "AUTO_PLAY_TICK" });
      }
    },
    [dispatch, state.phase, state.hasBet, state.balance, state.config.betAmount]
  );

  const handleStopAutoPlay = useCallback(() => {
    dispatch({ type: "AUTO_PLAY_STOP" });
  }, [dispatch]);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-3 pt-3 pb-20 lg:pb-3">
      {/* Desktop: 3-column layout | Tablet: chart + side | Mobile: stacked */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Left: Controls (desktop only — mobile shows below chart) */}
        <div className="hidden lg:block w-[260px] shrink-0">
          <CrashControls
            state={state}
            dispatch={dispatch}
            onPlaceBet={placeBet}
            onCancelBet={cancelBet}
            onQueueBet={queueBet}
            onCancelQueue={cancelQueue}
            onCashOut={cashOut}
            onStartAutoPlay={handleStartAutoPlay}
            onStopAutoPlay={handleStopAutoPlay}
          />
        </div>

        {/* Center: Previous Rounds + Chart */}
        <div className="flex-1 min-w-0">
          {/* Previous Rounds */}
          {state.previousCrashPoints.length > 0 && (
            <div className="mb-3">
              <CrashPreviousRounds
                crashPoints={state.previousCrashPoints}
              />
            </div>
          )}

          {/* Crash Chart */}
          <div className="max-w-[700px] mx-auto">
            <CrashChart
              phase={state.phase}
              currentMultiplier={state.currentMultiplier}
              crashPoint={state.crashPoint}
              elapsedTime={elapsedTime}
              countdown={state.countdown}
              cashedOut={state.cashedOut}
              cashoutMultiplier={state.cashoutMultiplier}
            />
          </div>

          {/* Mobile/Tablet: Controls below game area */}
          <div className="lg:hidden mt-2">
            <CrashControls
              state={state}
              dispatch={dispatch}
              onPlaceBet={placeBet}
              onCancelBet={cancelBet}
              onQueueBet={queueBet}
              onCancelQueue={cancelQueue}
              onCashOut={cashOut}
              onStartAutoPlay={handleStartAutoPlay}
              onStopAutoPlay={handleStopAutoPlay}
            />
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="w-full lg:w-[280px] shrink-0">
          <CrashSidebar
            state={state}
            onDismissNudge={() => dispatch({ type: "DISMISS_POST_SESSION_NUDGE" })}
          />
        </div>
      </div>
    </div>
  );
}
