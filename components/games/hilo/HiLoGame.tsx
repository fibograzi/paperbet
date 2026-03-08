"use client";

import { useEffect } from "react";
import { useHiLoGame } from "./useHiLoGame";
import HiLoCardArena from "./HiLoCardArena";
import HiLoControls from "./HiLoControls";
import HiLoSidebar from "./HiLoSidebar";
import type { Prediction } from "./hiloTypes";

export default function HiLoGame() {
  const { state, dispatch, placeBet, predict, skip, cashOut } = useHiLoGame();

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      // Ignore when typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      // Don't interfere with auto-play
      if (state.autoPlay.active) return;

      switch (e.key.toLowerCase()) {
        case " ": // Space = place bet
          e.preventDefault();
          if (state.phase === "idle") placeBet();
          break;
        case "q": // Q = higher
          if (state.phase === "predicting") predict("higher" as Prediction);
          break;
        case "w": // W = lower
          if (state.phase === "predicting") predict("lower" as Prediction);
          break;
        case "e": // E = skip
          if (state.phase === "predicting") skip();
          break;
        case "c": // C = cash out
          if (state.phase === "predicting") cashOut();
          break;
        case "a": // A = half bet
          if (state.phase === "idle") {
            dispatch({
              type: "SET_BET_AMOUNT",
              amount: state.config.betAmount / 2,
            });
          }
          break;
        case "s": // S = double bet
          if (state.phase === "idle") {
            dispatch({
              type: "SET_BET_AMOUNT",
              amount: state.config.betAmount * 2,
            });
          }
          break;
        case "d": // D = min bet
          if (state.phase === "idle") {
            dispatch({ type: "SET_BET_AMOUNT", amount: 0.1 });
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.phase, state.config.betAmount, state.autoPlay.active, placeBet, predict, skip, cashOut, dispatch]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 py-6">
      {/* Desktop: 3-column layout | Tablet: arena + side | Mobile: stacked */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls (desktop only — mobile shows below arena) */}
        <div className="hidden lg:block w-[300px] shrink-0">
          <HiLoControls
            state={state}
            dispatch={dispatch}
            onPlaceBet={placeBet}
            onPredict={predict}
            onSkip={skip}
            onCashOut={cashOut}
          />
        </div>

        {/* Center: Card Arena */}
        <div className="flex-1 min-w-0">
          <div className="max-w-[700px] mx-auto">
            <HiLoCardArena state={state} />
          </div>

          {/* Mobile/Tablet: Controls below arena */}
          <div className="lg:hidden mt-4">
            <HiLoControls
              state={state}
              dispatch={dispatch}
              onPlaceBet={placeBet}
              onPredict={predict}
              onSkip={skip}
              onCashOut={cashOut}
            />
          </div>
        </div>

        {/* Right: Sidebar (desktop) */}
        <div className="hidden lg:block w-[320px] shrink-0">
          <HiLoSidebar
            state={state}
            onDismissNudge={() =>
              dispatch({ type: "DISMISS_POST_SESSION_NUDGE" })
            }
          />
        </div>
      </div>

      {/* Mobile/Tablet: Sidebar content below */}
      <div className="lg:hidden mt-6">
        <HiLoSidebar
          state={state}
          onDismissNudge={() =>
            dispatch({ type: "DISMISS_POST_SESSION_NUDGE" })
          }
        />
      </div>
    </div>
  );
}
