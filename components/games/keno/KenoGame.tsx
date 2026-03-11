"use client";

import { useEffect } from "react";
import { useKenoGame } from "./useKenoGame";
import KenoBoard from "./KenoBoard";
import KenoMultiplierRow from "./KenoMultiplierRow";
import KenoControls from "./KenoControls";
import KenoSidebar from "./KenoSidebar";

export default function KenoGame() {
  const { state, dispatch, bet, startAutoPlay, stopAutoPlay } = useKenoGame();

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
        case "q": // Q = random pick
          if (isIdle) dispatch({ type: "RANDOM_PICK" });
          break;
        case "w": // W = clear table
          if (isIdle) dispatch({ type: "CLEAR_TABLE" });
          break;
        case "1": // 1 = Classic
          if (isIdle) dispatch({ type: "SET_DIFFICULTY", difficulty: "classic" });
          break;
        case "2": // 2 = Low
          if (isIdle) dispatch({ type: "SET_DIFFICULTY", difficulty: "low" });
          break;
        case "3": // 3 = Medium
          if (isIdle) dispatch({ type: "SET_DIFFICULTY", difficulty: "medium" });
          break;
        case "4": // 4 = High
          if (isIdle) dispatch({ type: "SET_DIFFICULTY", difficulty: "high" });
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.phase, state.betAmount, state.autoPlay.active, bet, stopAutoPlay, dispatch]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full max-w-[1280px] mx-auto px-3 pt-3 pb-20 lg:pb-3">
      {/* Desktop: 3-column layout | Mobile: stacked */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Left: Controls (desktop only) */}
        <div className="hidden lg:block w-[260px] shrink-0">
          <KenoControls
            state={state}
            dispatch={dispatch}
            onBet={bet}
            onStartAutoPlay={startAutoPlay}
            onStopAutoPlay={stopAutoPlay}
          />
        </div>

        {/* Center: Game Area */}
        <div className="flex-1 min-w-0">
          <div className="max-w-[720px] mx-auto">
            <KenoBoard state={state} dispatch={dispatch} />
            <KenoMultiplierRow
              picks={state.selectedNumbers.length}
              difficulty={state.difficulty}
              currentMatchCount={state.currentMatchCount}
              isDrawing={state.phase === "drawing"}
              isResult={state.phase === "result"}
            />
          </div>

          {/* Mobile: Controls below game */}
          <div className="lg:hidden mt-2">
            <KenoControls
              state={state}
              dispatch={dispatch}
              onBet={bet}
              onStartAutoPlay={startAutoPlay}
              onStopAutoPlay={stopAutoPlay}
            />
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="w-full lg:w-[280px] shrink-0">
          <KenoSidebar
            state={state}
            onDismissNudge={() => dispatch({ type: "DISMISS_POST_SESSION_NUDGE" })}
            onDismissReminder={() => dispatch({ type: "DISMISS_SESSION_REMINDER" })}
          />
        </div>
      </div>
    </div>
  );
}
