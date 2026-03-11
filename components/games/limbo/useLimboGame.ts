"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import type {
  LimboGameState,
  LimboAction,
  LimboRound,
  LimboSessionStats,
  LimboAutoPlayConfig,
  LimboAutoPlayProgress,
} from "./limboTypes";
import {
  INITIAL_BALANCE,
  DEFAULT_BET,
  DEFAULT_TARGET,
  MIN_BET,
  MAX_BET,
  MAX_HISTORY,
  MAX_PREVIOUS_RESULTS,
  SESSION_REMINDER_THRESHOLD,
  POST_SESSION_NUDGE_THRESHOLD,
  AUTO_PLAY_MAX_CONSECUTIVE,
  RESULT_SETTLE_DURATION,
  generateCrashPoint,
  isWin,
  calculatePayout,
  calculateWinChance,
  calculateTargetFromWinChance,
  clampBet,
  clampTarget,
  applyAutoBetAdjustments,
  getAutoPlayDelay,
  getAnimDuration,
} from "./limboEngine";
import { generateId } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

function createInitialState(): LimboGameState {
  return {
    phase: "idle",
    betAmount: DEFAULT_BET,
    targetMultiplier: DEFAULT_TARGET,
    winChance: calculateWinChance(DEFAULT_TARGET),
    animationSpeed: "normal",
    currentResult: null,
    currentIsWin: null,
    currentProfit: null,
    balance: INITIAL_BALANCE,
    history: [],
    previousResults: [],
    stats: createInitialStats(),
    sessionBetCount: 0,
    showSessionReminder: false,
    showPostSessionNudge: false,
    postSessionNudgeDismissed: false,
    autoPlay: {
      active: false,
      config: null,
      progress: null,
      startingNetProfit: 0,
    },
  };
}

function createInitialStats(): LimboSessionStats {
  return {
    totalBets: 0,
    totalWagered: 0,
    totalReturns: 0,
    netProfit: 0,
    bestWin: null,
    biggestLoss: 0,
    winCount: 0,
    lossCount: 0,
    currentStreak: 0,
    bestWinStreak: 0,
    bestLossStreak: 0,
    highestResult: 0,
    lowestResult: Infinity,
    resultSum: 0,
    targetSum: 0,
  };
}

// ---------------------------------------------------------------------------
// Stats updater
// ---------------------------------------------------------------------------

