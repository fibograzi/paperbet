"use client";

import { useReducer, useCallback, useRef, useEffect } from "react";
import type {
  MinesGameState,
  MinesAction,
  MinesRound,
  MinesSessionStats,
  TileState,
} from "./minesTypes";
import {
  generateMinePositions,
  precomputeMultipliers,
  getDanger,
  calculateProfit,
  maxGems,
} from "./minesCalculator";
import { generateId } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_BALANCE = 1000;
const DEFAULT_BET = 1;
const DEFAULT_MINES = 3;
const MIN_BET = 0.1;
const MAX_BET = 1000;
const SESSION_REMINDER_THRESHOLD = 30;
const POST_SESSION_NUDGE_GAMES = 10;
const POST_SESSION_NUDGE_IDLE_MS = 60_000;
const MAX_HISTORY = 200;
const MAX_AUTO_PLAY_GAMES = 200;

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

function initialStats(): MinesSessionStats {
  return {
    gamesPlayed: 0,
    totalWagered: 0,
    totalReturns: 0,
    netProfit: 0,
    bestWin: null,
    biggestLoss: 0,
    longestGemStreak: 0,
    avgGemsPerGame: 0,
    winRate: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
  };
}

function initialState(): MinesGameState {
  return {
    phase: "IDLE",
    gameOverReason: null,
    balance: INITIAL_BALANCE,
    betAmount: DEFAULT_BET,
    mineCount: DEFAULT_MINES,
    minePositions: [],
    revealedTiles: [],
    tileStates: Array(25).fill("hidden") as TileState[],
    currentMultiplier: 0,
    nextMultiplier: 0,
    gemsRevealed: 0,
    dangerPercent: 0,
    profit: 0,
    isWin: null,
    revealingTile: null,
    postRevealPhase: false,
    autoPlay: {
      active: false,
      totalCount: null,
      currentCount: 0,
      autoRevealTarget: 5,
      onWin: "reset",
      onLoss: "reset",
      increaseOnWinPercent: 100,
      increaseOnLossPercent: 100,
      baseBet: DEFAULT_BET,
      stopOnProfit: null,
      stopOnLoss: null,
      startingNetProfit: 0,
    },
    stats: initialStats(),
    history: [],
    sessionGameCount: 0,
    showSessionReminder: false,
    showPostSessionNudge: false,
    postSessionNudgeDismissed: false,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function updateStats(
  stats: MinesSessionStats,
  round: MinesRound,
): MinesSessionStats {
  const gamesPlayed = stats.gamesPlayed + 1;
  const totalWagered = stats.totalWagered + round.amount;
  const totalReturns =
    stats.totalReturns + (round.isWin ? round.amount + round.profit : 0);
  const netProfit = stats.netProfit + round.profit;

  const bestWin =
    round.isWin && round.profit > (stats.bestWin?.profit ?? 0)
      ? { multiplier: round.multiplier, profit: round.profit }
      : stats.bestWin;

  const biggestLoss =
    !round.isWin && Math.abs(round.profit) > stats.biggestLoss
      ? Math.abs(round.profit)
      : stats.biggestLoss;

  const longestGemStreak = Math.max(
    stats.longestGemStreak,
    round.gemsRevealed,
  );

  const totalGems =
    stats.avgGemsPerGame * stats.gamesPlayed + round.gemsRevealed;
  const avgGemsPerGame = totalGems / gamesPlayed;

  const wins =
    Math.round((stats.winRate / 100) * stats.gamesPlayed) +
    (round.isWin ? 1 : 0);
  const winRate = (wins / gamesPlayed) * 100;

  const currentWinStreak = round.isWin ? stats.currentWinStreak + 1 : 0;
  const bestWinStreak = Math.max(stats.bestWinStreak, currentWinStreak);

  return {
    gamesPlayed,
    totalWagered,
    totalReturns,
    netProfit,
    bestWin,
    biggestLoss,
    longestGemStreak,
    avgGemsPerGame,
    winRate,
    currentWinStreak,
    bestWinStreak,
  };
}

function clampBet(amount: number): number {
  return Math.max(MIN_BET, Math.min(MAX_BET, Math.round(amount * 100) / 100));
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function minesReducer(
  state: MinesGameState,
  action: MinesAction,
): MinesGameState {
  switch (action.type) {
    // --- Configuration ---
    case "SET_BET_AMOUNT": {
      if (state.phase !== "IDLE") return state;
      return { ...state, betAmount: clampBet(action.amount) };
    }

    case "SET_MINE_COUNT": {
      if (state.phase !== "IDLE") return state;
      const count = Math.max(1, Math.min(24, action.count));
      return { ...state, mineCount: count };
    }

    // --- Start game ---
    case "START_GAME": {
      if (state.phase !== "IDLE") return state;
      if (state.balance < state.betAmount) return state;

      const mines = generateMinePositions(state.mineCount);
      const multipliers = precomputeMultipliers(state.mineCount);
      const danger = getDanger(0, state.mineCount);

      return {
        ...state,
        phase: "PLAYING",
        gameOverReason: null,
        balance: state.balance - state.betAmount,
        minePositions: mines,
        revealedTiles: [],
        tileStates: Array(25).fill("hidden") as TileState[],
        currentMultiplier: 0,
        nextMultiplier: multipliers[1] ?? 0,
        gemsRevealed: 0,
        dangerPercent: danger,
        profit: 0,
        isWin: null,
        revealingTile: null,
        postRevealPhase: false,
      };
    }

    // --- Reveal a tile ---
    case "REVEAL_TILE": {
      if (state.phase !== "PLAYING") return state;
      if (state.revealingTile !== null) return state; // animation in progress
      const idx = action.index;
      if (idx < 0 || idx >= 25) return state;
      if (state.tileStates[idx] !== "hidden") return state;

      const isMine = state.minePositions.includes(idx);
      const newTileStates = [...state.tileStates];
      newTileStates[idx] = "revealing";

      if (isMine) {
        // Mine hit — will transition to GAME_OVER after reveal animation
        return {
          ...state,
          tileStates: newTileStates,
          revealingTile: idx,
        };
      }

      // Gem — start reveal animation
      return {
        ...state,
        tileStates: newTileStates,
        revealingTile: idx,
      };
    }

    // --- Tile reveal animation complete ---
    case "TILE_REVEAL_COMPLETE": {
      if (state.phase !== "PLAYING") return state;
      const idx = action.index;
      const isMine = state.minePositions.includes(idx);
      const newTileStates = [...state.tileStates];

      if (isMine) {
        // Mine hit!
        newTileStates[idx] = "mine_hit";
        const profit = -state.betAmount;
        const revealOrder = [...state.revealedTiles, idx];

        const round: MinesRound = {
          id: generateId(),
          amount: state.betAmount,
          multiplier: 0,
          profit,
          timestamp: Date.now(),
          mineCount: state.mineCount,
          gemsRevealed: state.gemsRevealed,
          isWin: false,
          minePositions: [...state.minePositions],
          revealOrder,
        };

        const newStats = updateStats(state.stats, round);
        const newHistory = [round, ...state.history].slice(0, MAX_HISTORY);
        const sessionGameCount = state.sessionGameCount + 1;

        return {
          ...state,
          phase: "GAME_OVER",
          gameOverReason: "mine_hit",
          tileStates: newTileStates,
          revealingTile: null,
          revealedTiles: revealOrder,
          profit,
          isWin: false,
          stats: newStats,
          history: newHistory,
          sessionGameCount,
          showSessionReminder:
            !state.showSessionReminder &&
            sessionGameCount >= SESSION_REMINDER_THRESHOLD,
        };
      }

      // Gem found
      newTileStates[idx] = "gem";
      const newGemsRevealed = state.gemsRevealed + 1;
      const multipliers = precomputeMultipliers(state.mineCount);
      const currentMultiplier = multipliers[newGemsRevealed] ?? 0;
      const mg = maxGems(state.mineCount);
      const isFullClear = newGemsRevealed >= mg;

      if (isFullClear) {
        // Full clear! Auto-cashout
        const profit = calculateProfit(state.betAmount, currentMultiplier);
        const revealOrder = [...state.revealedTiles, idx];

        const round: MinesRound = {
          id: generateId(),
          amount: state.betAmount,
          multiplier: currentMultiplier,
          profit,
          timestamp: Date.now(),
          mineCount: state.mineCount,
          gemsRevealed: newGemsRevealed,
          isWin: true,
          minePositions: [...state.minePositions],
          revealOrder,
        };

        const newStats = updateStats(state.stats, round);
        const newHistory = [round, ...state.history].slice(0, MAX_HISTORY);
        const sessionGameCount = state.sessionGameCount + 1;

        return {
          ...state,
          phase: "GAME_OVER",
          gameOverReason: "full_clear",
          tileStates: newTileStates,
          revealingTile: null,
          revealedTiles: revealOrder,
          gemsRevealed: newGemsRevealed,
          currentMultiplier,
          nextMultiplier: 0,
          dangerPercent: 0,
          profit,
          isWin: true,
          balance: state.balance + state.betAmount * currentMultiplier,
          stats: newStats,
          history: newHistory,
          sessionGameCount,
          showSessionReminder:
            !state.showSessionReminder &&
            sessionGameCount >= SESSION_REMINDER_THRESHOLD,
        };
      }

      // Normal gem reveal
      const nextMult = multipliers[newGemsRevealed + 1] ?? 0;
      const danger = getDanger(newGemsRevealed, state.mineCount);

      return {
        ...state,
        tileStates: newTileStates,
        revealingTile: null,
        revealedTiles: [...state.revealedTiles, idx],
        gemsRevealed: newGemsRevealed,
        currentMultiplier,
        nextMultiplier: nextMult,
        dangerPercent: danger,
      };
    }

    // --- Cash out ---
    case "CASH_OUT": {
      if (state.phase !== "PLAYING") return state;
      if (state.gemsRevealed < 1) return state;
      if (state.revealingTile !== null) return state;

      const profit = calculateProfit(state.betAmount, state.currentMultiplier);

      const round: MinesRound = {
        id: generateId(),
        amount: state.betAmount,
        multiplier: state.currentMultiplier,
        profit,
        timestamp: Date.now(),
        mineCount: state.mineCount,
        gemsRevealed: state.gemsRevealed,
        isWin: true,
        minePositions: [...state.minePositions],
        revealOrder: [...state.revealedTiles],
      };

      const newStats = updateStats(state.stats, round);
      const newHistory = [round, ...state.history].slice(0, MAX_HISTORY);
      const sessionGameCount = state.sessionGameCount + 1;

      return {
        ...state,
        phase: "GAME_OVER",
        gameOverReason: "cashout",
        revealingTile: null,
        profit,
        isWin: true,
        balance: state.balance + state.betAmount * state.currentMultiplier,
        stats: newStats,
        history: newHistory,
        sessionGameCount,
        showSessionReminder:
          !state.showSessionReminder &&
          sessionGameCount >= SESSION_REMINDER_THRESHOLD,
      };
    }

    // --- Post-game reveal ---
    case "POST_REVEAL_START":
      return { ...state, postRevealPhase: true };

    case "POST_REVEAL_TILE": {
      const newTileStates = [...state.tileStates];
      newTileStates[action.index] = action.state;
      return { ...state, tileStates: newTileStates };
    }

    case "POST_REVEAL_COMPLETE":
      return { ...state, postRevealPhase: false };

    // --- New game ---
    case "NEW_GAME": {
      if (state.phase !== "GAME_OVER") return state;
      return {
        ...state,
        phase: "IDLE",
        gameOverReason: null,
        minePositions: [],
        revealedTiles: [],
        tileStates: Array(25).fill("hidden") as TileState[],
        currentMultiplier: 0,
        nextMultiplier: 0,
        gemsRevealed: 0,
        dangerPercent: 0,
        profit: 0,
        isWin: null,
        revealingTile: null,
        postRevealPhase: false,
      };
    }

    // --- Auto-play ---
    case "AUTO_PLAY_START": {
      return {
        ...state,
        autoPlay: {
          ...action.config,
          active: true,
          currentCount: 0,
          startingNetProfit: state.stats.netProfit,
        },
      };
    }

    case "AUTO_PLAY_TICK": {
      if (!state.autoPlay.active) return state;
      const newCount = state.autoPlay.currentCount + 1;

      // Check count limit
      if (
        state.autoPlay.totalCount !== null &&
        newCount >= state.autoPlay.totalCount
      ) {
        return {
          ...state,
          autoPlay: { ...state.autoPlay, currentCount: newCount, active: false },
        };
      }

      // Check max auto-play games
      if (newCount >= MAX_AUTO_PLAY_GAMES) {
        return {
          ...state,
          autoPlay: { ...state.autoPlay, currentCount: newCount, active: false },
        };
      }

      // Check stop on profit
      if (state.autoPlay.stopOnProfit !== null) {
        const relativeProfit =
          state.stats.netProfit - state.autoPlay.startingNetProfit;
        if (relativeProfit >= state.autoPlay.stopOnProfit) {
          return {
            ...state,
            autoPlay: {
              ...state.autoPlay,
              currentCount: newCount,
              active: false,
            },
          };
        }
      }

      // Check stop on loss
      if (state.autoPlay.stopOnLoss !== null) {
        const relativeProfit =
          state.stats.netProfit - state.autoPlay.startingNetProfit;
        if (relativeProfit <= -state.autoPlay.stopOnLoss) {
          return {
            ...state,
            autoPlay: {
              ...state.autoPlay,
              currentCount: newCount,
              active: false,
            },
          };
        }
      }

      return {
        ...state,
        autoPlay: { ...state.autoPlay, currentCount: newCount },
      };
    }

    case "AUTO_PLAY_STOP": {
      return {
        ...state,
        autoPlay: { ...state.autoPlay, active: false },
      };
    }

    case "AUTO_PLAY_ADJUST_BET": {
      if (state.phase !== "IDLE" && state.phase !== "GAME_OVER") return state;
      const clamped = clampBet(action.amount);
      const safeBet = Math.min(clamped, state.balance);
      return { ...state, betAmount: safeBet > 0 ? safeBet : MIN_BET };
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

export function useMinesGame() {
  const [state, dispatch] = useReducer(minesReducer, undefined, initialState);

  // Debounce ref for tile clicks
  const lastClickRef = useRef(0);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRevealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const postRevealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const postRevealInitiatedRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // --- Actions ---

  const startGame = useCallback(() => {
    dispatch({ type: "START_GAME" });
  }, []);

  const revealTile = useCallback(
    (index: number) => {
      // Debounce: 100ms between clicks
      const now = Date.now();
      if (now - lastClickRef.current < 100) return;
      lastClickRef.current = now;

      // Ignore manual clicks during auto-play
      if (state.autoPlay.active) return;

      dispatch({ type: "REVEAL_TILE", index });
    },
    [state.autoPlay.active],
  );

  const cashOut = useCallback(() => {
    if (state.autoPlay.active) return;
    dispatch({ type: "CASH_OUT" });
  }, [state.autoPlay.active]);

  const newGame = useCallback(() => {
    dispatch({ type: "NEW_GAME" });
  }, []);

  const pickRandom = useCallback(() => {
    if (state.phase !== "PLAYING") return;
    if (state.revealingTile !== null) return;
    if (state.autoPlay.active) return;

    const hiddenIndices = state.tileStates
      .map((s, i) => (s === "hidden" ? i : -1))
      .filter((i) => i >= 0);

    if (hiddenIndices.length === 0) return;

    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    const randomIdx = hiddenIndices[buffer[0] % hiddenIndices.length];

    const now = Date.now();
    if (now - lastClickRef.current < 100) return;
    lastClickRef.current = now;

    dispatch({ type: "REVEAL_TILE", index: randomIdx });
  }, [state.phase, state.revealingTile, state.tileStates, state.autoPlay.active]);

  // --- Handle tile reveal animation completion (300ms) ---
  useEffect(() => {
    if (state.revealingTile === null) return;

    const timer = setTimeout(() => {
      dispatch({
        type: "TILE_REVEAL_COMPLETE",
        index: state.revealingTile!,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [state.revealingTile]);

  // --- Post-game reveal (staggered tile flips) ---
  // Uses a ref guard to ensure one-time execution per game-over.
  // We intentionally only depend on state.phase to avoid the cleanup
  // cancelling our own POST_REVEAL_TILE timers when postRevealPhase
  // or tileStates change mid-animation.
  useEffect(() => {
    if (state.phase !== "GAME_OVER") {
      postRevealInitiatedRef.current = false;
      return;
    }
    if (postRevealInitiatedRef.current) return;
    postRevealInitiatedRef.current = true;

    // Capture tile states and mine positions at the moment we enter GAME_OVER
    const currentTileStates = state.tileStates;
    const currentMinePositions = state.minePositions;

    // Wait 400ms before starting post-reveal
    const startTimer = setTimeout(() => {
      dispatch({ type: "POST_REVEAL_START" });

      // Find unrevealed tiles
      const unrevealed: { index: number; isMine: boolean }[] = [];
      for (let i = 0; i < 25; i++) {
        if (
          currentTileStates[i] === "hidden" ||
          currentTileStates[i] === "revealing"
        ) {
          unrevealed.push({
            index: i,
            isMine: currentMinePositions.includes(i),
          });
        }
      }

      // Reveal mines first, then gems
      const mines = unrevealed.filter((t) => t.isMine);
      const gems = unrevealed.filter((t) => !t.isMine);
      const ordered = [...mines, ...gems];

      const handles: ReturnType<typeof setTimeout>[] = [];
      ordered.forEach((tile, i) => {
        const delay = i < mines.length ? i * 50 : mines.length * 50 + (i - mines.length) * 40;
        handles.push(
          setTimeout(() => {
            dispatch({
              type: "POST_REVEAL_TILE",
              index: tile.index,
              state: tile.isMine ? "mine_revealed" : "gem_faded",
            });
          }, delay),
        );
      });

      // Mark post-reveal complete
      const totalDelay =
        mines.length * 50 + gems.length * 40 + 200;
      handles.push(
        setTimeout(() => {
          dispatch({ type: "POST_REVEAL_COMPLETE" });
        }, totalDelay),
      );
      postRevealTimersRef.current = handles;
    }, 400);

    return () => {
      clearTimeout(startTimer);
      postRevealTimersRef.current.forEach(clearTimeout);
      postRevealTimersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // --- Auto-play logic ---
  // Only reacts to phase transitions (4 deps). All other values are read
  // from stateRef inside timer callbacks to avoid stale closures and
  // prevent excessive re-runs from deps like tileStates or history.
  useEffect(() => {
    if (!state.autoPlay.active) {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      if (autoRevealTimerRef.current) clearTimeout(autoRevealTimerRef.current);
      return;
    }

    // IDLE → start a new game
    if (state.phase === "IDLE") {
      const s = stateRef.current;
      if (s.balance < s.betAmount) {
        dispatch({ type: "AUTO_PLAY_STOP" });
        return;
      }
      autoPlayTimerRef.current = setTimeout(() => {
        dispatch({ type: "START_GAME" });
      }, s.autoPlay.currentCount === 0 ? 0 : 1000);
      return;
    }

    // PLAYING → auto-reveal tiles one at a time
    if (state.phase === "PLAYING" && state.revealingTile === null) {
      const s = stateRef.current;

      // Reached target → cash out
      if (s.gemsRevealed >= s.autoPlay.autoRevealTarget) {
        autoRevealTimerRef.current = setTimeout(() => {
          dispatch({ type: "CASH_OUT" });
        }, 200);
        return;
      }

      // Pick a random hidden tile
      const hiddenIndices = s.tileStates
        .map((t, i) => (t === "hidden" ? i : -1))
        .filter((i) => i >= 0);

      if (hiddenIndices.length > 0) {
        const buffer = new Uint32Array(1);
        crypto.getRandomValues(buffer);
        const randomIdx = hiddenIndices[buffer[0] % hiddenIndices.length];

        autoRevealTimerRef.current = setTimeout(() => {
          dispatch({ type: "REVEAL_TILE", index: randomIdx });
        }, 300);
      }
      return;
    }

    // GAME_OVER + post-reveal complete → next round
    if (state.phase === "GAME_OVER" && !state.postRevealPhase) {
      autoPlayTimerRef.current = setTimeout(() => {
        const s = stateRef.current;

        // Apply bet adjustment based on last round
        const lastRound = s.history[0];
        if (lastRound) {
          const isWin = lastRound.isWin;
          const strategy = isWin ? s.autoPlay.onWin : s.autoPlay.onLoss;
          const percent = isWin
            ? s.autoPlay.increaseOnWinPercent
            : s.autoPlay.increaseOnLossPercent;

          let newBet = s.betAmount;
          if (strategy === "reset") {
            newBet = s.autoPlay.baseBet;
          } else if (strategy === "increase") {
            newBet = s.betAmount * (1 + percent / 100);
          }

          dispatch({ type: "AUTO_PLAY_ADJUST_BET", amount: newBet });
        }

        dispatch({ type: "AUTO_PLAY_TICK" });
        dispatch({ type: "NEW_GAME" });
      }, 1500);
    }

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      if (autoRevealTimerRef.current) clearTimeout(autoRevealTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.autoPlay.active, state.phase, state.revealingTile, state.postRevealPhase]);

  // --- Post-session nudge (60s inactivity after 10+ games) ---
  useEffect(() => {
    if (state.postSessionNudgeDismissed) return;
    if (state.sessionGameCount < POST_SESSION_NUDGE_GAMES) return;
    if (state.phase !== "IDLE" && state.phase !== "GAME_OVER") return;

    const timer = setTimeout(() => {
      dispatch({ type: "SHOW_POST_SESSION_NUDGE" });
    }, POST_SESSION_NUDGE_IDLE_MS);

    return () => clearTimeout(timer);
  }, [
    state.sessionGameCount,
    state.phase,
    state.postSessionNudgeDismissed,
  ]);

  // --- Beforeunload warning ---
  useEffect(() => {
    if (state.phase !== "PLAYING") return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state.phase]);

  return {
    state,
    dispatch,
    startGame,
    revealTile,
    cashOut,
    newGame,
    pickRandom,
  };
}
