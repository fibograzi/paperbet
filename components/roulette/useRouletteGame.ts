"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import type {
  RouletteGameState,
  RouletteAction,
  RouletteSessionStats,
  PlacedBet,
  RoundResult,
} from "@/lib/roulette/rouletteTypes";
import {
  INITIAL_BALANCE,
  MIN_BET,
  MAX_BET,
  CHIP_VALUES,
  SPIN_DURATION,
  MAX_HISTORY,
  POST_SESSION_NUDGE_THRESHOLD,
  generateSpin,
  evaluateAllBets,
} from "@/lib/roulette/rouletteEngine";
import { generateId } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

function createInitialStats(): RouletteSessionStats {
  return {
    totalSpins: 0,
    totalWagered: 0,
    totalReturns: 0,
    netProfit: 0,
    biggestWin: 0,
    biggestLoss: 0,
    winCount: 0,
    lossCount: 0,
    currentStreak: 0,
    bestWinStreak: 0,
    bestLossStreak: 0,
  };
}

function createInitialState(): RouletteGameState {
  return {
    phase: "idle",
    wheelType: "european",
    balance: INITIAL_BALANCE,
    selectedChipValue: CHIP_VALUES[2], // $1 default
    currentBets: [],
    previousBets: [],
    spinResult: null,
    betOutcomes: [],
    history: [],
    stats: createInitialStats(),
    sessionSpinCount: 0,
    showPostSessionNudge: false,
    postSessionNudgeDismissed: false,
  };
}

// ---------------------------------------------------------------------------
// Stats updater
// ---------------------------------------------------------------------------

function updateStats(
  prev: RouletteSessionStats,
  round: RoundResult,
): RouletteSessionStats {
  const stats = { ...prev };

  stats.totalSpins += 1;
  stats.totalWagered += round.totalWagered;
  stats.totalReturns += round.totalPayout;

  const isWin = round.totalProfit > 0;
  const isLoss = round.totalProfit < 0;

  if (isWin) {
    stats.winCount += 1;
    stats.currentStreak = stats.currentStreak > 0 ? stats.currentStreak + 1 : 1;
    if (stats.currentStreak > stats.bestWinStreak) {
      stats.bestWinStreak = stats.currentStreak;
    }
    if (round.totalProfit > stats.biggestWin) {
      stats.biggestWin = round.totalProfit;
    }
  } else if (isLoss) {
    stats.lossCount += 1;
    stats.currentStreak = stats.currentStreak < 0 ? stats.currentStreak - 1 : -1;
    const absStreak = Math.abs(stats.currentStreak);
    if (absStreak > stats.bestLossStreak) {
      stats.bestLossStreak = absStreak;
    }
    const lossAmt = Math.abs(round.totalProfit);
    if (lossAmt > stats.biggestLoss) {
      stats.biggestLoss = lossAmt;
    }
  }

  stats.netProfit = stats.totalReturns - stats.totalWagered;

  return stats;
}

// ---------------------------------------------------------------------------
// Bet merging helper — merge bets on the same position
// ---------------------------------------------------------------------------

