"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useMinesGame } from "./useMinesGame";
import type { MinesAutoPlayState } from "./minesTypes";
import MinesBoard from "./MinesBoard";
import MinesMultiplierBar from "./MinesMultiplierBar";
import MinesDangerMeter from "./MinesDangerMeter";
import MinesControls from "./MinesControls";
import MinesSidebar from "./MinesSidebar";
import { formatMinesMultiplier } from "./minesCalculator";
import { formatCurrency } from "@/lib/utils";

export default function MinesGame() {
  const { state, dispatch, startGame, revealTile, cashOut, newGame, pickRandom } =
    useMinesGame();

  // Board shaking state (triggered on mine hit)
  const [shaking, setShaking] = useState(false);
  const prevPhaseRef = useRef(state.phase);

  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = state.phase;

    if (prev !== "GAME_OVER" && state.phase === "GAME_OVER" && state.gameOverReason === "mine_hit") {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.gameOverReason]);

  // Danger meter visibility
  const showDanger = state.phase === "PLAYING";

  // Auto-play handlers
  const handleStartAutoPlay = useCallback(
    (config: Omit<MinesAutoPlayState, "active" | "currentCount" | "startingNetProfit">) => {
      dispatch({ type: "AUTO_PLAY_START", config });
      // The auto-play effect in useMinesGame handles START_GAME automatically.
    },
    [dispatch],
  );

  const handleStopAutoPlay = useCallback(() => {
    dispatch({ type: "AUTO_PLAY_STOP" });
  }, [dispatch]);

  // Mobile fixed cash-out bar
  const showMobileCashout =
    state.phase === "PLAYING" &&
    state.gemsRevealed >= 1 &&
    !state.autoPlay.active;

  const cashoutAmount = state.betAmount * state.currentMultiplier;

  // Aria live region text
  const ariaLiveText = useMemo(() => {
    if (state.phase === "GAME_OVER") {
      if (state.gameOverReason === "mine_hit") {
        return `Mine hit! Game over. You lost ${formatCurrency(Math.abs(state.profit))}.`;
      }
      if (state.gameOverReason === "cashout") {
        return `Cashed out at ${formatMinesMultiplier(state.currentMultiplier)}. Profit: ${formatCurrency(state.profit)}.`;
      }
      if (state.gameOverReason === "full_clear") {
        return `Perfect clear! All gems found at ${formatMinesMultiplier(state.currentMultiplier)}. Profit: ${formatCurrency(state.profit)}.`;
      }
    }
    if (state.revealingTile === null && state.gemsRevealed > 0 && state.phase === "PLAYING") {
      return `Gem found. Multiplier is now ${formatMinesMultiplier(state.currentMultiplier)}. Danger: ${Math.round(state.dangerPercent * 100)}%.`;
    }
    return "";
  }, [state.phase, state.gameOverReason, state.profit, state.currentMultiplier, state.dangerPercent, state.revealingTile, state.gemsRevealed]);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 py-6">
      {/* Aria live region for screen readers */}
      <div aria-live="assertive" className="sr-only">
        {ariaLiveText}
      </div>

      {/* Desktop: 3-column | Tablet: chart + side | Mobile: stacked */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls (desktop only — mobile shows below game) */}
        <div className="hidden lg:block w-[300px] shrink-0">
          <MinesControls
            state={state}
            dispatch={dispatch}
            onStartGame={startGame}
            onCashOut={cashOut}
            onNewGame={newGame}
            onPickRandom={pickRandom}
            onStartAutoPlay={handleStartAutoPlay}
            onStopAutoPlay={handleStopAutoPlay}
          />
        </div>

        {/* Center: Multiplier Bar + Danger Meter + Board */}
        <div className="flex-1 min-w-0">
          <div className="max-w-[500px] mx-auto">
            {/* Multiplier Bar */}
            <MinesMultiplierBar
              phase={state.phase}
              gameOverReason={state.gameOverReason}
              gemsRevealed={state.gemsRevealed}
              mineCount={state.mineCount}
              currentMultiplier={state.currentMultiplier}
              nextMultiplier={state.nextMultiplier}
              betAmount={state.betAmount}
              profit={state.profit}
            />

            {/* Danger Meter */}
            <div className="mb-1.5">
              <MinesDangerMeter
                danger={state.dangerPercent}
                visible={showDanger}
              />
            </div>

            {/* Board */}
            <MinesBoard
              tileStates={state.tileStates}
              phase={state.phase}
              mineCount={state.mineCount}
              minePositions={state.minePositions}
              onTileClick={revealTile}
              shaking={shaking}
            />
          </div>

          {/* Mobile/Tablet: Controls below board */}
          <div className="lg:hidden mt-4">
            <MinesControls
              state={state}
              dispatch={dispatch}
              onStartGame={startGame}
              onCashOut={cashOut}
              onNewGame={newGame}
              onPickRandom={pickRandom}
              onStartAutoPlay={handleStartAutoPlay}
              onStopAutoPlay={handleStopAutoPlay}
            />
          </div>
        </div>

        {/* Right: Sidebar (desktop) */}
        <div className="hidden lg:block w-[320px] shrink-0">
          <MinesSidebar
            state={state}
            onDismissNudge={() =>
              dispatch({ type: "DISMISS_POST_SESSION_NUDGE" })
            }
            onDismissReminder={() =>
              dispatch({ type: "DISMISS_SESSION_REMINDER" })
            }
          />
        </div>
      </div>

      {/* Mobile/Tablet: Sidebar below */}
      <div className="lg:hidden mt-6">
        <MinesSidebar
          state={state}
          onDismissNudge={() =>
            dispatch({ type: "DISMISS_POST_SESSION_NUDGE" })
          }
          onDismissReminder={() =>
            dispatch({ type: "DISMISS_SESSION_REMINDER" })
          }
        />
      </div>

      {/* Mobile: Fixed Cash Out bar */}
      {showMobileCashout && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={cashOut}
            className="w-full h-14 rounded-xl bg-pb-warning text-[#0B0F1A] font-heading font-bold text-lg shadow-lg mines-cashout-pulse"
            style={{ boxShadow: "0 -4px 20px rgba(245, 158, 11, 0.3)" }}
          >
            Cash Out — {formatMinesMultiplier(state.currentMultiplier)} (
            {formatCurrency(cashoutAmount)})
          </button>
        </div>
      )}
    </div>
  );
}