function updateStats(
  prev: LimboSessionStats,
  round: LimboRound,
): LimboSessionStats {
  const stats = { ...prev };

  stats.totalBets += 1;
  stats.totalWagered += round.betAmount;
  stats.resultSum += round.resultMultiplier;
  stats.targetSum += round.targetMultiplier;

  if (round.resultMultiplier > stats.highestResult) stats.highestResult = round.resultMultiplier;
  if (round.resultMultiplier < stats.lowestResult) stats.lowestResult = round.resultMultiplier;

  if (round.isWin) {
    const payout = calculatePayout(round.betAmount, round.targetMultiplier);
    stats.totalReturns += payout;
    stats.winCount += 1;
    stats.currentStreak = stats.currentStreak > 0 ? stats.currentStreak + 1 : 1;
    if (stats.currentStreak > stats.bestWinStreak) {
      stats.bestWinStreak = stats.currentStreak;
    }

    if (!stats.bestWin || round.profit > stats.bestWin.profit) {
      stats.bestWin = { multiplier: round.targetMultiplier, profit: round.profit };
    }
  } else {
    stats.lossCount += 1;
    stats.currentStreak = stats.currentStreak < 0 ? stats.currentStreak - 1 : -1;
    const absStreak = Math.abs(stats.currentStreak);
    if (absStreak > stats.bestLossStreak) {
      stats.bestLossStreak = absStreak;
    }
    if (round.betAmount > stats.biggestLoss) {
      stats.biggestLoss = round.betAmount;
    }
  }

  stats.netProfit = stats.totalReturns - stats.totalWagered;

  return stats;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function limboReducer(state: LimboGameState, action: LimboAction): LimboGameState {
  switch (action.type) {
    // -----------------------------------------------------------------------
    // Bet amount
    // -----------------------------------------------------------------------
    case "SET_BET_AMOUNT": {
      if (state.phase !== "idle" && !state.autoPlay.active) return state;
      const betAmount = clampBet(action.amount);
      return { ...state, betAmount };
    }

    // -----------------------------------------------------------------------
    // Animation speed
    // -----------------------------------------------------------------------
    case "SET_ANIMATION_SPEED": {
      return { ...state, animationSpeed: action.speed };
    }

    // -----------------------------------------------------------------------
    // Target multiplier (linked with win chance)
    // -----------------------------------------------------------------------
    case "SET_TARGET": {
      if (state.phase !== "idle") return state;
      const target = clampTarget(action.target);
      const winChance = calculateWinChance(target);
      return { ...state, targetMultiplier: target, winChance };
    }

    case "SET_WIN_CHANCE": {
      if (state.phase !== "idle") return state;
      const wc = Math.max(0.0099, Math.min(98.02, action.winChance));
      const target = calculateTargetFromWinChance(wc);
      return { ...state, targetMultiplier: target, winChance: calculateWinChance(target) };
    }

    // -----------------------------------------------------------------------
    // Bet (start round)
    // -----------------------------------------------------------------------
    case "BET": {
      if (state.phase !== "idle") return state;
      if (state.balance < state.betAmount) return state;
      return {
        ...state,
        phase: "animating",
        balance: state.balance - state.betAmount,
        currentResult: null,
        currentIsWin: null,
        currentProfit: null,
      };
    }

    // -----------------------------------------------------------------------
    // Bet complete (animation finished, reveal result)
    // -----------------------------------------------------------------------
    case "BET_COMPLETE": {
      if (state.phase !== "animating") return state;

      const round: LimboRound = {
        id: generateId(),
        betAmount: state.betAmount,
        targetMultiplier: state.targetMultiplier,
        resultMultiplier: action.result,
        winChance: state.winChance,
        isWin: action.isWin,
        profit: action.profit,
        timestamp: Date.now(),
      };

      // Update balance: if win, add payout
      let newBalance = state.balance;
      if (action.isWin) {
        newBalance += action.payout;
      }

      // History FIFO
      const newHistory = [round, ...state.history].slice(0, MAX_HISTORY);
      const newPreviousResults = [round, ...state.previousResults].slice(0, MAX_PREVIOUS_RESULTS);

      // Stats
      const newStats = updateStats(state.stats, round);

      // Session reminder
      const newSessionBetCount = state.sessionBetCount + 1;
      let showSessionReminder = state.showSessionReminder;
      if (
        newSessionBetCount === SESSION_REMINDER_THRESHOLD &&
        !state.showSessionReminder
      ) {
        showSessionReminder = true;
      }

      // Auto-play progress
      let autoPlay = state.autoPlay;
      if (autoPlay.active && autoPlay.progress) {
        const p = { ...autoPlay.progress };
        p.currentBet += 1;
        p.sessionProfit += action.profit;
        if (action.isWin) {
          p.wins += 1;
          p.currentWinStreak += 1;
          p.currentLossStreak = 0;
        } else {
          p.losses += 1;
          p.currentLossStreak += 1;
          p.currentWinStreak = 0;
        }
        autoPlay = { ...autoPlay, progress: p };
      }

      return {
        ...state,
        phase: "result",
        currentResult: action.result,
        currentIsWin: action.isWin,
        currentProfit: action.profit,
        balance: newBalance,
        history: newHistory,
        previousResults: newPreviousResults,
        stats: newStats,
        sessionBetCount: newSessionBetCount,
        showSessionReminder,
        autoPlay,
      };
    }

    // -----------------------------------------------------------------------
    // Result settle → back to idle
    // -----------------------------------------------------------------------
    case "RESULT_SETTLE": {
      if (state.phase !== "result") return state;
      return { ...state, phase: "idle" };
    }

    // -----------------------------------------------------------------------
    // Auto-play
    // -----------------------------------------------------------------------
    case "AUTO_PLAY_START": {
      if (state.phase !== "idle" || state.autoPlay.active) return state;
      return {
        ...state,
        autoPlay: {
          active: true,
          config: action.config,
          progress: {
            currentBet: 0,
            totalBets: action.config.numberOfBets,
            wins: 0,
            losses: 0,
            currentWinStreak: 0,
            currentLossStreak: 0,
            sessionProfit: 0,
            baseBetAmount: state.betAmount,
          },
          startingNetProfit: state.stats.netProfit,
        },
      };
    }

    case "AUTO_PLAY_STOP": {
      return {
        ...state,
        autoPlay: {
          ...state.autoPlay,
          active: false,
        },
      };
    }

    case "AUTO_PLAY_ADJUST": {
      return {
        ...state,
        betAmount: action.betAmount,
        targetMultiplier: action.targetMultiplier,
        winChance: action.winChance,
      };
    }

    // -----------------------------------------------------------------------
    // Session UI
    // -----------------------------------------------------------------------
    case "DISMISS_SESSION_REMINDER": {
      return { ...state, showSessionReminder: false };
    }

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

    case "RESET_BALANCE":
      return { ...state, balance: INITIAL_BALANCE, stats: { ...state.stats, netProfit: 0 } };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLimboGame() {
  const [state, dispatch] = useReducer(limboReducer, undefined, createInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Bet action
  // ---------------------------------------------------------------------------

  const bet = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "idle") return;
    if (s.balance < s.betAmount) return;

    dispatch({ type: "BET" });

    // Generate result
    const result = generateCrashPoint();
    const won = isWin(result, s.targetMultiplier);
    const payout = won ? calculatePayout(s.betAmount, s.targetMultiplier) : 0;
    const profit = won ? payout - s.betAmount : -s.betAmount;

    // Animation duration
    const duration = getAnimDuration(
      s.animationSpeed,
      s.autoPlay.active ? s.autoPlay.config?.speed : undefined,
    );

    if (duration === 0) {
      // Skip animation — instant result
      dispatch({ type: "BET_COMPLETE", result, isWin: won, profit, payout });
    } else {
      animTimerRef.current = setTimeout(() => {
        dispatch({ type: "BET_COMPLETE", result, isWin: won, profit, payout });
      }, duration);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Result settle effect
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (state.phase === "result") {
      settleTimerRef.current = setTimeout(() => {
        dispatch({ type: "RESULT_SETTLE" });
      }, RESULT_SETTLE_DURATION);
    }

    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, [state.phase]);

  // ---------------------------------------------------------------------------
  // Auto-play loop
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!state.autoPlay.active) return;
    if (state.phase !== "idle") return;

    const config = state.autoPlay.config;
    const progress = state.autoPlay.progress;
    if (!config || !progress) return;

    // First bet — immediate
    if (progress.currentBet === 0) {
      bet();
      return;
    }

    // Check stop conditions
    const shouldStop = checkAutoPlayStopConditions(state, config, progress);
    if (shouldStop) {
      dispatch({ type: "AUTO_PLAY_STOP" });
      return;
    }

    // Apply adjustments from previous round
    const lastRound = state.history[0];
    if (lastRound) {
      const { newBetAmount, newTarget } = applyAutoBetAdjustments(
        lastRound.isWin,
        state.betAmount,
        progress.baseBetAmount,
        state.targetMultiplier,
        config,
      );

      if (newBetAmount > state.balance || newBetAmount > MAX_BET) {
        dispatch({ type: "AUTO_PLAY_STOP" });
        return;
      }

      dispatch({
        type: "AUTO_PLAY_ADJUST",
        betAmount: newBetAmount,
        targetMultiplier: newTarget,
        winChance: calculateWinChance(newTarget),
      });
    }

    // Schedule next bet
    const delay = getAutoPlayDelay(config.speed);
    autoTimerRef.current = setTimeout(() => {
      bet();
    }, delay);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [state.autoPlay.active, state.phase, state.sessionBetCount, bet]);

  // ---------------------------------------------------------------------------
  // Post-session nudge timer
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (state.postSessionNudgeDismissed) return;
    if (state.sessionBetCount < POST_SESSION_NUDGE_THRESHOLD) return;
    if (state.autoPlay.active) return;

    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);

    nudgeTimerRef.current = setTimeout(() => {
      dispatch({ type: "SHOW_POST_SESSION_NUDGE" });
    }, 60000);

    return () => {
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, [state.sessionBetCount, state.postSessionNudgeDismissed, state.autoPlay.active]);

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
  // Cleanup
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Convenience actions
  // ---------------------------------------------------------------------------

  const startAutoPlay = useCallback((config: LimboAutoPlayConfig) => {
    dispatch({ type: "AUTO_PLAY_START", config });
  }, []);

  const stopAutoPlay = useCallback(() => {
    dispatch({ type: "AUTO_PLAY_STOP" });
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
  }, []);

  return {
    state,
    dispatch,
    bet,
    startAutoPlay,
    stopAutoPlay,
  };
}

// ---------------------------------------------------------------------------
// Stop condition checker
// ---------------------------------------------------------------------------

function checkAutoPlayStopConditions(
  state: LimboGameState,
  config: LimboAutoPlayConfig,
  progress: LimboAutoPlayProgress,
): boolean {
  // Bet count reached
  if (
    isFinite(config.numberOfBets) &&
    progress.currentBet >= config.numberOfBets
  ) {
    return true;
  }

  // Max consecutive
  if (progress.currentBet >= AUTO_PLAY_MAX_CONSECUTIVE) {
    return true;
  }

  // Bankroll depleted
  if (state.balance < state.betAmount) {
    return true;
  }

  // Stop on profit
  if (config.stopOnProfit !== null && progress.sessionProfit >= config.stopOnProfit) {
    return true;
  }

  // Stop on loss
  if (config.stopOnLoss !== null && progress.sessionProfit <= -config.stopOnLoss) {
    return true;
  }

  // Stop on win multiplier (result above threshold, only on wins)
  if (config.stopOnWinMultiplier !== null && state.currentResult !== null && state.currentIsWin) {
    if (state.currentResult >= config.stopOnWinMultiplier) {
      return true;
    }
  }

  return false;
}
