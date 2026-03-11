"use client";

import { useEffect } from "react";
import { useFlipGame } from "./useFlipGame";
import FlipArena from "./FlipArena";
import FlipControls from "./FlipControls";
import FlipSidebar from "./FlipSidebar";

export default function FlipGame() {
  const { state, dispatch, flip, flipAgain, cashOut } = useFlipGame();

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
      if (state.autoPlay.active) {
        if (e.key === "Escape") {
          dispatch({ type: "AUTO_PLAY_STOP" });
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ": // Space = flip or flip again
          e.preventDefault();
          if (state.phase === "idle") flip();
          else if (state.phase === "won") flipAgain();
          break;
        case "c": // C = cash out
          if (state.phase === "won") cashOut();
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
        case "h": // H = heads
          if (state.phase === "idle" || state.phase === "won") {
            dispatch({ type: "SET_SIDE_PICK", pick: "heads" });
          }
          break;
        case "t": // T = tails
          if (state.phase === "idle" || state.phase === "won") {
            dispatch({ type: "SET_SIDE_PICK", pick: "tails" });
          }
          break;
        case "r": // R = random
          if (state.phase === "idle" || state.phase === "won") {
            dispatch({ type: "SET_SIDE_PICK", pick: "random" });
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    state.phase,
    state.config.betAmount,
    state.autoPlay.active,
    flip,
    flipAgain,
    cashOut,
    dispatch,
  ]);

  // ---------------------------------------------------------------------------
  // Haptic feedback (mobile)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!("vibrate" in navigator)) return;

    if (state.phase === "flipping") {
      navigator.vibrate(50);
    } else if (state.phase === "won" && state.streak) {
      if (state.streak.flips >= 5) {
        navigator.vibrate([100, 50, 100]);
      } else {
        navigator.vibrate(80);
      }
    } else if (state.phase === "cashing_out" && state.streak && state.streak.flips >= 5) {
      navigator.vibrate(200);
    }
  }, [state.phase, state.streak]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 py-6">
      {/* Desktop: 3-column layout | Tablet: arena + side | Mobile: stacked */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls (desktop only — mobile shows below arena) */}
        <div className="hidden lg:block w-[300px] shrink-0">
          <FlipControls
            state={state}
            dispatch={dispatch}
            onFlip={flip}
            onCashOut={cashOut}
            onFlipAgain={flipAgain}
          />
        </div>

        {/* Center: Flip Arena */}
        <div className="flex-1 min-w-0">
          {/* Mobile/Tablet: Controls above game area */}
          <div className="lg:hidden mb-4">
            <FlipControls
              state={state}
              dispatch={dispatch}
              onFlip={flip}
              onCashOut={cashOut}
              onFlipAgain={flipAgain}
            />
          </div>

          <div className="max-w-[700px] mx-auto">
            <FlipArena
              state={state}
              onCashOut={cashOut}
              onFlipAgain={flipAgain}
            />
          </div>
        </div>

        {/* Sidebar — single responsive render */}
        <div className="w-full lg:w-[320px] shrink-0">
          <FlipSidebar
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