function mergeBet(existing: PlacedBet[], incoming: Omit<PlacedBet, "id">): PlacedBet[] {
  // Two bets are on the same position if they have same type AND same numbers array
  const sameNumbers = (a: number[], b: number[]) =>
    a.length === b.length && [...a].sort().join(",") === [...b].sort().join(",");

  const idx = existing.findIndex(
    (b) => b.type === incoming.type && sameNumbers(b.numbers, incoming.numbers),
  );

  if (idx >= 0) {
    const updated = [...existing];
    updated[idx] = {
      ...updated[idx],
      amount: updated[idx].amount + incoming.amount,
    };
    return updated;
  }

  return [...existing, { ...incoming, id: generateId() }];
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function rouletteReducer(
  state: RouletteGameState,
  action: RouletteAction,
): RouletteGameState {
  switch (action.type) {
    // -----------------------------------------------------------------------
    // Wheel type
    // -----------------------------------------------------------------------
    case "SET_WHEEL_TYPE": {
      if (state.phase !== "idle") return state;
      return { ...state, wheelType: action.wheelType, currentBets: [], previousBets: [] };
    }

    // -----------------------------------------------------------------------
    // Chip value
    // -----------------------------------------------------------------------
    case "SET_CHIP_VALUE": {
      return { ...state, selectedChipValue: action.value };
    }

    // -----------------------------------------------------------------------
    // Place bet — deduct from balance, merge duplicate positions
    // -----------------------------------------------------------------------
    case "PLACE_BET": {
      if (state.phase !== "idle") return state;
      const amount = Math.min(action.bet.amount, MAX_BET);
      if (amount < MIN_BET) return state;
      if (state.balance < amount) return state;

      const newBets = mergeBet(state.currentBets, { ...action.bet, amount });
      const totalNewBetAmount = newBets.reduce((s, b) => s + b.amount, 0);
      // Recalculate balance from scratch: deduct only the delta
      const prevTotal = state.currentBets.reduce((s, b) => s + b.amount, 0);
      const delta = totalNewBetAmount - prevTotal;

      return {
        ...state,
        currentBets: newBets,
        balance: state.balance - delta,
      };
    }

    // -----------------------------------------------------------------------
    // Remove specific bet — refund to balance
    // -----------------------------------------------------------------------
    case "REMOVE_BET": {
      if (state.phase !== "idle") return state;
      const removed = state.currentBets.find((b) => b.id === action.betId);
      if (!removed) return state;
      return {
        ...state,
        currentBets: state.currentBets.filter((b) => b.id !== action.betId),
        balance: state.balance + removed.amount,
      };
    }

    // -----------------------------------------------------------------------
    // Undo last bet — removes most-recently-added bet
    // -----------------------------------------------------------------------
    case "UNDO_LAST_BET": {
      if (state.phase !== "idle") return state;
      if (state.currentBets.length === 0) return state;
      const last = state.currentBets[state.currentBets.length - 1];
      return {
        ...state,
        currentBets: state.currentBets.slice(0, -1),
        balance: state.balance + last.amount,
      };
    }

    // -----------------------------------------------------------------------
    // Clear all bets — full refund
    // -----------------------------------------------------------------------
    case "CLEAR_BETS": {
      if (state.phase !== "idle") return state;
      const totalRefund = state.currentBets.reduce((s, b) => s + b.amount, 0);
      return {
        ...state,
        currentBets: [],
        balance: state.balance + totalRefund,
      };
    }

    // -----------------------------------------------------------------------
    // Repeat last round's bets
    // -----------------------------------------------------------------------
    case "REPEAT_BETS": {
      if (state.phase !== "idle") return state;
      if (state.previousBets.length === 0) return state;

      const totalRefund = state.currentBets.reduce((s, b) => s + b.amount, 0);
      const totalCost = state.previousBets.reduce((s, b) => s + b.amount, 0);
      const availableBalance = state.balance + totalRefund;

      if (availableBalance < totalCost) return state;

      const newBets = state.previousBets.map((b) => ({ ...b, id: generateId() }));
      return {
        ...state,
        currentBets: newBets,
        balance: availableBalance - totalCost,
      };
    }

    // -----------------------------------------------------------------------
    // Double all current bets
    // -----------------------------------------------------------------------
    case "DOUBLE_BETS": {
      if (state.phase !== "idle") return state;
      if (state.currentBets.length === 0) return state;

      const currentTotal = state.currentBets.reduce((s, b) => s + b.amount, 0);
      if (state.balance < currentTotal) return state; // need same amount again

      const doubled = state.currentBets.map((b) => ({
        ...b,
        amount: Math.min(b.amount * 2, MAX_BET),
      }));

      const doubledTotal = doubled.reduce((s, b) => s + b.amount, 0);
      const delta = doubledTotal - currentTotal;

      return {
        ...state,
        currentBets: doubled,
        balance: state.balance - delta,
      };
    }

    // -----------------------------------------------------------------------
    // Spin — lock in bets, transition to spinning
    // -----------------------------------------------------------------------
    case "SPIN": {
      if (state.phase !== "idle") return state;
      if (state.currentBets.length === 0) return state;

      return {
        ...state,
        phase: "spinning",
        spinResult: null,
        betOutcomes: [],
      };
    }

    // -----------------------------------------------------------------------
    // Spin complete — evaluate outcomes, update balance and history
    // -----------------------------------------------------------------------
    case "SPIN_COMPLETE": {
      if (state.phase !== "spinning") return state;

      const totalWagered = state.currentBets.reduce((s, b) => s + b.amount, 0);
      const totalPayout = action.outcomes.reduce((s, o) => s + o.payout, 0);
      const totalProfit = totalPayout - totalWagered;

      const round: RoundResult = {
        id: generateId(),
        timestamp: Date.now(),
        spinResult: action.spinResult,
        bets: action.outcomes,
        totalWagered,
        totalPayout,
        totalProfit,
      };

      const newHistory = [round, ...state.history].slice(0, MAX_HISTORY);
      const newStats = updateStats(state.stats, round);
      const newBalance = state.balance + totalPayout;
      const newSessionSpinCount = state.sessionSpinCount + 1;

      return {
        ...state,
        phase: "result",
        spinResult: action.spinResult,
        betOutcomes: action.outcomes,
        balance: newBalance,
        history: newHistory,
        previousBets: [...state.currentBets],
        currentBets: [],
        stats: newStats,
        sessionSpinCount: newSessionSpinCount,
      };
    }

    // -----------------------------------------------------------------------
    // Dismiss result → back to idle
    // -----------------------------------------------------------------------
    case "RESULT_DISMISS": {
      if (state.phase !== "result") return state;
      return {
        ...state,
        phase: "idle",
      };
    }

    // -----------------------------------------------------------------------
    // Post-session nudge
    // -----------------------------------------------------------------------
    case "SHOW_POST_SESSION_NUDGE": {
      if (state.postSessionNudgeDismissed) return state;
      return { ...state, showPostSessionNudge: true };
    }

    case "DISMISS_POST_SESSION_NUDGE": {
      return {
        ...state,
        showPostSessionNudge: false,
        postSessionNudgeDismissed: true,
      };
    }

    // -----------------------------------------------------------------------
    // Reset balance
    // -----------------------------------------------------------------------
    case "RESET_BALANCE": {
      return {
        ...createInitialState(),
        wheelType: state.wheelType,
        selectedChipValue: state.selectedChipValue,
        // keep history and stats — just reset balance to $1,000
        history: state.history,
        stats: state.stats,
        sessionSpinCount: state.sessionSpinCount,
        // Bets are cleared (createInitialState sets currentBets: []),
        // balance resets to the standard starting amount
        balance: INITIAL_BALANCE,
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRouletteGame() {
  const [state, dispatch] = useReducer(rouletteReducer, undefined, createInitialState);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; });

  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Spin convenience function
  // ---------------------------------------------------------------------------

  const spin = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "idle") return;
    if (s.currentBets.length === 0) return;

    dispatch({ type: "SPIN" });

    const spinResult = generateSpin(s.wheelType);

    spinTimerRef.current = setTimeout(() => {
      const currentState = stateRef.current;
      const outcomes = evaluateAllBets(currentState.currentBets, spinResult);
      dispatch({ type: "SPIN_COMPLETE", spinResult, outcomes });
    }, SPIN_DURATION);
  }, []);

  // ---------------------------------------------------------------------------
  // Auto-dismiss result after 3 seconds
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (state.phase === "result") {
      resultDismissTimerRef.current = setTimeout(() => {
        dispatch({ type: "RESULT_DISMISS" });
      }, 3000);
    }

    return () => {
      if (resultDismissTimerRef.current) clearTimeout(resultDismissTimerRef.current);
    };
  }, [state.phase]);

  // ---------------------------------------------------------------------------
  // Post-session nudge
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (state.postSessionNudgeDismissed) return;
    if (state.sessionSpinCount < POST_SESSION_NUDGE_THRESHOLD) return;

    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);

    nudgeTimerRef.current = setTimeout(() => {
      dispatch({ type: "SHOW_POST_SESSION_NUDGE" });
    }, 60000);

    return () => {
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, [state.sessionSpinCount, state.postSessionNudgeDismissed]);

  // ---------------------------------------------------------------------------
  // Auto-dismiss post-session nudge
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!state.showPostSessionNudge) return;

    const timer = setTimeout(() => {
      dispatch({ type: "DISMISS_POST_SESSION_NUDGE" });
    }, 10000);

    return () => clearTimeout(timer);
  }, [state.showPostSessionNudge]);

  // ---------------------------------------------------------------------------
  // Cleanup on unmount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
      if (resultDismissTimerRef.current) clearTimeout(resultDismissTimerRef.current);
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, []);

  return { state, dispatch, spin };
}
