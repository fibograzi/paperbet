"use client";

import { useEffect } from "react";
import { useLimboGame } from "./useLimboGame";
import LimboGameArea from "./LimboGameArea";
import LimboControls from "./LimboControls";
import LimboSidebar from "./LimboSidebar";

export default function LimboGame() {
  const { state, dispatch, bet, startAutoPlay, stopAutoPlay } = useLimboGame();

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
        case " ": // Space = bet
        case "enter":
          e.preventDefault();
          if (isIdle) bet();
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
        case "w": // W = increase target
          if (isIdle) {
            const step = e.shiftKey ? 0.01 : (state.targetMultiplier < 2 ? 0.01 : state.targetMultiplier < 100 ? 0.10 : 1.00);
            dispatch({ type: "SET_TARGET", target: state.targetMultiplier + step });
          }
          break;
        case "e": // E = decrease target
          if (isIdle) {
            const step = e.shiftKey ? 0.01 : (state.targetMultiplier <= 2 ? 0.01 : state.targetMultiplier <= 100 ? 0.10 : 1.00);
            dispatch({ type: "SET_TARGET", target: state.targetMultiplier - step });
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.phase, state.betAmount, state.targetMultiplier, state.autoPlay.active, bet, stopAutoPlay, dispatch]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 py-6">
      {/* Desktop: 3-column layout | Mobile: stacked */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls (desktop only) */}
        <div className="hidden lg:block w-[300px] shrink-0">
          <LimboControls
            state={state}
            dispatch={dispatch}
            onBet={bet}
            onStartAutoPlay={startAutoPlay}
            onStopAutoPlay={stopAutoPlay}
          />
        </div>

        {/* Center: Game Area */}
        <div className="flex-1 min-w-0">
          <div className="max-w-[700px] mx-auto">
            <LimboGameArea state={state} />
          </div>

          {/* Mobile/Tablet: Controls below arena */}
          <div className="lg:hidden mt-4">
            <LimboControls
              state={state}
              dispatch={dispatch}
              onBet={bet}
              onStartAutoPlay={startAutoPlay}
              onStopAutoPlay={stopAutoPlay}
            />
          </div>
        </div>

        {/* Right: Sidebar (desktop) */}
        <div className="hidden lg:block w-[320px] shrink-0">
          <LimboSidebar
            state={state}
            onDismissNudge={() => dispatch({ type: "DISMISS_POST_SESSION_NUDGE" })}
            onDismissReminder={() => dispatch({ type: "DISMISS_SESSION_REMINDER" })}
          />
        </div>
      </div>

      {/* Mobile/Tablet: Sidebar content below */}
      <div className="lg:hidden mt-6">
        <LimboSidebar
          state={state}
          onDismissNudge={() => dispatch({ type: "DISMISS_POST_SESSION_NUDGE" })}
          onDismissReminder={() => dispatch({ type: "DISMISS_SESSION_REMINDER" })}
        />
      </div>
    </div>
  );
}
