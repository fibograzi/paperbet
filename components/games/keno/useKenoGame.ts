"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import type {
  KenoGameState,
  KenoAction,
  KenoRound,
  KenoSessionStats,
  KenoAutoPlayConfig,
  KenoAutoPlayProgress,
  KenoPreviousResult,
} from "./kenoTypes";
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
  AUTO_PLAY_WARNING_THRESHOLD,
  TILE_REVEAL_STAGGER,
  RESULT_DISPLAY_DELAY,
  RESULT_DISPLAY_DURATION,
  BOARD_RESET_DURATION,
  drawNumbers,
  getMatches,
  getMultiplier,
  calculatePayout,
  clampBet,
  randomPick,
  getAutoPlayDelay,
  applyAutoBetAdjustment,
  MAX_PICKS,
} from "./kenoEngine";
import { generateId } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

function createInitialState(): KenoGameState {
  return {
    phase: "idle",
    betAmount: DEFAULT_BET,
    difficulty: "classic",
    instantBet: false,
    selectedNumbers: [],
    currentDraw: null,
    revealIndex: -1,
    revealedNumbers: [],
    currentMatchCount: 0,
    currentMultiplier: null,
    currentProfit: null,
    currentIsWin: null,
    balance: INITIAL_BALANCE,
    history: [],
    previousResults: [],
    stats: createInitialStats(),
    sessionBetCount: 0,
    showSessionReminder: false,
    showPostSessionNudge: false,
    postSessionNudgeDismissed: false,
    maxPicksShake: false,
    autoPlay: {
      active: false,
      config: null,
      progress: null,
      startingNetProfit: 0,
    },
    autoPlayPausedForWarning: false,
  };
}

function createInitialStats(): KenoSessionStats {
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
    totalHits: 0,
    mostHitsInOneDraw: 0,
    hitSum: 0,
    multiplierSum: 0,
  };
}

// ---------------------------------------------------------------------------
// Stats updater
// ---------------------------------------------------------------------------

