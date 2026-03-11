"use client";

import { useEffect } from "react";
import { useDiceGame } from "./useDiceGame";
import DiceGameArea from "./DiceGameArea";
import DiceControls from "./DiceControls";
import DiceSidebar from "./DiceSidebar";

export default function DiceGame() {
  const { state, dispatch, roll, startAutoPlay, stopAutoPlay } = useDiceGame();

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Escape stops auto-play
      if (e.key === "Escape" && state.autoPlay.active) {
        stopAutoPlay();
        return;
      }

      // Don't process shortcuts during auto-play
      if (state.autoPlay.active) return;

      const isIdle = state.phase === "idle";

      switch (e.key.toLowerCase()) {
        case " ": // Space = roll
          e.preventDefault();
          if (isIdle) roll();
          break;
        case "a": // A = half bet
          if (isIdle) dispatch({ type: "SET_BET_AMOUNT", amount: state.betAmount / 2 });
          break;
        case "s": // S = double bet
          if (isIdle) dispatch({ type: "SET_BET_AMOUNT", amount: state.betAmount * 2 });
          break;
        case "d": // D = min bet
          if (isIdle) dispatch({ type: "SET_BET_AMOUNT", amount: 0.10 });
          break;
        case "q": // Q = toggle direction
          if (isIdle) dispatch({ type: "SWAP_DIRECTION" });
          break;
        case "w": // W = increase target (1.00 or 0.01 with shift)
          if (isIdle) {
            const step = e.shiftKey ? 0.01 : 1.00;
            dispatch({
              type: "SYNC_PARAM",
              field: "target",
              value: state.params.target + step,
            });
          }
          break;
        case "e": // E = decrease target
          if (isIdle) {
            const step = e.shiftKey ? 0.01 : 1.00;
            dispatch({
              type: "SYNC_PARAM",
              field: "target",
              value: state.params.target - step,
            });
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.phase, state.betAmount, state.params.target, state.autoPlay.active, roll, stopAutoPlay, dispatch]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full max-w-[1280px] mx-auto px-3 pt-3 pb-20 lg:pb-3">
      {/* Desktop: 3-column layout | Mobile: stacked */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Left: Controls (desktop only) */}
        <div className="hidden lg:block w-[260px] shrink-0">
          <DiceControls
            state={state}
            dispatch={dispatch}
            onRoll={roll}
            onStartAutoPlay={startAutoPlay}
            onStopAutoPlay={stopAutoPlay}
          />
        </div>

        {/* Center: Game Area */}
        <div className="flex-1 min-w-0">
          <div className="max-w-[700px] mx-auto">
            <DiceGameArea state={state} dispatch={dispatch} />
          </div>

          {/* Mobile: Controls below game */}
          <div className="lg:hidden mt-2">
            <DiceControls
              state={state}
              dispatch={dispatch}
              onRoll={roll}
              onStartAutoPlay={startAutoPlay}
              onStopAutoPlay={stopAutoPlay}
            />
          </div>
        </div>

        {/* Sidebar — single responsive render */}
        <div className="w-full lg:w-[280px] shrink-0">
          <DiceSidebar
            state={state}
            onDismissNudge={() => dispatch({ type: "DISMISS_POST_SESSION_NUDGE" })}
            onDismissReminder={() => dispatch({ type: "DISMISS_SESSION_REMINDER" })}
          />
        </div>
      </div>
    </div>
  );
}
