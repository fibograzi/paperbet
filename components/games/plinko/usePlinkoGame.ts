"use client";

import { useReducer, useCallback, useRef, useEffect } from "react";
import type {
  PlinkoGameState,
  PlinkoAction,
  PlinkoSessionStats,
  PlinkoBetResult,
} from "./plinkoTypes";
import { generateBallPath, calculateProfit } from "./plinkoEngine";
import { generateId } from "@/lib/utils";

const initialStats: PlinkoSessionStats = {
  totalBets: 0,
  totalWagered: 0,
  totalReturns: 0,
  netProfit: 0,
  biggestWin: 0,
  biggestLoss: 0,
  currentStreak: 0,
  bestStreak: 0,
  averageMultiplier: 0,
  winRate: 0,
  totalWins: 0,
};

const initialState: PlinkoGameState = {
  balance: 1000,
  config: {
    rows: 12,
    risk: "medium",
    betAmount: 1.0,
  },
  stats: initialStats,
  history: [],
  isDropping: false,
  activeBalls: 0,
  autoPlay: {
    active: false,
    speed: "normal",
    totalCount: null,
    currentCount: 0,
    stopOnWinMultiplier: null,
    stopOnProfit: null,
    stopOnLoss: null,
    onWin: "reset",
    onLoss: "reset",
    increaseOnWinPercent: 0,
    increaseOnLossPercent: 0,
    baseBet: 1.0,
    startBalance: 1000,
  },
  sessionBetCount: 0,
  showSessionReminder: false,
  showPostSessionNudge: false,
  postSessionNudgeDismissed: false,
};

const SESSION_REMINDER_THRESHOLD = 100;

function plinkoReducer(
  state: PlinkoGameState,
  action: PlinkoAction
): PlinkoGameState {
  switch (action.type) {
    case "SET_BET_AMOUNT":
      return {
        ...state,
        config: { ...state.config, betAmount: action.amount },
      };

    case "SET_RISK":
      return {
        ...state,
        config: { ...state.config, risk: action.risk },
      };

    case "SET_ROWS":
      return {
        ...state,
        config: { ...state.config, rows: action.rows },
      };

    case "DROP_START":
      return {
        ...state,
        balance: state.balance - state.config.betAmount,
        isDropping: true,
      };

    case "DROP_COMPLETE": {
      const { result } = action;
      const newHistory = [result, ...state.history].slice(0, 50);
      const newSessionBetCount = state.sessionBetCount + 1;

      const totalBets = state.stats.totalBets + 1;
      const totalWagered = state.stats.totalWagered + result.amount;
      const payout = result.amount * result.multiplier;
      const totalReturns = state.stats.totalReturns + payout;
      const netProfit = totalReturns - totalWagered;
      const profit = result.profit;

      const isWin = profit > 0;
      const biggestWin = profit > 0
        ? Math.max(state.stats.biggestWin, profit)
        : state.stats.biggestWin;
      const biggestLoss = profit < 0
        ? Math.min(state.stats.biggestLoss, profit)
        : state.stats.biggestLoss;

      const currentStreak = isWin
        ? (state.stats.currentStreak > 0 ? state.stats.currentStreak + 1 : 1)
        : (state.stats.currentStreak < 0 ? state.stats.currentStreak - 1 : -1);
      const bestStreak = Math.max(state.stats.bestStreak, currentStreak);

      const totalMultipliers =
        state.stats.averageMultiplier * state.stats.totalBets + result.multiplier;
      const averageMultiplier = totalMultipliers / totalBets;

      const totalWins = state.stats.totalWins + (isWin ? 1 : 0);
      const winRate = (totalWins / totalBets) * 100;

      const showSessionReminder =
        !state.showSessionReminder &&
        newSessionBetCount >= SESSION_REMINDER_THRESHOLD;

      return {
        ...state,
        balance: state.balance + payout,
        history: newHistory,
        isDropping: state.activeBalls > 1,
        sessionBetCount: newSessionBetCount,
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
          currentStreak,
          bestStreak,
          averageMultiplier,
          winRate,
          totalWins,
        },
      };
    }

    case "BALL_ADDED":
      return {
        ...state,
        activeBalls: state.activeBalls + 1,
      };

    case "BALL_REMOVED":
      return {
        ...state,
        activeBalls: Math.max(0, state.activeBalls - 1),
        isDropping: state.activeBalls - 1 > 0,
      };

    case "AUTO_PLAY_START":
      return {
        ...state,
        autoPlay: {
          ...action.config,
          active: true,
          currentCount: 0,
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

    case "DISMISS_SESSION_REMINDER":
      return {
        ...state,
        showSessionReminder: false,
      };

    case "SHOW_POST_SESSION_NUDGE":
      if (state.postSessionNudgeDismissed) return state;
      return { ...state, showPostSessionNudge: true };

    case "DISMISS_POST_SESSION_NUDGE":
      return {
        ...state,
        showPostSessionNudge: false,
        postSessionNudgeDismissed: true,
      };

    default:
      return state;
  }
}

export function usePlinkoGame() {
  const [state, dispatch] = useReducer(plinkoReducer, initialState);
  const pendingDeductionRef = useRef(0);

  // Reset pending deductions only when all balls have landed
  useEffect(() => {
    if (state.activeBalls === 0) {
      pendingDeductionRef.current = 0;
    }
  }, [state.activeBalls]);

  const canDrop = useCallback((): boolean => {
    const effectiveBalance = state.balance - pendingDeductionRef.current;
    if (effectiveBalance < state.config.betAmount) return false;

    if (state.autoPlay.active) {
      return state.activeBalls < 3;
    }

    // Manual mode: allow up to 10 simultaneous balls (like Stake.com)
    return state.activeBalls < 10;
  }, [
    state.balance,
    state.config.betAmount,
    state.autoPlay.active,
    state.activeBalls,
  ]);

  const dropBall = useCallback((): PlinkoBetResult | null => {
    const effectiveBalance = state.balance - pendingDeductionRef.current;
    if (effectiveBalance < state.config.betAmount) return null;

    pendingDeductionRef.current += state.config.betAmount;
    dispatch({ type: "DROP_START" });

    const { rows, risk, betAmount } = state.config;
    const ballPath = generateBallPath(rows, risk);
    const profit = calculateProfit(betAmount, ballPath.multiplier);

    const result: PlinkoBetResult = {
      id: generateId(),
      amount: betAmount,
      multiplier: ballPath.multiplier,
      profit,
      timestamp: Date.now(),
      risk,
      rows,
      slotIndex: ballPath.slotIndex,
      path: ballPath.directions,
    };

    return result;
  }, [state.balance, state.config]);

  return { state, dispatch, dropBall, canDrop };
}
