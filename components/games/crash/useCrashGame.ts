"use client";

import { useReducer, useCallback, useRef, useEffect } from "react";
import type {
  CrashGameState,
  CrashAction,
  CrashSessionStats,
  CrashBetResult,
  CrashAutoPlayState,
} from "./crashTypes";
import {
  generateCrashPoint,
  getMultiplierAtTime,
  calculateCrashProfit,
  COUNTDOWN_SECONDS,
  POST_CRASH_DELAY,
} from "./crashEngine";
import { generateId } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SESSION_REMINDER_THRESHOLD = 50;
const HISTORY_CAP = 1000;
const CRASH_POINTS_CAP = 20;

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialStats: CrashSessionStats = {
  totalBets: 0,
  totalWagered: 0,
  totalReturns: 0,
  netProfit: 0,
  biggestWin: 0,
  biggestLoss: 0,
  bestCashout: 0,
  averageCashout: 0,
  winRate: 0,
  totalWins: 0,
  cashoutCount: 0,
};

const initialAutoPlay: CrashAutoPlayState = {
  active: false,
  totalCount: null,
  currentCount: 0,
  cashoutAt: 2.0,
  onWin: "same",
  onLoss: "same",
  increaseOnWinPercent: 50,
  increaseOnLossPercent: 100,
  baseBet: 1.0,
  stopOnProfit: null,
  stopOnLoss: null,
  startingNetProfit: 0,
};

