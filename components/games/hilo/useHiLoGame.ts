"use client";

import { useReducer, useCallback, useRef, useEffect } from "react";
import type {
  HiLoGameState,
  HiLoAction,
  HiLoBetResult,
  HiLoSessionStats,
  HiLoAutoPlayConfig,
  PlayingCard,
  Prediction,
} from "./hiloTypes";
import {
  drawCard,
  getPredictionInfo,
  resolvePrediction,
  getMultiplierForPrediction,
  autoPredict,
  calculateProfit,
  CARD_REVEAL_DURATION,
  SKIP_ANIMATION_DURATION,
  DEAL_ANIMATION_DURATION,
  CASHOUT_ANIMATION_DURATION,
  LOSS_ANIMATION_DURATION,
  MAX_SKIPS_PER_ROUND,
} from "./hiloEngine";
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
const MAX_HISTORY = 500;

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

function initialStats(): HiLoSessionStats {
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
    longestChain: 0,
    totalPredictions: 0,
    totalSkips: 0,
    higherPicks: 0,
    lowerPicks: 0,
  };
}

function initialState(): HiLoGameState {
  return {
    phase: "idle",
    config: { betAmount: DEFAULT_BET, instantBet: false },
    balance: INITIAL_BALANCE,
    round: null,
    history: [],
    stats: initialStats(),
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clampBet(amount: number): number {
  return Math.max(MIN_BET, Math.min(MAX_BET, Math.round(amount * 100) / 100));
}

function updateStats(
  stats: HiLoSessionStats,
  result: HiLoBetResult
): HiLoSessionStats {
  const totalBets = stats.totalBets + 1;
  const totalWagered = stats.totalWagered + result.amount;
  const returns = result.cashedOut
    ? result.amount + result.profit
    : 0;
  const totalReturns = stats.totalReturns + returns;
  const netProfit = stats.netProfit + result.profit;

  const biggestWin = result.profit > 0
    ? Math.max(stats.biggestWin, result.profit)
    : stats.biggestWin;
  const biggestLoss = result.profit < 0
    ? Math.max(stats.biggestLoss, Math.abs(result.profit))
    : stats.biggestLoss;
  const bestMultiplier = result.cashedOut
    ? Math.max(stats.bestMultiplier, result.cumulativeMultiplier)
    : stats.bestMultiplier;

  const totalWins = stats.totalWins + (result.cashedOut ? 1 : 0);
  const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;
  const cashoutCount = stats.cashoutCount + (result.cashedOut ? 1 : 0);
  const averageCashout = cashoutCount > 0
    ? (stats.averageCashout * stats.cashoutCount +
        (result.cashedOut ? result.cumulativeMultiplier : 0)) /
      cashoutCount
    : 0;

  const currentWinStreak = result.cashedOut
    ? stats.currentWinStreak + 1
    : 0;
  const bestWinStreak = Math.max(stats.bestWinStreak, currentWinStreak);

  const longestChain = Math.max(stats.longestChain, result.roundCount);

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
    longestChain,
    totalPredictions: stats.totalPredictions,
    totalSkips: stats.totalSkips,
    higherPicks: stats.higherPicks,
    lowerPicks: stats.lowerPicks,
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function hiloReducer(
  state: HiLoGameState,
  action: HiLoAction
): HiLoGameState {
  switch (action.type) {
    // --- Configuration ---
    case "SET_BET_AMOUNT": {
      if (state.phase !== "idle") return state;
      return {
        ...state,
        config: { ...state.config, betAmount: clampBet(action.amount) },
      };
    }

    case "SET_INSTANT_BET": {
      return {
        ...state,
        config: { ...state.config, instantBet: action.enabled },
      };
    }

    // --- Place bet (idle → dealing) ---
    case "PLACE_BET": {
      if (state.phase !== "idle") return state;
      if (state.balance < state.config.betAmount) return state;

      return {
        ...state,
        phase: "dealing",
        balance: state.balance - state.config.betAmount,
        round: null,
      };
    }

    // --- Deal complete (dealing → predicting) ---
    case "DEAL_COMPLETE": {
      if (state.phase !== "dealing") return state;

      return {
        ...state,
        phase: "predicting",
        round: {
          startCard: action.card,
          predictions: [],
          currentCard: action.card,
          cumulativeMultiplier: 1,
          skipsUsed: 0,
          correctPredictions: 0,
        },
      };
    }

    // --- Predict (predicting → revealing) ---
    case "PREDICT": {
      if (state.phase !== "predicting") return state;
      if (!state.round) return state;

      const info = getPredictionInfo(state.round.currentCard);
      if (action.prediction === "higher" && !info.higherAvailable) return state;
      if (action.prediction === "lower" && !info.lowerAvailable) return state;

      return {
        ...state,
        phase: "revealing",
        stats: {
          ...state.stats,
          totalPredictions: state.stats.totalPredictions + 1,
          higherPicks: state.stats.higherPicks + (action.prediction === "higher" ? 1 : 0),
          lowerPicks: state.stats.lowerPicks + (action.prediction === "lower" ? 1 : 0),
        },
      };
    }

    // --- Reveal complete (revealing → predicting or lost) ---
    case "REVEAL_COMPLETE": {
      if (state.phase !== "revealing") return state;
      if (!state.round) return state;

      const newPrediction = {
        card: state.round.currentCard,
        prediction: action.prediction,
        nextCard: action.newCard,
        correct: action.correct,
        multiplier: action.multiplier,
      };

      if (action.correct) {
        const newCumulative =
          Math.round(
            state.round.cumulativeMultiplier * action.multiplier * 100
          ) / 100;

        return {
          ...state,
          phase: "predicting",
          round: {
            ...state.round,
            predictions: [...state.round.predictions, newPrediction],
            currentCard: action.newCard,
            cumulativeMultiplier: newCumulative,
            correctPredictions: state.round.correctPredictions + 1,
          },
        };
      }

      // Wrong prediction — lost
      const profit = -state.config.betAmount;
      const betResult: HiLoBetResult = {
        id: generateId(),
        amount: state.config.betAmount,
        roundCount: state.round.correctPredictions,
        cumulativeMultiplier: state.round.cumulativeMultiplier,
        profit,
        startCard: state.round.startCard,
        endCard: action.newCard,
        cashedOut: false,
        timestamp: Date.now(),
      };

      const newStats = updateStats(state.stats, betResult);
      const newHistory = [betResult, ...state.history].slice(0, MAX_HISTORY);
      const sessionBetCount = state.sessionBetCount + 1;

      return {
        ...state,
        phase: "lost",
        round: {
          ...state.round,
          predictions: [...state.round.predictions, newPrediction],
          currentCard: action.newCard,
        },
        stats: newStats,
        history: newHistory,
        sessionBetCount,
        showSessionReminder:
          !state.showSessionReminder &&
          sessionBetCount >= SESSION_REMINDER_THRESHOLD,
      };
    }

    // --- Skip (predicting → skipping) ---
    case "SKIP": {
      if (state.phase !== "predicting") return state;
      if (!state.round) return state;
      if (state.round.skipsUsed >= MAX_SKIPS_PER_ROUND) return state;

      return {
        ...state,
        phase: "skipping",
        stats: {
          ...state.stats,
          totalSkips: state.stats.totalSkips + 1,
        },
      };
    }

    // --- Skip complete (skipping → predicting) ---
    case "SKIP_COMPLETE": {
      if (state.phase !== "skipping") return state;
      if (!state.round) return state;

      const skipPrediction = {
        card: state.round.currentCard,
        prediction: "skip" as const,
        nextCard: action.newCard,
        correct: null,
        multiplier: 0,
      };

      return {
        ...state,
        phase: "predicting",
        round: {
          ...state.round,
          predictions: [...state.round.predictions, skipPrediction],
          currentCard: action.newCard,
          skipsUsed: state.round.skipsUsed + 1,
        },
      };
    }

    // --- Cash out (predicting → cashing_out) ---
    case "CASH_OUT": {
      if (state.phase !== "predicting") return state;
      if (!state.round) return state;
      if (state.round.correctPredictions < 1) return state;

      return {
        ...state,
        phase: "cashing_out",
      };
    }

    // --- Cashout complete (cashing_out → idle) ---
    case "CASHOUT_COMPLETE": {
      if (state.phase !== "cashing_out") return state;
      if (!state.round) return state;

      const payout =
        Math.floor(
          state.config.betAmount * state.round.cumulativeMultiplier * 100
        ) / 100;
      const profit = calculateProfit(
        state.config.betAmount,
        state.round.cumulativeMultiplier
      );

      const betResult: HiLoBetResult = {
        id: generateId(),
        amount: state.config.betAmount,
        roundCount: state.round.correctPredictions,
        cumulativeMultiplier: state.round.cumulativeMultiplier,
        profit,
        startCard: state.round.startCard,
        endCard: state.round.currentCard,
        cashedOut: true,
        timestamp: Date.now(),
      };

      const newStats = updateStats(state.stats, betResult);
      const newHistory = [betResult, ...state.history].slice(0, MAX_HISTORY);
      const sessionBetCount = state.sessionBetCount + 1;

      return {
        ...state,
        phase: "idle",
        balance: state.balance + payout,
        round: null,
        stats: newStats,
        history: newHistory,
        sessionBetCount,
        showSessionReminder:
          !state.showSessionReminder &&
          sessionBetCount >= SESSION_REMINDER_THRESHOLD,
      };
    }

    // --- Loss animation complete (lost → idle) ---
    case "LOSS_COMPLETE": {
      if (state.phase !== "lost") return state;

      return {
        ...state,
        phase: "idle",
        round: null,
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
      const lastResult = state.history[0];
      const isWin = lastResult?.cashedOut ?? false;

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

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useHiLoGame() {
  const [state, dispatch] = useReducer(hiloReducer, undefined, initialState);

  const stateRef = useRef(state);
  stateRef.current = state;
  const pendingPredictionRef = useRef<Prediction | null>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRoundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Manual actions ---

  const placeBet = useCallback(() => {
    dispatch({ type: "PLACE_BET" });
  }, []);

  const predict = useCallback((prediction: Prediction) => {
    pendingPredictionRef.current = prediction;
    dispatch({ type: "PREDICT", prediction });
  }, []);

  const skip = useCallback(() => {
    dispatch({ type: "SKIP" });
  }, []);

  const cashOut = useCallback(() => {
    dispatch({ type: "CASH_OUT" });
  }, []);

  // --- Deal animation handler ---
  useEffect(() => {
    if (state.phase !== "dealing") return;

    const duration = state.config.instantBet ? 0 : DEAL_ANIMATION_DURATION;
    const card = drawCard();

    const timer = setTimeout(() => {
      dispatch({ type: "DEAL_COMPLETE", card });
    }, duration);

    return () => clearTimeout(timer);
  }, [state.phase, state.config.instantBet]);

  // --- Reveal animation handler ---
  useEffect(() => {
    if (state.phase !== "revealing") return;
    if (!state.round) return;

    const prediction = pendingPredictionRef.current;
    if (!prediction) return;

    const newCard = drawCard();
    const correct = resolvePrediction(
      state.round.currentCard,
      newCard,
      prediction
    );
    const multiplier = getMultiplierForPrediction(
      state.round.currentCard,
      prediction
    );

    const duration = state.config.instantBet ? 0 : CARD_REVEAL_DURATION;

    const timer = setTimeout(() => {
      dispatch({
        type: "REVEAL_COMPLETE",
        newCard,
        correct,
        multiplier,
        prediction,
      });
      pendingPredictionRef.current = null;
    }, duration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // --- Skip animation handler ---
  useEffect(() => {
    if (state.phase !== "skipping") return;

    const newCard = drawCard();
    const duration = state.config.instantBet ? 0 : SKIP_ANIMATION_DURATION;

    const timer = setTimeout(() => {
      dispatch({ type: "SKIP_COMPLETE", newCard });
    }, duration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // --- Cashout animation handler ---
  useEffect(() => {
    if (state.phase !== "cashing_out") return;

    const duration = state.config.instantBet ? 0 : CASHOUT_ANIMATION_DURATION;

    const timer = setTimeout(() => {
      dispatch({ type: "CASHOUT_COMPLETE" });
    }, duration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // --- Loss animation handler ---
  useEffect(() => {
    if (state.phase !== "lost") return;

    const duration = state.config.instantBet ? 200 : LOSS_ANIMATION_DURATION;

    const timer = setTimeout(() => {
      dispatch({ type: "LOSS_COMPLETE" });
    }, duration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // --- Auto-play logic ---
  useEffect(() => {
    if (!state.autoPlay.active) {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      if (autoRoundTimerRef.current) clearTimeout(autoRoundTimerRef.current);
      return;
    }

    const config = state.autoPlay.config;
    if (!config) return;

    // IDLE → start a new round
    if (state.phase === "idle") {
      const s = stateRef.current;
      if (s.balance < s.config.betAmount) {
        dispatch({ type: "AUTO_PLAY_STOP" });
        return;
      }
      autoPlayTimerRef.current = setTimeout(() => {
        dispatch({ type: "PLACE_BET" });
      }, s.autoPlay.progress?.currentRound === 0 ? 0 : 800);
      return;
    }

    // PREDICTING → make auto-prediction or cash out
    if (state.phase === "predicting" && state.round) {
      const s = stateRef.current;
      const round = s.round;
      if (!round) return;

      // Check if we should cash out
      if (
        round.correctPredictions >= 1 &&
        round.cumulativeMultiplier >= config.cashOutAt
      ) {
        autoRoundTimerRef.current = setTimeout(() => {
          dispatch({ type: "CASH_OUT" });
        }, 150);
        return;
      }

      // Make prediction based on strategy
      const action = autoPredict(round.currentCard, config.strategy);
      if (action === "skip") {
        autoRoundTimerRef.current = setTimeout(() => {
          dispatch({ type: "SKIP" });
        }, 200);
      } else {
        autoRoundTimerRef.current = setTimeout(() => {
          pendingPredictionRef.current = action;
          dispatch({ type: "PREDICT", prediction: action });
        }, 200);
      }
      return;
    }

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      if (autoRoundTimerRef.current) clearTimeout(autoRoundTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.autoPlay.active, state.phase, state.round?.currentCard?.index]);

  // After round completes (idle), handle auto-play tick and bet adjustment
  useEffect(() => {
    if (!state.autoPlay.active || !state.autoPlay.config) return;
    if (state.phase !== "idle") return;
    if (state.sessionBetCount === 0) return;

    // This fires when a round finishes and we're back to idle
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

  // --- Beforeunload warning ---
  useEffect(() => {
    if (
      state.phase === "idle" ||
      state.phase === "lost" ||
      state.phase === "cashing_out"
    )
      return;
    if (!state.round || state.round.correctPredictions === 0) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state.phase, state.round]);

  return {
    state,
    dispatch,
    placeBet,
    predict,
    skip,
    cashOut,
  };
}
