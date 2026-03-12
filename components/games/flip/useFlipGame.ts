"use client";

import { useReducer, useCallback, useRef, useEffect } from "react";
import type {
  FlipGameState,
  FlipAction,
  FlipBetResult,
  FlipSessionStats,
  FlipAutoPlayConfig,
  CoinSide,
  FlipStreak,
} from "./flipTypes";
import {
  flipCoin,
  resolvePick,
  getMultiplier,
  calculatePayout,
  calculateProfit,
  FLIP_ANIMATION_DURATION,
  CASHOUT_ANIMATION_DURATION,
  LOSS_ANIMATION_DURATION,
  MAX_FLIPS,
} from "./flipEngine";
import { generateId } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_BALANCE = 1000;
const DEFAULT_BET = 1;
const MIN_BET = 0.1;
const MAX_BET = 1000;
const SESSION_REMINDER_THRESHOLD = 100;
const POST_SESSION_NUDGE_BETS = 10;
const POST_SESSION_NUDGE_IDLE_MS = 60_000;
const STREAK_NUDGE_MIN_FLIPS = 5;
const STREAK_NUDGE_MIN_BETS_BETWEEN = 10;
const MAX_HISTORY = 1000;

// ---------------------------------------------------------------------------
// Initial state helpers
// ---------------------------------------------------------------------------

function initialStats(): FlipSessionStats {
  return {
    totalBets: 0,
    totalWagered: 0,
    totalReturns: 0,
    netProfit: 0,
    biggestWin: 0,
    biggestLoss: 0,
    bestMultiplier: 0,
    averageCashout: 0,
    winRate: 0,
    totalWins: 0,
    cashoutCount: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    longestFlipChain: 0,
    headsPicks: 0,
    tailsPicks: 0,
  };
}

