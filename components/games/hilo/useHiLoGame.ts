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

// Fibonacci multipliers (50 entries — MAX_BET clamp is the practical ceiling)
const FIB = [
  1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584,
  4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811,
  514229, 832040, 1346269, 2178309, 3524578, 5702887, 9227465, 14930352,
  24157817, 39088169, 63245986, 102334155, 165580141, 267914296, 433494437,
  701408733, 1134903170, 1836311903, 2971215073, 4807526976, 7778742049,
  12586269025,
] as const;

const INITIAL_BALANCE = 1000;
const DEFAULT_BET = 1;
const MIN_BET = 0.1;
const MAX_BET = 1000;
const SESSION_REMINDER_THRESHOLD = 100;
const POST_SESSION_NUDGE_BETS = 10;
const POST_SESSION_NUDGE_IDLE_MS = 60_000;
const MAX_HISTORY = 1000;

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
    speedMode: "normal",
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

export function useHiLoGame() {
  const [state, dispatch] = useReducer(hiloReducer, undefined, initialState);

  const stateRef = useRef(state);
  stateRef.current = state;
  const pendingPredictionRef = useRef<Prediction | null>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRoundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoPlayStartBetCountRef = useRef(0);
  // Strategy-specific progression trackers (reset on every startAutoPlay call)
  const fibStepRef = useRef(0);
  const consecutiveWinsRef = useRef(0);

  // --- startAutoPlay: resets strategy refs before dispatching ---

  const startAutoPlay = useCallback((config: HiLoAutoPlayConfig) => {
    fibStepRef.current = 0;
    consecutiveWinsRef.current = 0;
    dispatch({ type: "AUTO_PLAY_START", config });
  }, []);

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
      // Track the sessionBetCount when auto-play starts so the bet
      // adjustment effect can skip stale manual results.
      // Use sessionBetCount (not currentRound) to detect "no rounds completed yet"
      // because AUTO_PLAY_TICK (which increments currentRound) fires AFTER this
      // effect runs — reading currentRound here would always see 0 after round 1.
      const noRoundsCompleted = s.sessionBetCount <= autoPlayStartBetCountRef.current;
      if (noRoundsCompleted) {
        autoPlayStartBetCountRef.current = s.sessionBetCount;
      }
      if (s.balance < s.config.betAmount) {
        dispatch({ type: "AUTO_PLAY_STOP" });
        return;
      }
      // Use 0ms delay only for the first ever bet (no rounds completed yet).
      // All subsequent bets use a real delay so AUTO_PLAY_ADJUST_BET is always
      // processed before PLACE_BET fires.
      const idleDelay = noRoundsCompleted ? 0
        : s.speedMode === "instant" ? 50
        : s.speedMode === "quick" ? 200
        : 800;
      autoPlayTimerRef.current = setTimeout(() => {
        dispatch({ type: "PLACE_BET" });
      }, idleDelay);
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
        const cashoutDelay = s.speedMode === "instant" ? 20
          : s.speedMode === "quick" ? 75
          : 150;
        autoRoundTimerRef.current = setTimeout(() => {
          dispatch({ type: "CASH_OUT" });
        }, cashoutDelay);
        return;
      }

      // Make prediction based on strategy
      const action = autoPredict(round.currentCard, config.autoStrategy);
      const predictDelay = s.speedMode === "instant" ? 50
        : s.speedMode === "quick" ? 100
        : 200;
      if (action === "skip") {
        autoRoundTimerRef.current = setTimeout(() => {
          dispatch({ type: "SKIP" });
        }, predictDelay);
      } else {
        autoRoundTimerRef.current = setTimeout(() => {
          pendingPredictionRef.current = action;
          dispatch({ type: "PREDICT", prediction: action });
        }, predictDelay);
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
    // Skip if no auto-play rounds have completed yet (prevents processing
    // stale manual round results when auto-play first starts)
    if (state.sessionBetCount <= autoPlayStartBetCountRef.current) return;

    // This fires when a round finishes and we're back to idle
    const lastResult = state.history[0];
    if (!lastResult) return;

    const ap = state.autoPlay.config;
    const won = lastResult.cashedOut;
    let newBet = state.config.betAmount;

    switch (ap.strategy) {
      case "martingale":
        newBet = won ? ap.baseBet : newBet * 2;
        break;

      case "anti_martingale":
        newBet = won ? newBet * 2 : ap.baseBet;
        break;

      case "dalembert":
        newBet = won
          ? Math.max(ap.baseBet, newBet - ap.baseBet)
          : newBet + ap.baseBet;
        break;

      case "fibonacci": {
        if (won) {
          fibStepRef.current = Math.max(0, fibStepRef.current - 2);
        } else {
          fibStepRef.current = Math.min(FIB.length - 1, fibStepRef.current + 1);
        }
        newBet = ap.baseBet * FIB[fibStepRef.current];
        break;
      }

      case "paroli": {
        if (won) {
          consecutiveWinsRef.current += 1;
          if (consecutiveWinsRef.current >= 3) {
            consecutiveWinsRef.current = 0;
            newBet = ap.baseBet;
          } else {
            newBet = newBet * 2;
          }
        } else {
          consecutiveWinsRef.current = 0;
          newBet = ap.baseBet;
        }
        break;
      }

      case "custom":
      default: {
        const winLossStrategy = won ? ap.onWin : ap.onLoss;
        const percent = won ? ap.increaseOnWinPercent : ap.increaseOnLossPercent;
        switch (winLossStrategy) {
          case "reset":
            newBet = ap.baseBet;
            break;
          case "increase":
            newBet = newBet * (1 + percent / 100);
            break;
          case "decrease":
            newBet = Math.max(ap.baseBet, newBet * (1 - percent / 100));
            break;
          case "same":
          default:
            break;
        }
      }
    }

    // Round to 2 decimals, enforce min/max
    newBet = Math.round(newBet * 100) / 100;
    newBet = Math.max(MIN_BET, Math.min(MAX_BET, newBet));

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
    startAutoPlay,
  };
}
