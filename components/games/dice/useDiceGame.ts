"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import type {
  DiceGameState,
  DiceAction,
  DicePhase,
  DiceParameters,
  DiceRound,
  DiceSessionStats,
  DiceAutoPlayConfig,
  DiceAutoPlayProgress,
  DiceAnimationSpeed,
  DiceDirection,
} from "./diceTypes";
import {
  INITIAL_BALANCE,
  DEFAULT_BET,
  MIN_BET,
  MAX_BET,
  MAX_HISTORY,
  MAX_PREVIOUS_RESULTS,
  SESSION_REMINDER_THRESHOLD,
  POST_SESSION_NUDGE_THRESHOLD,
  AUTO_PLAY_MAX_CONSECUTIVE,
  ROLL_DURATION_NORMAL,
  ROLL_DURATION_FAST,
  RESULT_SETTLE_DURATION,
  generateDiceResult,
  isWin,
  calculatePayout,
  calculateProfitOnWin,
  clampBet,
  syncParameters,
  applyAutoBetAdjustments,
  getAutoPlayDelay,
  getDefaultParameters,
  getSwapTarget,
} from "./diceEngine";
import { generateId } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

function createInitialState(): DiceGameState {
  return {
    phase: "idle",
    params: getDefaultParameters(DEFAULT_BET),
    betAmount: DEFAULT_BET,
    animationSpeed: "normal",
    currentResult: null,
    currentIsWin: null,
    currentProfit: null,
    balance: INITIAL_BALANCE,
    history: [],
    previousResults: [],
    stats: createInitialStats(),
    sessionRollCount: 0,
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

function createInitialStats(): DiceSessionStats {
  return {
    totalRolls: 0,
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
    highestRoll: 0,
    lowestRoll: 99.99,
    rollSum: 0,
    multiplierSum: 0,
  };
}

// ---------------------------------------------------------------------------
// Stats updater
// ---------------------------------------------------------------------------

function updateStats(
  prev: DiceSessionStats,
  round: DiceRound,
): DiceSessionStats {
  const stats = { ...prev };

  stats.totalRolls += 1;
  stats.totalWagered += round.betAmount;
  stats.multiplierSum += round.multiplier;
  stats.rollSum += round.result;

  if (round.result > stats.highestRoll) stats.highestRoll = round.result;
  if (round.result < stats.lowestRoll) stats.lowestRoll = round.result;

  if (round.isWin) {
    const payout = calculatePayout(round.betAmount, round.multiplier);
    stats.totalReturns += payout;
    stats.winCount += 1;
    stats.currentStreak = stats.currentStreak > 0 ? stats.currentStreak + 1 : 1;
    if (stats.currentStreak > stats.bestWinStreak) {
      stats.bestWinStreak = stats.currentStreak;
    }

    const profit = round.profit;
    if (!stats.bestWin || profit > stats.bestWin.profit) {
      stats.bestWin = { multiplier: round.multiplier, profit };
    }
  } else {
    stats.totalReturns += 0; // lost entire bet
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

function diceReducer(state: DiceGameState, action: DiceAction): DiceGameState {
  switch (action.type) {
    // -----------------------------------------------------------------------
    // Bet amount
    // -----------------------------------------------------------------------
    case "SET_BET_AMOUNT": {
      if (state.phase !== "idle" && !state.autoPlay.active) return state;
      const betAmount = clampBet(action.amount);
      const params = {
        ...state.params,
        profitOnWin: calculateProfitOnWin(betAmount, state.params.multiplier),
      };
      return { ...state, betAmount, params };
    }

    // -----------------------------------------------------------------------
    // Animation speed
    // -----------------------------------------------------------------------
    case "SET_ANIMATION_SPEED": {
      return { ...state, animationSpeed: action.speed };
    }

    // -----------------------------------------------------------------------
    // Parameter changes (4-way linked)
    // -----------------------------------------------------------------------
    case "SET_PARAMS": {
      if (state.phase !== "idle") return state;
      return { ...state, params: action.params };
    }

    case "SYNC_PARAM": {
      if (state.phase !== "idle") return state;
      const newParams = syncParameters(
        action.field,
        action.value,
        state.params,
        state.betAmount,
      );
      return { ...state, params: newParams };
    }

    case "SET_DIRECTION": {
      if (state.phase !== "idle") return state;
      const newParams = syncParameters(
        "direction",
        action.direction,
        state.params,
        state.betAmount,
      );
      return { ...state, params: newParams };
    }

    case "SWAP_DIRECTION": {
      if (state.phase !== "idle") return state;
      const newDirection: DiceDirection =
        state.params.direction === "over" ? "under" : "over";
      const newTarget = getSwapTarget(state.params.target);
      // Sync from target with new direction to preserve win chance
      const swapped = syncParameters("target", newTarget, {
        ...state.params,
        direction: newDirection,
      }, state.betAmount);
      return { ...state, params: swapped };
    }

    // -----------------------------------------------------------------------
    // Roll
    // -----------------------------------------------------------------------
    case "ROLL": {
      if (state.phase !== "idle") return state;
      if (state.balance < state.betAmount) return state;
      return {
        ...state,
        phase: "rolling",
        balance: state.balance - state.betAmount,
        currentResult: null,
        currentIsWin: null,
        currentProfit: null,
      };
    }

    // -----------------------------------------------------------------------
    // Roll complete (animation finished)
    // -----------------------------------------------------------------------
    case "ROLL_COMPLETE": {
      if (state.phase !== "rolling") return state;

      const round: DiceRound = {
        id: generateId(),
        betAmount: state.betAmount,
        target: state.params.target,
        direction: state.params.direction,
        result: action.result,
        multiplier: state.params.multiplier,
        winChance: state.params.winChance,
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
      const newSessionRollCount = state.sessionRollCount + 1;
      let showSessionReminder = state.showSessionReminder;
      if (
        newSessionRollCount === SESSION_REMINDER_THRESHOLD &&
        !state.showSessionReminder
      ) {
        showSessionReminder = true;
      }

      // Auto-play progress
      let autoPlay = state.autoPlay;
      if (autoPlay.active && autoPlay.progress) {
        const p = { ...autoPlay.progress };
        p.currentRoll += 1;
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
        sessionRollCount: newSessionRollCount,
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
      if (state.phase !== "idle") return state;
      return {
        ...state,
        autoPlay: {
          active: true,
          config: action.config,
          progress: {
            currentRoll: 0,
            totalRolls: action.config.numberOfRolls,
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

    case "AUTO_PLAY_TICK": {
      // This is a signal — the actual roll is triggered in the effect
      return state;
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
        params: action.params,
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

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDiceGame() {
  const [state, dispatch] = useReducer(diceReducer, undefined, createInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const rollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRollTimeRef = useRef(0);

  // ---------------------------------------------------------------------------
  // Roll action
  // ---------------------------------------------------------------------------

  const roll = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "idle") return;
    if (s.balance < s.betAmount) return;

    dispatch({ type: "ROLL" });

    // Generate result
    const result = generateDiceResult();
    const won = isWin(result, s.params.target, s.params.direction);
    const payout = won ? calculatePayout(s.betAmount, s.params.multiplier) : 0;
    const profit = won ? payout - s.betAmount : -s.betAmount;

    // Animation duration
    const duration = s.animationSpeed === "fast"
      ? ROLL_DURATION_FAST
      : (s.autoPlay.active && s.autoPlay.config?.speed === "turbo")
        ? ROLL_DURATION_FAST
        : (s.autoPlay.active && s.autoPlay.config?.speed === "fast")
          ? ROLL_DURATION_FAST
          : ROLL_DURATION_NORMAL;

    rollTimerRef.current = setTimeout(() => {
      dispatch({ type: "ROLL_COMPLETE", result, isWin: won, profit, payout });
    }, duration);

    lastRollTimeRef.current = Date.now();
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
  }, [state.phase, state.sessionRollCount]);

  // ---------------------------------------------------------------------------
  // Auto-play loop (handles both first roll and subsequent rolls)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!state.autoPlay.active) return;
    if (state.phase !== "idle") return;

    const config = state.autoPlay.config;
    const progress = state.autoPlay.progress;
    if (!config || !progress) return;

    // First roll — immediate, no delay
    if (progress.currentRoll === 0) {
      roll();
      return;
    }

    // Check stop conditions before scheduling next roll
    const shouldStop = checkAutoPlayStopConditions(state, config, progress);
    if (shouldStop) {
      dispatch({ type: "AUTO_PLAY_STOP" });
      return;
    }

    // Apply adjustments from previous round
    const lastRound = state.history[0];
    if (lastRound) {
      const { newBetAmount, newParams } = applyAutoBetAdjustments(
        lastRound.isWin,
        state.betAmount,
        progress.baseBetAmount,
        state.params,
        config,
      );

      // Check if new bet exceeds balance or max
      if (newBetAmount > state.balance || newBetAmount > MAX_BET) {
        dispatch({ type: "AUTO_PLAY_STOP" });
        return;
      }

      dispatch({
        type: "AUTO_PLAY_ADJUST",
        betAmount: newBetAmount,
        params: newParams,
      });
    }

    // Schedule next roll with appropriate delay
    const delay = getAutoPlayDelay(config.speed);
    autoTimerRef.current = setTimeout(() => {
      roll();
    }, delay);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [state.autoPlay.active, state.phase, state.sessionRollCount, roll]);

  // ---------------------------------------------------------------------------
  // Post-session nudge timer
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (state.postSessionNudgeDismissed) return;
    if (state.sessionRollCount < POST_SESSION_NUDGE_THRESHOLD) return;
    if (state.autoPlay.active) return;

    // Reset timer on each roll
    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);

    nudgeTimerRef.current = setTimeout(() => {
      dispatch({ type: "SHOW_POST_SESSION_NUDGE" });
    }, 60000); // 60 seconds inactivity

    return () => {
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, [state.sessionRollCount, state.postSessionNudgeDismissed, state.autoPlay.active]);

  // ---------------------------------------------------------------------------
  // Auto-dismiss post-session nudge
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!state.showPostSessionNudge) return;

    const timer = setTimeout(() => {
      dispatch({ type: "DISMISS_POST_SESSION_NUDGE" });
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [state.showPostSessionNudge]);

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (rollTimerRef.current) clearTimeout(rollTimerRef.current);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Convenience actions
  // ---------------------------------------------------------------------------

  const startAutoPlay = useCallback((config: DiceAutoPlayConfig) => {
    dispatch({ type: "AUTO_PLAY_START", config });
  }, []);

  const stopAutoPlay = useCallback(() => {
    dispatch({ type: "AUTO_PLAY_STOP" });
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
  }, []);

  return {
    state,
    dispatch,
    roll,
    startAutoPlay,
    stopAutoPlay,
  };
}

// ---------------------------------------------------------------------------
// Stop condition checker
// ---------------------------------------------------------------------------

function checkAutoPlayStopConditions(
  state: DiceGameState,
  config: DiceAutoPlayConfig,
  progress: DiceAutoPlayProgress,
): boolean {
  // Roll count reached
  if (
    isFinite(config.numberOfRolls) &&
    progress.currentRoll >= config.numberOfRolls
  ) {
    return true;
  }

  // Max consecutive auto-rolls
  if (progress.currentRoll >= AUTO_PLAY_MAX_CONSECUTIVE) {
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

  // Stop on win streak
  if (
    config.stopOnWinStreak !== null &&
    progress.currentWinStreak >= config.stopOnWinStreak
  ) {
    return true;
  }

  // Stop on loss streak
  if (
    config.stopOnLossStreak !== null &&
    progress.currentLossStreak >= config.stopOnLossStreak
  ) {
    return true;
  }

  return false;
}