const initialState: CrashGameState = {
  balance: 1000,
  config: {
    betAmount: 1.0,
    autoCashout: 2.0,
  },
  phase: "betting",
  currentMultiplier: 1.0,
  crashPoint: null,
  countdown: COUNTDOWN_SECONDS,
  hasBet: false,
  betQueued: false,
  cashedOut: false,
  cashoutMultiplier: null,
  previousCrashPoints: [],
  history: [],
  stats: initialStats,
  sessionRoundCount: 0,
  showSessionReminder: false,
  showPostSessionNudge: false,
  postSessionNudgeDismissed: false,
  autoPlay: initialAutoPlay,
  instantMode: false,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function crashReducer(
  state: CrashGameState,
  action: CrashAction
): CrashGameState {
  switch (action.type) {
    // -- Config ----------------------------------------------------------------

    case "SET_BET_AMOUNT":
      return {
        ...state,
        config: { ...state.config, betAmount: action.amount },
      };

    case "SET_AUTO_CASHOUT":
      return {
        ...state,
        config: { ...state.config, autoCashout: action.value },
      };

    // -- Betting ---------------------------------------------------------------

    case "PLACE_BET": {
      if (state.hasBet || state.balance < state.config.betAmount) {
        return state;
      }
      return {
        ...state,
        balance: state.balance - state.config.betAmount,
        hasBet: true,
      };
    }

    case "CANCEL_BET": {
      if (!state.hasBet || state.phase !== "betting") {
        return state;
      }
      return {
        ...state,
        balance: state.balance + state.config.betAmount,
        hasBet: false,
      };
    }

    // -- Queue bet for next round (during running/crashed) --------------------

    case "QUEUE_BET": {
      if (
        state.betQueued ||
        state.phase === "betting" ||
        state.balance < state.config.betAmount
      ) {
        return state;
      }
      // Allow queuing if no active bet, or if current bet is already cashed out
      if (state.hasBet && !state.cashedOut) {
        return state;
      }
      return {
        ...state,
        balance: state.balance - state.config.betAmount,
        betQueued: true,
      };
    }

    case "CANCEL_QUEUE": {
      if (!state.betQueued) return state;
      return {
        ...state,
        balance: state.balance + state.config.betAmount,
        betQueued: false,
      };
    }

    // -- Instant mode toggle --------------------------------------------------

    case "TOGGLE_INSTANT_MODE":
      return {
        ...state,
        instantMode: !state.instantMode,
      };

    // -- Countdown / Round lifecycle -------------------------------------------

    case "START_COUNTDOWN": {
      const base = {
        ...state,
        phase: "betting" as const,
        countdown: COUNTDOWN_SECONDS,
        crashPoint: action.crashPoint,
        currentMultiplier: 1.0,
        cashedOut: false,
        cashoutMultiplier: null,
      };
      // Convert queued bet to active bet
      if (state.betQueued) {
        return { ...base, betQueued: false, hasBet: true };
      }
      return base;
    }

    case "COUNTDOWN_TICK":
      return {
        ...state,
        countdown: Math.max(0, state.countdown - 1),
      };

    case "START_ROUND":
      return {
        ...state,
        phase: "running",
        currentMultiplier: 1.0,
        countdown: 0,
      };

    case "UPDATE_MULTIPLIER":
      return {
        ...state,
        currentMultiplier: action.multiplier,
      };

    // -- Cash out / Crash ------------------------------------------------------

    case "CASH_OUT": {
      if (state.cashedOut || state.phase !== "running" || !state.hasBet) {
        return state;
      }
      const cashoutMultiplier = state.currentMultiplier;
      const winnings = state.config.betAmount * cashoutMultiplier;
      return {
        ...state,
        cashedOut: true,
        cashoutMultiplier,
        balance: state.balance + winnings,
      };
    }

    case "CRASH":
      return {
        ...state,
        phase: "crashed",
        currentMultiplier: state.crashPoint ?? state.currentMultiplier,
      };

    // -- Crash point tracking (always, regardless of bet) ----------------------

    case "ADD_CRASH_POINT":
      return {
        ...state,
        previousCrashPoints: [
          action.crashPoint,
          ...state.previousCrashPoints,
        ].slice(0, CRASH_POINTS_CAP),
      };

    // -- Round complete (only when player had a bet) ---------------------------

    case "ROUND_COMPLETE": {
      const { result } = action;

      const newHistory = [result, ...state.history].slice(0, HISTORY_CAP);
      const newSessionRoundCount = state.sessionRoundCount + 1;

      // Stats computation
      const totalBets = state.stats.totalBets + 1;
      const totalWagered = state.stats.totalWagered + result.amount;
      const payout = result.cashedOut && result.cashoutMultiplier !== null
        ? result.amount * result.cashoutMultiplier
        : 0;
      const totalReturns = state.stats.totalReturns + payout;
      const netProfit = totalReturns - totalWagered;

      const isWin = result.profit > 0;
      const biggestWin = result.profit > 0
        ? Math.max(state.stats.biggestWin, result.profit)
        : state.stats.biggestWin;
      const biggestLoss = result.profit < 0
        ? Math.min(state.stats.biggestLoss, result.profit)
        : state.stats.biggestLoss;

      const bestCashout =
        result.cashedOut && result.cashoutMultiplier !== null
          ? Math.max(state.stats.bestCashout, result.cashoutMultiplier)
          : state.stats.bestCashout;

      // Average cashout: tracked with explicit cashoutCount
      const cashoutCount =
        state.stats.cashoutCount + (result.cashedOut ? 1 : 0);
      const averageCashout =
        result.cashedOut && result.cashoutMultiplier !== null
          ? (state.stats.averageCashout * state.stats.cashoutCount +
              result.cashoutMultiplier) /
            cashoutCount
          : state.stats.averageCashout;

      const totalWins = state.stats.totalWins + (isWin ? 1 : 0);
      const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;

      const showSessionReminder =
        !state.showSessionReminder &&
        newSessionRoundCount >= SESSION_REMINDER_THRESHOLD;

      return {
        ...state,
        history: newHistory,
        sessionRoundCount: newSessionRoundCount,
        // Reset round state (currentMultiplier and crashPoint are NOT reset here
        // — they're needed for the crash display. START_COUNTDOWN resets them.)
        hasBet: false,
        cashedOut: false,
        cashoutMultiplier: null,
        // Session reminders
        showSessionReminder: showSessionReminder || state.showSessionReminder,
        showPostSessionNudge:
          state.showPostSessionNudge ||
          (showSessionReminder && !state.postSessionNudgeDismissed),
        stats: {
          totalBets,
          totalWagered,
          totalReturns,
          netProfit,
          biggestWin,
          biggestLoss,
          bestCashout,
          averageCashout,
          winRate,
          totalWins,
          cashoutCount,
        },
      };
    }

    // -- Auto-play -------------------------------------------------------------

    case "AUTO_PLAY_START":
      return {
        ...state,
        autoPlay: {
          ...action.config,
          active: true,
          currentCount: 0,
          startingNetProfit: state.stats.netProfit,
        },
      };

    case "AUTO_PLAY_TICK":
      return {
        ...state,
        autoPlay: {
          ...state.autoPlay,
          currentCount: state.autoPlay.currentCount + 1,
        },
      };

    case "AUTO_PLAY_STOP":
      return {
        ...state,
        autoPlay: {
          ...state.autoPlay,
          active: false,
          currentCount: 0,
        },
      };

    case "AUTO_PLAY_ADJUST_BET":
      return {
        ...state,
        config: { ...state.config, betAmount: action.amount },
      };

    // -- Session nudges --------------------------------------------------------

    case "DISMISS_SESSION_REMINDER":
      return {
        ...state,
        showSessionReminder: false,
      };

    case "DISMISS_POST_SESSION_NUDGE":
      return {
        ...state,
        showPostSessionNudge: false,
        postSessionNudgeDismissed: true,
      };

    case "RESET_BALANCE":
      return {
        ...state,
        balance: 1000,
        betQueued: false,
        stats: { ...initialStats },
        history: [],
        sessionRoundCount: 0,
        showSessionReminder: false,
        showPostSessionNudge: false,
        postSessionNudgeDismissed: false,
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCrashGame() {
  const [state, dispatch] = useReducer(crashReducer, initialState);

  // Refs for the animation loop to avoid stale closures
  const animationFrameRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const postCrashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoPlayBetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundStartTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(1);
  const stateRef = useRef(state);
  const gameActiveRef = useRef(false);

  // Keep stateRef in sync on every render
  stateRef.current = state;

  // ------------------------------------------------------------------
  // Cleanup helpers
  // ------------------------------------------------------------------

  const clearAllTimers = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (countdownIntervalRef.current !== null) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (postCrashTimeoutRef.current !== null) {
      clearTimeout(postCrashTimeoutRef.current);
      postCrashTimeoutRef.current = null;
    }
    if (autoPlayBetTimeoutRef.current !== null) {
      clearTimeout(autoPlayBetTimeoutRef.current);
      autoPlayBetTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount — reset gameActiveRef so the loop can restart
  // after Strict Mode's double-mount cycle
  useEffect(() => {
    return () => {
      gameActiveRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // ------------------------------------------------------------------
  // Stop animation loop
  // ------------------------------------------------------------------

  const stopAnimationLoop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // ------------------------------------------------------------------
  // Handle auto-play bet adjustment after a round
  // ------------------------------------------------------------------

  const handleAutoPlayPostRound = useCallback(
    (won: boolean) => {
      const ap = stateRef.current.autoPlay;
      if (!ap.active) return;

      const strategy = won ? ap.onWin : ap.onLoss;
      const increasePercent = won ? ap.increaseOnWinPercent : ap.increaseOnLossPercent;
      let newBet = stateRef.current.config.betAmount;

      switch (strategy) {
        case "reset":
          newBet = ap.baseBet;
          break;
        case "increase":
          newBet = stateRef.current.config.betAmount * (1 + increasePercent / 100);
          break;
        case "same":
        default:
          break;
      }

      // Round to 2 decimals, enforce min/max
      newBet = Math.round(newBet * 100) / 100;
      newBet = Math.max(0.1, Math.min(1000, newBet));

      if (newBet !== stateRef.current.config.betAmount) {
        dispatch({ type: "AUTO_PLAY_ADJUST_BET", amount: newBet });
      }
    },
    [dispatch]
  );

  // ------------------------------------------------------------------
  // Check if auto-play should stop
  // ------------------------------------------------------------------

  const shouldAutoPlayStop = useCallback((): boolean => {
    const ap = stateRef.current.autoPlay;
    if (!ap.active) return true;

    // Reached total count
    if (ap.totalCount !== null && ap.currentCount >= ap.totalCount) {
      return true;
    }

    // Stop on profit (relative to when auto-play started)
    const profitSinceStart = stateRef.current.stats.netProfit - ap.startingNetProfit;
    if (ap.stopOnProfit !== null && profitSinceStart >= ap.stopOnProfit) {
      return true;
    }

    // Stop on loss (relative to when auto-play started)
    if (ap.stopOnLoss !== null && profitSinceStart <= -Math.abs(ap.stopOnLoss)) {
      return true;
    }

    // Insufficient balance
    if (stateRef.current.balance < stateRef.current.config.betAmount) {
      return true;
    }

    return false;
  }, []);

  // ------------------------------------------------------------------
  // Fast-forward round when tab is hidden (skip rAF animation)
  // ------------------------------------------------------------------

  const fastForwardCrash = useCallback(
    (hasBet: boolean) => {
      stopAnimationLoop();

      const s = stateRef.current;
      const crashPoint = crashPointRef.current;

      let didCashOut = s.cashedOut;
      let cashoutMult = s.cashoutMultiplier;

      if (hasBet && !didCashOut) {
        const autoCashoutTarget = s.autoPlay.active
          ? s.autoPlay.cashoutAt
          : s.config.autoCashout;

        if (autoCashoutTarget !== null && autoCashoutTarget <= crashPoint) {
          dispatch({ type: "UPDATE_MULTIPLIER", multiplier: autoCashoutTarget });
          dispatch({ type: "CASH_OUT" });
          didCashOut = true;
          cashoutMult = autoCashoutTarget;
        }
      }

      dispatch({ type: "CRASH" });
      dispatch({ type: "ADD_CRASH_POINT", crashPoint });

      if (hasBet) {
        const betAmount = s.config.betAmount;
        const profit = calculateCrashProfit(betAmount, didCashOut, cashoutMult);

        const result: CrashBetResult = {
          id: generateId(),
          amount: betAmount,
          multiplier:
            didCashOut && cashoutMult !== null ? cashoutMult : crashPoint,
          profit,
          timestamp: Date.now(),
          crashPoint,
          cashedOut: didCashOut,
          cashoutMultiplier: cashoutMult,
        };

        dispatch({ type: "ROUND_COMPLETE", result });
        handleAutoPlayPostRound(didCashOut);
      }

      const delay = stateRef.current.instantMode ? 750 : POST_CRASH_DELAY;
      postCrashTimeoutRef.current = setTimeout(() => {
        postCrashTimeoutRef.current = null;
        if (!gameActiveRef.current) return;
        if (stateRef.current.autoPlay.active && shouldAutoPlayStop()) {
          dispatch({ type: "AUTO_PLAY_STOP" });
        }
        startNewRoundRef.current();
      }, delay);
    },
    [stopAnimationLoop, dispatch, handleAutoPlayPostRound, shouldAutoPlayStop]
  );

  // Handle background tabs — fast-forward running rounds when hidden
  useEffect(() => {
    const handler = () => {
      if (
        document.hidden &&
        gameActiveRef.current &&
        stateRef.current.phase === "running"
      ) {
        fastForwardCrash(stateRef.current.hasBet);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [fastForwardCrash]);

  // ------------------------------------------------------------------
  // Start a new round (forward-declared via ref for recursion)
  // ------------------------------------------------------------------

  const startNewRoundRef = useRef<() => void>(() => {});

  const startNewRound = useCallback(() => {
    // Don't start if the game was stopped (unmount / cleanup)
    if (!gameActiveRef.current) return;

    const cp = generateCrashPoint();
    crashPointRef.current = cp;

    // Check if a bet is queued (before START_COUNTDOWN converts it)
    const hadQueuedBet = stateRef.current.betQueued;

    dispatch({ type: "START_COUNTDOWN", crashPoint: cp });

    const isInstant = stateRef.current.instantMode;

    // ----------------------------------------------------------------
    // INSTANT MODE: skip countdown & animation, resolve immediately
    // ----------------------------------------------------------------
    if (isInstant) {
      let hasBetForRound = hadQueuedBet;

      // Auto-play: place bet immediately (no timeout)
      if (
        !hasBetForRound &&
        stateRef.current.autoPlay.active &&
        !shouldAutoPlayStop()
      ) {
        if (stateRef.current.balance >= stateRef.current.config.betAmount) {
          dispatch({ type: "PLACE_BET" });
          dispatch({ type: "AUTO_PLAY_TICK" });
          hasBetForRound = true;
        }
      }

      dispatch({ type: "START_ROUND" });
      fastForwardCrash(hasBetForRound);
      return;
    }

    // ----------------------------------------------------------------
    // NORMAL MODE: countdown → animation
    // ----------------------------------------------------------------

    // Auto-play: automatically place bet during countdown
    if (stateRef.current.autoPlay.active && !shouldAutoPlayStop()) {
      // Small delay to ensure START_COUNTDOWN has been processed
      autoPlayBetTimeoutRef.current = setTimeout(() => {
        autoPlayBetTimeoutRef.current = null;
        if (
          !gameActiveRef.current ||
          !stateRef.current.autoPlay.active
        ) return;

        if (
          !stateRef.current.hasBet &&
          stateRef.current.balance >= stateRef.current.config.betAmount
        ) {
          dispatch({ type: "PLACE_BET" });
          dispatch({ type: "AUTO_PLAY_TICK" });
        }
      }, 50);
    }

    // Countdown interval: tick once per second
    let ticksRemaining = COUNTDOWN_SECONDS;

    countdownIntervalRef.current = setInterval(() => {
      if (!gameActiveRef.current) {
        if (countdownIntervalRef.current !== null) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        return;
      }

      ticksRemaining--;
      dispatch({ type: "COUNTDOWN_TICK" });

      if (ticksRemaining <= 0) {
        if (countdownIntervalRef.current !== null) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }

        // Start the running phase
        dispatch({ type: "START_ROUND" });

        // If tab is hidden, skip animation and resolve instantly
        if (document.hidden) {
          // Cancel deferred auto-play bet timeout and place bet directly
          const betNotYetPlaced = autoPlayBetTimeoutRef.current !== null;
          if (autoPlayBetTimeoutRef.current !== null) {
            clearTimeout(autoPlayBetTimeoutRef.current);
            autoPlayBetTimeoutRef.current = null;
          }
          let hasBet = stateRef.current.hasBet;
          if (
            betNotYetPlaced &&
            stateRef.current.autoPlay.active &&
            !shouldAutoPlayStop() &&
            stateRef.current.balance >= stateRef.current.config.betAmount
          ) {
            dispatch({ type: "PLACE_BET" });
            dispatch({ type: "AUTO_PLAY_TICK" });
            hasBet = true;
          }
          fastForwardCrash(hasBet);
          return;
        }

        roundStartTimeRef.current = performance.now();

        // Begin animation loop
        const tick = (now: number) => {
          if (!gameActiveRef.current) return;

          const elapsed = (now - roundStartTimeRef.current) / 1000;
          const multiplier = getMultiplierAtTime(elapsed);

          dispatch({ type: "UPDATE_MULTIPLIER", multiplier });

          // Track cashout locally to handle same-frame race condition
          // (stateRef won't reflect dispatches until next render)
          const s = stateRef.current;
          let didCashOut = s.cashedOut;
          let cashoutMult = s.cashoutMultiplier;

          // Check auto-cashout (before crash check to handle same-frame)
          if (s.hasBet && !didCashOut) {
            const autoCashoutTarget = s.autoPlay.active
              ? s.autoPlay.cashoutAt
              : s.config.autoCashout;

            if (autoCashoutTarget !== null && multiplier >= autoCashoutTarget) {
              dispatch({ type: "CASH_OUT" });
              didCashOut = true;
              cashoutMult = multiplier;
            }
          }

          // Check if crash point reached
          if (multiplier >= crashPointRef.current) {
            stopAnimationLoop();
            dispatch({ type: "CRASH" });

            // Always track crash point for previous rounds display
            dispatch({ type: "ADD_CRASH_POINT", crashPoint: crashPointRef.current });

            // Build result using local tracking (not stateRef which is stale)
            if (s.hasBet) {
              const betAmount = s.config.betAmount;
              const profit = calculateCrashProfit(betAmount, didCashOut, cashoutMult);

              const result: CrashBetResult = {
                id: generateId(),
                amount: betAmount,
                multiplier: didCashOut && cashoutMult !== null
                  ? cashoutMult
                  : crashPointRef.current,
                profit,
                timestamp: Date.now(),
                crashPoint: crashPointRef.current,
                cashedOut: didCashOut,
                cashoutMultiplier: cashoutMult,
              };

              dispatch({ type: "ROUND_COMPLETE", result });
              handleAutoPlayPostRound(didCashOut);
            }

            // After crash delay, start next round
            const crashDelay = stateRef.current.instantMode ? 750 : POST_CRASH_DELAY;
            postCrashTimeoutRef.current = setTimeout(() => {
              postCrashTimeoutRef.current = null;

              if (!gameActiveRef.current) return;

              // Check if auto-play should stop
              if (stateRef.current.autoPlay.active && shouldAutoPlayStop()) {
                dispatch({ type: "AUTO_PLAY_STOP" });
              }

              startNewRoundRef.current();
            }, crashDelay);

            return;
          }

          animationFrameRef.current = requestAnimationFrame(tick);
        };

        animationFrameRef.current = requestAnimationFrame(tick);
      }
    }, 1000);
  }, [dispatch, stopAnimationLoop, handleAutoPlayPostRound, shouldAutoPlayStop, fastForwardCrash]);

  // Keep the ref in sync so the recursive setTimeout always calls the latest version
  startNewRoundRef.current = startNewRound;

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  const placeBet = useCallback(() => {
    const s = stateRef.current;
    if (s.hasBet || s.balance < s.config.betAmount) return;
    dispatch({ type: "PLACE_BET" });
  }, [dispatch]);

  const cancelBet = useCallback(() => {
    const s = stateRef.current;
    if (!s.hasBet || s.phase !== "betting") return;
    dispatch({ type: "CANCEL_BET" });
  }, [dispatch]);

  const queueBet = useCallback(() => {
    const s = stateRef.current;
    if (
      s.betQueued ||
      s.phase === "betting" ||
      s.autoPlay.active ||
      s.balance < s.config.betAmount
    ) return;
    // Block if bet is still active (not yet cashed out)
    if (s.hasBet && !s.cashedOut) return;
    dispatch({ type: "QUEUE_BET" });
  }, [dispatch]);

  const cancelQueue = useCallback(() => {
    const s = stateRef.current;
    if (!s.betQueued) return;
    dispatch({ type: "CANCEL_QUEUE" });
  }, [dispatch]);

  const cashOut = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "running" || !s.hasBet || s.cashedOut) return;
    dispatch({ type: "CASH_OUT" });
  }, [dispatch]);

  const startGame = useCallback(() => {
    if (gameActiveRef.current) return;
    gameActiveRef.current = true;
    startNewRound();
  }, [startNewRound]);

  return { state, dispatch, placeBet, cancelBet, queueBet, cancelQueue, cashOut, startGame };
}