function updateStats(prev: KenoSessionStats, round: KenoRound): KenoSessionStats {
  const stats = { ...prev };

  stats.totalBets += 1;
  stats.totalWagered += round.betAmount;
  stats.totalReturns += round.payout;
  stats.netProfit = stats.totalReturns - stats.totalWagered;
  stats.totalHits += round.matchCount;
  stats.hitSum += round.matchCount;
  stats.multiplierSum += round.multiplier;

  if (round.matchCount > stats.mostHitsInOneDraw) {
    stats.mostHitsInOneDraw = round.matchCount;
  }

  if (round.isWin) {
    stats.winCount += 1;
    stats.currentStreak = stats.currentStreak > 0 ? stats.currentStreak + 1 : 1;
    if (stats.currentStreak > stats.bestWinStreak) {
      stats.bestWinStreak = stats.currentStreak;
    }
    if (!stats.bestWin || round.profit > stats.bestWin.profit) {
      stats.bestWin = { multiplier: round.multiplier, profit: round.profit };
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

  return stats;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function kenoReducer(state: KenoGameState, action: KenoAction): KenoGameState {
  switch (action.type) {
    // -----------------------------------------------------------------------
    // Bet amount
    // -----------------------------------------------------------------------
    case "SET_BET_AMOUNT": {
      if (state.phase !== "idle" && !state.autoPlay.active) return state;
      return { ...state, betAmount: clampBet(action.amount) };
    }

    // -----------------------------------------------------------------------
    // Difficulty
    // -----------------------------------------------------------------------
    case "SET_DIFFICULTY": {
      if (state.phase !== "idle") return state;
      return { ...state, difficulty: action.difficulty };
    }

    // -----------------------------------------------------------------------
    // Instant bet toggle
    // -----------------------------------------------------------------------
    case "SET_INSTANT_BET": {
      return { ...state, instantBet: action.enabled };
    }

    // -----------------------------------------------------------------------
    // Number selection
    // -----------------------------------------------------------------------
    case "TOGGLE_NUMBER": {
      if (state.phase !== "idle") return state;
      const num = action.number;
      const isSelected = state.selectedNumbers.includes(num);

      if (isSelected) {
        return {
          ...state,
          selectedNumbers: state.selectedNumbers.filter((n) => n !== num),
        };
      }

      if (state.selectedNumbers.length >= MAX_PICKS) {
        return state; // max reached — shake handled externally
      }

      return {
        ...state,
        selectedNumbers: [...state.selectedNumbers, num].sort((a, b) => a - b),
      };
    }

    case "RANDOM_PICK": {
      if (state.phase !== "idle") return state;
      return { ...state, selectedNumbers: randomPick(MAX_PICKS) };
    }

    case "CLEAR_TABLE": {
      if (state.phase !== "idle") return state;
      return { ...state, selectedNumbers: [] };
    }

    // -----------------------------------------------------------------------
    // Max picks shake
    // -----------------------------------------------------------------------
    case "MAX_PICKS_SHAKE": {
      return { ...state, maxPicksShake: true };
    }

    case "CLEAR_MAX_PICKS_SHAKE": {
      return { ...state, maxPicksShake: false };
    }

    // -----------------------------------------------------------------------
    // Bet (start draw)
    // -----------------------------------------------------------------------
    case "BET": {
      if (state.phase !== "idle") return state;
      if (state.selectedNumbers.length === 0) return state;
      if (state.balance < state.betAmount) return state;

      // Pre-calculate the entire draw
      const drawnNumbers = drawNumbers();
      const matches = getMatches(state.selectedNumbers, drawnNumbers);
      const matchCount = matches.length;
      const multiplier = getMultiplier(state.difficulty, state.selectedNumbers.length, matchCount);
      const payout = calculatePayout(state.betAmount, multiplier);
      const profit = payout - state.betAmount;
      const isWin = multiplier > 0;

      const round: KenoRound = {
        id: generateId(),
        betAmount: state.betAmount,
        difficulty: state.difficulty,
        selectedNumbers: [...state.selectedNumbers],
        drawnNumbers,
        matches,
        matchCount,
        picks: state.selectedNumbers.length,
        multiplier,
        payout,
        profit,
        isWin,
        timestamp: Date.now(),
      };

      return {
        ...state,
        phase: "drawing",
        balance: state.balance - state.betAmount,
        currentDraw: round,
        revealIndex: -1,
        revealedNumbers: [],
        currentMatchCount: 0,
        currentMultiplier: null,
        currentProfit: null,
        currentIsWin: null,
      };
    }

    // -----------------------------------------------------------------------
    // Reveal number (one at a time during animation)
    // -----------------------------------------------------------------------
    case "REVEAL_NUMBER": {
      if (state.phase !== "drawing" || !state.currentDraw) return state;
      const idx = action.index;
      const drawn = state.currentDraw.drawnNumbers;
      if (idx < 0 || idx >= drawn.length) return state;

      const revealedNumber = drawn[idx];
      const newRevealed = [...state.revealedNumbers, revealedNumber];

      // Check if this revealed number is a match
      const isMatch = state.currentDraw.matches.includes(revealedNumber);
      const newMatchCount = isMatch ? state.currentMatchCount + 1 : state.currentMatchCount;

      return {
        ...state,
        revealIndex: idx,
        revealedNumbers: newRevealed,
        currentMatchCount: newMatchCount,
      };
    }

    // -----------------------------------------------------------------------
    // Draw complete — all 10 revealed
    // -----------------------------------------------------------------------
    case "DRAW_COMPLETE": {
      if (state.phase !== "drawing" || !state.currentDraw) return state;

      const round = state.currentDraw;

      // Add payout to balance
      let newBalance = state.balance;
      if (round.isWin) {
        newBalance += round.payout;
      }

      // History
      const newHistory = [round, ...state.history].slice(0, MAX_HISTORY);
      const prevResult: KenoPreviousResult = {
        id: round.id,
        matchCount: round.matchCount,
        picks: round.picks,
        multiplier: round.multiplier,
        profit: round.profit,
        isWin: round.isWin,
      };
      const newPreviousResults = [prevResult, ...state.previousResults].slice(0, MAX_PREVIOUS_RESULTS);

      // Stats
      const newStats = updateStats(state.stats, round);

      // Session reminder
      const newSessionBetCount = state.sessionBetCount + 1;
      let showSessionReminder = state.showSessionReminder;
      if (newSessionBetCount === SESSION_REMINDER_THRESHOLD && !state.showSessionReminder) {
        showSessionReminder = true;
      }

      // Auto-play progress
      let autoPlay = state.autoPlay;
      if (autoPlay.active && autoPlay.progress) {
        const p = { ...autoPlay.progress };
        p.currentBet += 1;
        p.sessionProfit += round.profit;
        if (round.isWin) {
          p.wins += 1;
        } else {
          p.losses += 1;
        }
        autoPlay = { ...autoPlay, progress: p };
      }

      return {
        ...state,
        phase: "result",
        balance: newBalance,
        currentMultiplier: round.multiplier,
        currentProfit: round.profit,
        currentIsWin: round.isWin,
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
      return {
        ...state,
        phase: "idle",
        currentDraw: null,
        revealIndex: -1,
        revealedNumbers: [],
        currentMatchCount: 0,
        currentMultiplier: null,
        currentProfit: null,
        currentIsWin: null,
      };
    }

    // -----------------------------------------------------------------------
    // Auto-play
    // -----------------------------------------------------------------------
    case "AUTO_PLAY_START": {
      if (state.phase !== "idle" || state.autoPlay.active) return state;
      if (state.selectedNumbers.length === 0) return state;
      return {
        ...state,
        autoPlayPausedForWarning: false,
        autoPlay: {
          active: true,
          config: action.config,
          progress: {
            currentBet: 0,
            totalBets: action.config.numberOfBets,
            wins: 0,
            losses: 0,
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

    case "SHOW_AUTO_PLAY_WARNING": {
      return { ...state, autoPlayPausedForWarning: true };
    }

    case "DISMISS_AUTO_PLAY_WARNING": {
      return { ...state, autoPlayPausedForWarning: false };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useKenoGame() {
  const [state, dispatch] = useReducer(kenoReducer, undefined, createInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Bet action — initiate draw
  // ---------------------------------------------------------------------------

  const bet = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "idle") return;
    if (s.selectedNumbers.length === 0) return;
    if (s.balance < s.betAmount) return;

    dispatch({ type: "BET" });
  }, []);

  // ---------------------------------------------------------------------------
  // Tile reveal animation sequence
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (state.phase !== "drawing" || !state.currentDraw) return;

    const draw = state.currentDraw;

    if (state.instantBet) {
      // Instant — reveal all at once
      for (let i = 0; i < draw.drawnNumbers.length; i++) {
        dispatch({ type: "REVEAL_NUMBER", index: i });
      }
      // Small delay then complete
      const timer = setTimeout(() => {
        dispatch({ type: "DRAW_COMPLETE" });
      }, RESULT_DISPLAY_DELAY);

      return () => clearTimeout(timer);
    }

    // Animated — stagger each reveal
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < draw.drawnNumbers.length; i++) {
      const timer = setTimeout(() => {
        dispatch({ type: "REVEAL_NUMBER", index: i });
      }, (i + 1) * TILE_REVEAL_STAGGER);
      timers.push(timer);
    }

    // After all revealed, wait then complete
    const completeTimer = setTimeout(() => {
      dispatch({ type: "DRAW_COMPLETE" });
    }, draw.drawnNumbers.length * TILE_REVEAL_STAGGER + RESULT_DISPLAY_DELAY);
    timers.push(completeTimer);

    return () => {
      timers.forEach(clearTimeout);
    };
    // Only re-run when a new draw starts (unique draw ID)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentDraw?.id]);

  // ---------------------------------------------------------------------------
  // Result settle effect
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (state.phase === "result") {
      const delay = state.autoPlay.active && state.instantBet
        ? BOARD_RESET_DURATION
        : RESULT_DISPLAY_DURATION;

      settleTimerRef.current = setTimeout(() => {
        dispatch({ type: "RESULT_SETTLE" });
      }, delay);
    }

    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, [state.phase, state.autoPlay.active, state.instantBet]);

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

    // 200-round responsible gambling pause
    if (progress.currentBet > 0 && progress.currentBet % AUTO_PLAY_WARNING_THRESHOLD === 0) {
      dispatch({ type: "AUTO_PLAY_STOP" });
      dispatch({ type: "SHOW_AUTO_PLAY_WARNING" });
      return;
    }

    // Check stop conditions
    if (checkAutoPlayStopConditions(state, config, progress)) {
      dispatch({ type: "AUTO_PLAY_STOP" });
      return;
    }

    // Apply bet adjustment from previous round
    const lastRound = state.history[0];
    if (lastRound) {
      const newBet = applyAutoBetAdjustment(
        lastRound.isWin,
        state.betAmount,
        progress.baseBetAmount,
        config,
      );

      if (newBet > state.balance || newBet > MAX_BET) {
        dispatch({ type: "AUTO_PLAY_STOP" });
        return;
      }

      if (newBet !== state.betAmount) {
        dispatch({ type: "AUTO_PLAY_ADJUST", betAmount: newBet });
      }
    }

    // Schedule next bet
    const delay = state.instantBet ? Math.max(200, getAutoPlayDelay(config.speed) / 2) : getAutoPlayDelay(config.speed);
    autoTimerRef.current = setTimeout(() => {
      bet();
    }, delay);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [state.autoPlay.active, state.phase, state.sessionBetCount, bet, state.betAmount, state.balance, state.history, state.autoPlay.config, state.autoPlay.progress, state.instantBet]);

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
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Convenience actions
  // ---------------------------------------------------------------------------

  const startAutoPlay = useCallback((config: KenoAutoPlayConfig) => {
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
  state: KenoGameState,
  config: KenoAutoPlayConfig,
  progress: KenoAutoPlayProgress,
): boolean {
  // Bet count reached
  if (isFinite(config.numberOfBets) && progress.currentBet >= config.numberOfBets) {
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

  return false;
}
