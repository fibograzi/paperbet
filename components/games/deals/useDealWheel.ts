"use client";

import { useReducer, useCallback, useRef, useEffect } from "react";
import type {
  DealWheelState,
  DealWheelAction,
  SpinResult,
} from "./dealWheelTypes";
import {
  buildSegments,
  selectPrizeSegment,
  calculateSpinTarget,
  getAngleAtTime,
  resolveMysteryBonus,
  saveWheelSession,
  loadWheelSession,
  FREE_SPINS,
  EMAIL_SPINS,
  REVEAL_DELAY,
  CONFETTI_DURATION,
} from "./dealWheelEngine";
import { generateId } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const segments = buildSegments();

const initialState: DealWheelState = {
  phase: "idle",
  segments,
  currentAngle: 0,
  targetAngle: 0,
  spinStartTime: null,
  spinDuration: 0,
  currentResult: null,
  email: { email: null, captured: false, showForm: false },
  stats: {
    totalSpins: 0,
    freeSpinsUsed: 0,
    emailSpinsRemaining: 0,
    prizesWon: [],
  },
  showConfetti: false,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function dealWheelReducer(
  state: DealWheelState,
  action: DealWheelAction
): DealWheelState {
  switch (action.type) {
    case "INIT_SESSION": {
      const restoredSpins = action.spins;
      // Respins don't count toward spin usage
      const paidSpins = restoredSpins.filter(
        (s) => s.segment.tier !== "respin"
      ).length;
      const freeSpinsUsed = Math.min(paidSpins, FREE_SPINS);
      const emailSpinsUsed = Math.max(0, paidSpins - FREE_SPINS);
      const hasEmail = action.email !== null;

      return {
        ...state,
        email: {
          email: action.email,
          captured: hasEmail,
          showForm: false,
        },
        stats: {
          totalSpins: restoredSpins.length,
          freeSpinsUsed,
          emailSpinsRemaining: hasEmail
            ? Math.max(0, EMAIL_SPINS - emailSpinsUsed)
            : 0,
          prizesWon: restoredSpins,
        },
      };
    }

    case "START_SPIN": {
      return {
        ...state,
        phase: "spinning",
        targetAngle: action.targetAngle,
        spinDuration: action.duration,
        spinStartTime: performance.now(),
        currentResult: null,
      };
    }

    case "SPIN_COMPLETE": {
      const { result } = action;
      const newPrizes = [...state.stats.prizesWon, result];
      const tier = result.segment.tier;
      const isRespin = tier === "respin";

      // Respins don't consume a spin
      let freeSpinsUsed = state.stats.freeSpinsUsed;
      let emailSpinsRemaining = state.stats.emailSpinsRemaining;

      if (!isRespin) {
        if (freeSpinsUsed < FREE_SPINS) {
          freeSpinsUsed++;
        } else {
          emailSpinsRemaining = Math.max(0, emailSpinsRemaining - 1);
        }
      }

      return {
        ...state,
        phase: "revealing",
        currentAngle: action.finalAngle,
        currentResult: result,
        showConfetti:
          tier === "rare" || tier === "jackpot" ? true : state.showConfetti,
        stats: {
          ...state.stats,
          totalSpins: state.stats.totalSpins + 1,
          freeSpinsUsed,
          emailSpinsRemaining,
          prizesWon: newPrizes,
        },
      };
    }

    case "SHOW_EMAIL_FORM":
      return {
        ...state,
        email: { ...state.email, showForm: true },
      };

    case "SUBMIT_EMAIL":
      return {
        ...state,
        email: {
          email: action.email,
          captured: true,
          showForm: false,
        },
        stats: {
          ...state.stats,
          emailSpinsRemaining: EMAIL_SPINS,
        },
      };

    case "DISMISS_RESULT":
      return {
        ...state,
        phase: "idle",
        currentResult: null,
        showConfetti: false,
      };

    case "TRIGGER_CONFETTI":
      return { ...state, showConfetti: true };

    case "CLEAR_CONFETTI":
      return { ...state, showConfetti: false };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const MAX_RESPINS = 3;

export function useDealWheel() {
  const [state, dispatch] = useReducer(dealWheelReducer, initialState);

  // Refs to avoid stale closures in rAF
  const rafRef = useRef<number | null>(null);
  const currentAngleRef = useRef(0);
  const stateRef = useRef(state);
  const confettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSpinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const consecutiveRespinRef = useRef(0);

  // Keep refs in sync
  stateRef.current = state;

  // -----------------------------------------------------------------------
  // Load session from localStorage on mount
  // -----------------------------------------------------------------------

  useEffect(() => {
    const session = loadWheelSession();
    if (session) {
      dispatch({
        type: "INIT_SESSION",
        email: session.email,
        spins: session.spins,
      });
    }
  }, []);

  // -----------------------------------------------------------------------
  // Cleanup on unmount
  // -----------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (confettiTimeoutRef.current !== null)
        clearTimeout(confettiTimeoutRef.current);
      if (autoSpinTimeoutRef.current !== null)
        clearTimeout(autoSpinTimeoutRef.current);
      if (revealTimeoutRef.current !== null)
        clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  // -----------------------------------------------------------------------
  // Derived: canSpin
  // -----------------------------------------------------------------------

  const { phase, stats } = state;
  const canSpin =
    phase === "idle" &&
    (stats.freeSpinsUsed < FREE_SPINS || stats.emailSpinsRemaining > 0);

  // -----------------------------------------------------------------------
  // Spin
  // -----------------------------------------------------------------------

  const spin = useCallback(() => {
    const s = stateRef.current;
    const canSpinNow =
      s.phase === "idle" &&
      (s.stats.freeSpinsUsed < FREE_SPINS ||
        s.stats.emailSpinsRemaining > 0);

    if (!canSpinNow) return;

    const segmentIndex = selectPrizeSegment(s.segments);
    const { targetAngle, duration } = calculateSpinTarget(
      segmentIndex,
      s.segments.length,
      currentAngleRef.current
    );

    dispatch({
      type: "START_SPIN",
      targetAngle,
      duration,
      segmentIndex,
    });

    const startTime = performance.now();
    const startAngle = currentAngleRef.current;

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const angle = getAngleAtTime(startAngle, targetAngle, elapsed, duration);
      currentAngleRef.current = angle;

      if (elapsed >= duration) {
        // Spin done — reveal after delay
        revealTimeoutRef.current = setTimeout(() => {
          revealTimeoutRef.current = null;
          const segment = stateRef.current.segments[segmentIndex];
          const result: SpinResult = {
            id: generateId(),
            segmentIndex,
            segment,
            timestamp: Date.now(),
          };

          // Resolve mystery bonus
          if (segment.id === "seg-mystery") {
            const wonCasinoIds = stateRef.current.stats.prizesWon
              .filter((p) => p.segment.casinoId !== null)
              .map((p) => p.segment.casinoId!);
            result.resolvedCasino = resolveMysteryBonus(wonCasinoIds);
          }

          dispatch({ type: "SPIN_COMPLETE", result, finalAngle: targetAngle });

          // Save to localStorage — SPIN_COMPLETE already adds result to prizesWon,
          // so we read the updated state directly (stateRef syncs on render).
          // Use a microtask to ensure React has processed the dispatch.
          queueMicrotask(() => {
            const updatedState = stateRef.current;
            saveWheelSession(updatedState.email.email, updatedState.stats.prizesWon);
          });

          // Auto-clear confetti
          if (
            segment.tier === "rare" ||
            segment.tier === "jackpot"
          ) {
            confettiTimeoutRef.current = setTimeout(() => {
              confettiTimeoutRef.current = null;
              dispatch({ type: "CLEAR_CONFETTI" });
            }, CONFETTI_DURATION);
          }
        }, REVEAL_DELAY);

        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // -----------------------------------------------------------------------
  // Submit email
  // -----------------------------------------------------------------------

  const submitEmail = useCallback((email: string) => {
    dispatch({ type: "SUBMIT_EMAIL", email });
    // Save to localStorage with email
    const s = stateRef.current;
    saveWheelSession(email, s.stats.prizesWon);
  }, []);

  // -----------------------------------------------------------------------
  // Dismiss result
  // -----------------------------------------------------------------------

  const dismissResult = useCallback(() => {
    const result = stateRef.current.currentResult;
    dispatch({ type: "DISMISS_RESULT" });

    // If respin segment won, auto-trigger next spin (up to MAX_RESPINS)
    if (result?.segment.tier === "respin") {
      if (consecutiveRespinRef.current < MAX_RESPINS) {
        consecutiveRespinRef.current++;
        autoSpinTimeoutRef.current = setTimeout(() => {
          autoSpinTimeoutRef.current = null;
          spin();
        }, 800);
      } else {
        consecutiveRespinRef.current = 0;
      }
      return;
    }

    // Not a respin — reset the counter
    consecutiveRespinRef.current = 0;
  }, [spin]);

  return {
    state,
    dispatch,
    spin,
    submitEmail,
    dismissResult,
    canSpin,
    angleRef: currentAngleRef,
  };
}
