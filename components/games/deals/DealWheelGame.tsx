"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useDealWheel } from "./useDealWheel";
import DealWheel from "./DealWheel";
import DealWheelControls from "./DealWheelControls";
import DealWheelResult from "./DealWheelResult";
import DealWheelSidebar from "./DealWheelSidebar";
import { FREE_SPINS } from "./dealWheelEngine";

// ---------------------------------------------------------------------------
// Reduced-motion media query hook (same pattern as CrashChart)
// ---------------------------------------------------------------------------

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void): () => void {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

export default function DealWheelGame() {
  const { state, spin, submitEmail, dismissResult, canSpin, angleRef } = useDealWheel();
  const reducedMotion = usePrefersReducedMotion();

  // Keyboard shortcuts — Spacebar to spin, Escape to close result
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape" && state.phase === "revealing") {
        e.preventDefault();
        dismissResult();
        return;
      }

      if (e.code !== "Space") return;
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement
      ) {
        return;
      }
      e.preventDefault();
      spin();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [spin, state.phase, dismissResult]);

  const hasMoreSpins =
    state.stats.freeSpinsUsed < FREE_SPINS ||
    state.stats.emailSpinsRemaining > 0;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 py-6">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-center mb-6 text-pb-text-primary">
        Spin the Deal Wheel
        <span className="block text-base font-normal text-pb-text-secondary mt-2">
          Discover featured bonuses from top crypto casinos
        </span>
      </h1>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls (desktop only) */}
        <div className="hidden lg:block w-[300px] shrink-0">
          <DealWheelControls
            state={state}
            canSpin={canSpin}
            onSpin={spin}
            onSubmitEmail={submitEmail}
          />
        </div>

        {/* Center: Wheel */}
        <div className="flex-1 min-w-0">
          <DealWheel
            segments={state.segments}
            angleRef={angleRef}
            phase={state.phase}
            resultIndex={state.currentResult?.segmentIndex ?? null}
          />

          {/* Mobile: Controls below wheel */}
          <div className="lg:hidden mt-4">
            <DealWheelControls
              state={state}
              canSpin={canSpin}
              onSpin={spin}
              onSubmitEmail={submitEmail}
            />
          </div>
        </div>

        {/* Right: Sidebar (desktop) */}
        <div className="hidden lg:block w-[320px] shrink-0">
          <DealWheelSidebar state={state} />
        </div>
      </div>

      {/* Mobile: Sidebar below */}
      <div className="lg:hidden mt-6">
        <DealWheelSidebar state={state} />
      </div>

      {/* Result Modal */}
      <DealWheelResult
        result={state.currentResult}
        visible={state.phase === "revealing"}
        showConfetti={state.showConfetti}
        hasMoreSpins={hasMoreSpins}
        onDismiss={dismissResult}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