function initialState(): FlipGameState {
  return {
    phase: "idle",
    config: { betAmount: DEFAULT_BET, sidePick: "heads", instantBet: false },
    balance: INITIAL_BALANCE,
    speedMode: "normal",
    streak: null,
    pendingResult: null,
    pendingPick: null,
    lastResult: null,
    lastPick: null,
    history: [],
    stats: initialStats(),
    sessionBetCount: 0,
    showSessionReminder: false,
    showPostSessionNudge: false,
    postSessionNudgeDismissed: false,
    showStreakNudge: false,
    lastStreakNudgeBet: 0,
    autoPlay: {
      active: false,
      config: null,
      progress: null,
      startingNetProfit: 0,
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clampBet(amount: number): number {
  return Math.max(MIN_BET, Math.min(MAX_BET, Math.round(amount * 100) / 100));
}

function updateStats(
  stats: FlipSessionStats,
  result: FlipBetResult
): FlipSessionStats {
  const totalBets = stats.totalBets + 1;
  const totalWagered = stats.totalWagered + result.amount;
  const returns = result.cashedOut ? result.amount + result.profit : 0;
  const totalReturns = stats.totalReturns + returns;
  const netProfit = stats.netProfit + result.profit;

  const biggestWin =
    result.profit > 0
      ? Math.max(stats.biggestWin, result.profit)
      : stats.biggestWin;
  const biggestLoss =
    result.profit < 0
      ? Math.max(stats.biggestLoss, Math.abs(result.profit))
      : stats.biggestLoss;
  const bestMultiplier = result.cashedOut
    ? Math.max(stats.bestMultiplier, result.multiplier)
    : stats.bestMultiplier;

  const totalWins = stats.totalWins + (result.cashedOut ? 1 : 0);
  const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;
  const cashoutCount = stats.cashoutCount + (result.cashedOut ? 1 : 0);
  const averageCashout =
    cashoutCount > 0
      ? (stats.averageCashout * stats.cashoutCount +
          (result.cashedOut ? result.multiplier : 0)) /
        cashoutCount
      : 0;

  const currentWinStreak = result.cashedOut
    ? stats.currentWinStreak + 1
    : 0;
  const bestWinStreak = Math.max(stats.bestWinStreak, currentWinStreak);

  const longestFlipChain = Math.max(
    stats.longestFlipChain,
    result.flipsInChain
  );

  return {
    totalBets,
    totalWagered,
    totalReturns,
    netProfit,
    biggestWin,
    biggestLoss,
    bestMultiplier,
    averageCashout,
    winRate,
    totalWins,
    cashoutCount,
    currentWinStreak,
    bestWinStreak,
    longestFlipChain,
    headsPicks: stats.headsPicks + (result.pick === "heads" ? 1 : 0),
    tailsPicks: stats.tailsPicks + (result.pick === "tails" ? 1 : 0),
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function flipReducer(
  state: FlipGameState,
  action: FlipAction
): FlipGameState {
  switch (action.type) {
    // --- Configuration ---
    case "SET_BET_AMOUNT": {
      if (state.phase !== "idle") return state;
      return {
        ...state,
        config: { ...state.config, betAmount: clampBet(action.amount) },
      };
    }

    case "SET_SIDE_PICK": {
      if (state.phase === "flipping" || state.phase === "cashing_out")
        return state;
      return {
        ...state,
        config: { ...state.config, sidePick: action.pick },
      };
    }

    case "SET_INSTANT_BET": {
      return {
        ...state,
        config: { ...state.config, instantBet: action.enabled },
      };
    }

    // --- Start flip (idle/won → flipping) ---
    // Result is pre-determined and stored so the animation can show the correct face
    case "FLIP_START": {
      // Allow from idle (first flip) or won (flip again)
      if (state.phase !== "idle" && state.phase !== "won") return state;

      const isFirstFlip = state.phase === "idle";

      if (isFirstFlip && state.balance < state.config.betAmount) return state;

      return {
        ...state,
        phase: "flipping",
        balance: isFirstFlip
          ? state.balance - state.config.betAmount
          : state.balance,
        streak: isFirstFlip
          ? { flips: 0, currentMultiplier: 0, results: [], picks: [] }
          : state.streak,
        pendingResult: action.coinResult,
        pendingPick: action.resolvedPick,
        lastResult: null,
        lastPick: null,
        showStreakNudge: false,
      };
    }

    // --- Flip animation complete (flipping → won or lost) ---
    case "FLIP_RESULT": {
      if (state.phase !== "flipping") return state;
      if (!state.streak) return state;
      if (!state.pendingResult || !state.pendingPick) return state;

      const coinResult = state.pendingResult;
      const resolvedPick = state.pendingPick;
      const isWin = coinResult === resolvedPick;
      const newFlips = state.streak.flips + 1;
      const newResults = [...state.streak.results, coinResult];
      const newPicks = [...state.streak.picks, resolvedPick];

      if (isWin) {
        const newMultiplier = getMultiplier(newFlips);
        const newStreak: FlipStreak = {
          flips: newFlips,
          currentMultiplier: newMultiplier,
          results: newResults,
          picks: newPicks,
        };

        // Auto cash-out at max flips
        if (newFlips >= MAX_FLIPS) {
          const payout = calculatePayout(state.config.betAmount, newFlips);
          const profit = calculateProfit(state.config.betAmount, newFlips);
          const betResult: FlipBetResult = {
            id: generateId(),
            amount: state.config.betAmount,
            flipsInChain: newFlips,
            multiplier: newMultiplier,
            profit,
            pick: resolvedPick,
            result: coinResult,
            cashedOut: true,
            timestamp: Date.now(),
          };
          const newStats = updateStats(state.stats, betResult);
          const newHistory = [betResult, ...state.history].slice(0, MAX_HISTORY);
          const sessionBetCount = state.sessionBetCount + 1;

          return {
            ...state,
            phase: "cashing_out",
            balance: state.balance + payout,
            streak: newStreak,
            pendingResult: null,
            pendingPick: null,
            lastResult: coinResult,
            lastPick: resolvedPick,
            stats: newStats,
            history: newHistory,
            sessionBetCount,
            showSessionReminder:
              !state.showSessionReminder &&
              sessionBetCount >= SESSION_REMINDER_THRESHOLD,
          };
        }

        return {
          ...state,
          phase: "won",
          streak: newStreak,
          pendingResult: null,
          pendingPick: null,
          lastResult: coinResult,
          lastPick: resolvedPick,
        };
      }

      // Loss
      const lossStreak: FlipStreak = {
        flips: newFlips,
        currentMultiplier: 0,
        results: newResults,
        picks: newPicks,
      };

      const profit = -state.config.betAmount;
      const betResult: FlipBetResult = {
        id: generateId(),
        amount: state.config.betAmount,
        flipsInChain: newFlips,
        multiplier: 0,
        profit,
        pick: resolvedPick,
        result: coinResult,
        cashedOut: false,
        timestamp: Date.now(),
      };
      const newStats = updateStats(state.stats, betResult);
      const newHistory = [betResult, ...state.history].slice(0, MAX_HISTORY);
      const sessionBetCount = state.sessionBetCount + 1;

      return {
        ...state,
        phase: "lost",
        streak: lossStreak,
        pendingResult: null,
        pendingPick: null,
        lastResult: coinResult,
        lastPick: resolvedPick,
        stats: newStats,
        history: newHistory,
        sessionBetCount,
        showSessionReminder:
          !state.showSessionReminder &&
          sessionBetCount >= SESSION_REMINDER_THRESHOLD,
      };
    }

    // --- Flip again (won → flipping) ---
    case "FLIP_AGAIN": {
      if (state.phase !== "won") return state;
      if (!state.streak) return state;
      if (state.streak.flips >= MAX_FLIPS) return state;

      // Don't transition here — the flip() callback generates result and dispatches FLIP_AGAIN_START
      return state;
    }

    // --- Cash out (won → cashing_out) ---
    case "CASH_OUT": {
      if (state.phase !== "won") return state;
      if (!state.streak) return state;

      const flips = state.streak.flips;
      const payout = calculatePayout(state.config.betAmount, flips);
      const cashProfit = calculateProfit(state.config.betAmount, flips);

      const betResult: FlipBetResult = {
        id: generateId(),
        amount: state.config.betAmount,
        flipsInChain: flips,
        multiplier: state.streak.currentMultiplier,
        profit: cashProfit,
        pick: state.streak.picks[state.streak.picks.length - 1],
        result: state.streak.results[state.streak.results.length - 1],
        cashedOut: true,
        timestamp: Date.now(),
      };
      const newStats = updateStats(state.stats, betResult);
      const newHistory = [betResult, ...state.history].slice(0, MAX_HISTORY);
      const sessionBetCount = state.sessionBetCount + 1;

      // Check if streak nudge should show
      const shouldShowStreakNudge =
        flips >= STREAK_NUDGE_MIN_FLIPS &&
        sessionBetCount - state.lastStreakNudgeBet >=
          STREAK_NUDGE_MIN_BETS_BETWEEN;

      return {
        ...state,
        phase: "cashing_out",
        balance: state.balance + payout,
        stats: newStats,
        history: newHistory,
        sessionBetCount,
        showSessionReminder:
          !state.showSessionReminder &&
          sessionBetCount >= SESSION_REMINDER_THRESHOLD,
        showStreakNudge: shouldShowStreakNudge,
        lastStreakNudgeBet: shouldShowStreakNudge
          ? sessionBetCount
          : state.lastStreakNudgeBet,
      };
    }

    // --- Cash-out animation complete (cashing_out → idle) ---
    case "CASHOUT_COMPLETE": {
      if (state.phase !== "cashing_out") return state;

      return {
        ...state,
        phase: "idle",
        streak: null,
        pendingResult: null,
        pendingPick: null,
      };
    }

    // --- Loss animation complete (lost → idle) ---
    case "LOSS_COMPLETE": {
      if (state.phase !== "lost") return state;

      return {
        ...state,
        phase: "idle",
        streak: null,
        pendingResult: null,
        pendingPick: null,
        lastResult: null,
        lastPick: null,
      };
    }

    // --- Auto-play ---
    case "AUTO_PLAY_START": {
      if (state.phase !== "idle") return state;
      return {
        ...state,
        autoPlay: {
          active: true,
          config: action.config,
          progress: {
            currentRound: 0,
            totalRounds: action.config.totalCount,
            wins: 0,
            losses: 0,
          },
          startingNetProfit: state.stats.netProfit,
        },
      };
    }

    case "AUTO_PLAY_TICK": {
      if (!state.autoPlay.active || !state.autoPlay.progress) return state;

      const newCount = state.autoPlay.progress.currentRound + 1;
      const lastHistResult = state.history[0];
      const isWin = lastHistResult?.cashedOut ?? false;

      const progress = {
        ...state.autoPlay.progress,
        currentRound: newCount,
        wins: state.autoPlay.progress.wins + (isWin ? 1 : 0),
        losses: state.autoPlay.progress.losses + (isWin ? 0 : 1),
      };

      // Check count limit
      if (
        state.autoPlay.progress.totalRounds !== null &&
        newCount >= state.autoPlay.progress.totalRounds
      ) {
        return {
          ...state,
          autoPlay: { ...state.autoPlay, progress, active: false },
        };
      }

      // Check stop on profit
      if (state.autoPlay.config?.stopOnProfit != null) {
        const relativeProfit =
          state.stats.netProfit - state.autoPlay.startingNetProfit;
        if (relativeProfit >= state.autoPlay.config.stopOnProfit) {
          return {
            ...state,
            autoPlay: { ...state.autoPlay, progress, active: false },
          };
        }
      }

      // Check stop on loss
      if (state.autoPlay.config?.stopOnLoss != null) {
        const relativeProfit =
          state.stats.netProfit - state.autoPlay.startingNetProfit;
        if (relativeProfit <= -state.autoPlay.config.stopOnLoss) {
          return {
            ...state,
            autoPlay: { ...state.autoPlay, progress, active: false },
          };
        }
      }

      return {
        ...state,
        autoPlay: { ...state.autoPlay, progress },
      };
    }

    case "AUTO_PLAY_STOP": {
      return {
        ...state,
        autoPlay: { ...state.autoPlay, active: false },
      };
    }

    case "AUTO_PLAY_ADJUST_BET": {
      if (state.phase !== "idle") return state;
      const clamped = clampBet(action.amount);
      const safeBet = Math.min(clamped, state.balance);
      return {
        ...state,
        config: {
          ...state.config,
          betAmount: safeBet > 0 ? safeBet : MIN_BET,
        },
      };
    }

    // --- Session reminders ---
    case "DISMISS_SESSION_REMINDER":
      return { ...state, showSessionReminder: false };

    case "SHOW_POST_SESSION_NUDGE":
      if (state.postSessionNudgeDismissed) return state;
      return { ...state, showPostSessionNudge: true };

    case "DISMISS_POST_SESSION_NUDGE":
      return {
        ...state,
        showPostSessionNudge: false,
        postSessionNudgeDismissed: true,
      };

    case "DISMISS_STREAK_NUDGE":
      return { ...state, showStreakNudge: false };

    case "SET_SPEED_MODE":
      return { ...state, speedMode: action.mode };

    case "RESET_BALANCE":
      return {
        ...state,
        balance: INITIAL_BALANCE,
        speedMode: "normal",
        stats: initialStats(),
        history: [],
        sessionBetCount: 0,
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

export function useFlipGame() {
  const [state, dispatch] = useReducer(flipReducer, undefined, initialState);

  const stateRef = useRef(state);
  stateRef.current = state;
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoFlipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoPlayStartBetCountRef = useRef(0);

  // --- Helper: generate result and dispatch flip start ---
  const dispatchFlip = useCallback(() => {
    const s = stateRef.current;
    const coinResult = flipCoin();
    const resolvedPick = resolvePick(s.config.sidePick);
    dispatch({ type: "FLIP_START", coinResult, resolvedPick });
  }, []);

  // --- Manual actions ---

  const flip = useCallback(() => {
    dispatchFlip();
  }, [dispatchFlip]);

  const flipAgain = useCallback(() => {
    // Generate new result and go straight back to flipping
    const s = stateRef.current;
    if (s.phase !== "won" || !s.streak || s.streak.flips >= MAX_FLIPS) return;
    const coinResult = flipCoin();
    const resolvedPick = resolvePick(s.config.sidePick);
    // Transition directly: won → flipping with new pending result
    dispatch({ type: "FLIP_START", coinResult, resolvedPick });
  }, []);

  const cashOut = useCallback(() => {
    dispatch({ type: "CASH_OUT" });
  }, []);

  // --- Flip animation timer (flipping → resolve after animation) ---
  useEffect(() => {
    if (state.phase !== "flipping") return;

    const duration = state.speedMode === "instant" ? 100
      : state.speedMode === "quick" ? 400
      : FLIP_ANIMATION_DURATION; // 1200ms

    const timer = setTimeout(() => {
      dispatch({ type: "FLIP_RESULT" });
    }, duration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.pendingResult]);

  // --- Cashout animation handler ---
  useEffect(() => {
    if (state.phase !== "cashing_out") return;

    const duration = state.speedMode === "instant" ? 100
      : state.speedMode === "quick" ? 300
      : CASHOUT_ANIMATION_DURATION; // 800ms

    const timer = setTimeout(() => {
      dispatch({ type: "CASHOUT_COMPLETE" });
    }, duration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // --- Loss animation handler ---
  useEffect(() => {
    if (state.phase !== "lost") return;

    const duration = state.speedMode === "instant" ? 100
      : state.speedMode === "quick" ? 400
      : LOSS_ANIMATION_DURATION; // 1200ms

    const timer = setTimeout(() => {
      dispatch({ type: "LOSS_COMPLETE" });
    }, duration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // --- Streak nudge auto-dismiss (5 seconds) ---
  useEffect(() => {
    if (!state.showStreakNudge) return;

    const timer = setTimeout(() => {
      dispatch({ type: "DISMISS_STREAK_NUDGE" });
    }, 5000);

    return () => clearTimeout(timer);
  }, [state.showStreakNudge]);

  // --- Auto-play logic ---
  useEffect(() => {
    if (!state.autoPlay.active) {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      if (autoFlipTimerRef.current) clearTimeout(autoFlipTimerRef.current);
      return;
    }

    const config = state.autoPlay.config;
    if (!config) return;

    // IDLE → start a new round
    if (state.phase === "idle") {
      const s = stateRef.current;
      // Track the sessionBetCount when auto-play starts so the bet
      // adjustment effect can skip stale manual results
      if (s.autoPlay.progress?.currentRound === 0) {
        autoPlayStartBetCountRef.current = s.sessionBetCount;
      }
      if (s.balance < s.config.betAmount) {
        dispatch({ type: "AUTO_PLAY_STOP" });
        return;
      }
      const idleDelay = s.autoPlay.progress?.currentRound === 0 ? 0
        : s.speedMode === "instant" ? 50
        : s.speedMode === "quick" ? 200
        : 400;
      autoPlayTimerRef.current = setTimeout(() => {
        dispatchFlip();
      }, idleDelay);
      return;
    }

    // WON → decide to flip again or cash out
    if (state.phase === "won" && state.streak) {
      const currentFlips = state.streak.flips;
      const targetFlips = config.flipsPerRound;
      const s = stateRef.current;

      if (currentFlips >= targetFlips) {
        // Cash out
        const cashoutDelay = s.speedMode === "instant" ? 20
          : s.speedMode === "quick" ? 75
          : 150;
        autoFlipTimerRef.current = setTimeout(() => {
          dispatch({ type: "CASH_OUT" });
        }, cashoutDelay);
      } else {
        // Flip again
        const flipDelay = s.speedMode === "instant" ? 50
          : s.speedMode === "quick" ? 100
          : 200;
        autoFlipTimerRef.current = setTimeout(() => {
          const s2 = stateRef.current;
          const coinResult = flipCoin();
          const resolvedPick = resolvePick(s2.config.sidePick);
          dispatch({ type: "FLIP_START", coinResult, resolvedPick });
        }, flipDelay);
      }
      return;
    }

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      if (autoFlipTimerRef.current) clearTimeout(autoFlipTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.autoPlay.active, state.phase, state.streak?.flips]);

  // After round completes (idle), handle auto-play tick and bet adjustment
  useEffect(() => {
    if (!state.autoPlay.active || !state.autoPlay.config) return;
    if (state.phase !== "idle") return;
    // Skip if no auto-play rounds have completed yet (prevents processing
    // stale manual round results when auto-play first starts)
    if (state.sessionBetCount <= autoPlayStartBetCountRef.current) return;

    const lastResult = state.history[0];
    if (!lastResult) return;

    const config = state.autoPlay.config;
    const isWin = lastResult.cashedOut;
    const strategy = isWin ? config.onWin : config.onLoss;
    const percent = isWin
      ? config.increaseOnWinPercent
      : config.increaseOnLossPercent;

    let newBet = state.config.betAmount;
    if (strategy === "reset") {
      newBet = config.baseBet;
    } else if (strategy === "increase") {
      newBet = state.config.betAmount * (1 + percent / 100);
    }

    dispatch({ type: "AUTO_PLAY_ADJUST_BET", amount: newBet });
    dispatch({ type: "AUTO_PLAY_TICK" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.autoPlay.active, state.phase, state.sessionBetCount]);

  // --- Post-session nudge (60s inactivity after 10+ bets) ---
  useEffect(() => {
    if (state.postSessionNudgeDismissed) return;
    if (state.sessionBetCount < POST_SESSION_NUDGE_BETS) return;
    if (state.phase !== "idle") return;

    const timer = setTimeout(() => {
      dispatch({ type: "SHOW_POST_SESSION_NUDGE" });
    }, POST_SESSION_NUDGE_IDLE_MS);

    return () => clearTimeout(timer);
  }, [state.sessionBetCount, state.phase, state.postSessionNudgeDismissed]);

  // --- Beforeunload warning during active streak ---
  useEffect(() => {
    if (state.phase !== "won") return;
    if (!state.streak || state.streak.flips === 0) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state.phase, state.streak]);

  return {
    state,
    dispatch,
    flip,
    flipAgain,
    cashOut,
  };
}
