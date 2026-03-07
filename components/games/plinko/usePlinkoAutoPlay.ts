"use client";

import { useRef, useCallback, useEffect } from "react";
import type {
  PlinkoGameState,
  PlinkoAction,
  PlinkoBetResult,
  AutoPlayState,
  AutoPlaySpeed,
} from "./plinkoTypes";

const SPEED_DELAYS: Record<AutoPlaySpeed, number> = {
  normal: 2000,
  fast: 500,
  turbo: 300,
};

const MAX_CONCURRENT_BALLS = 3;

export function usePlinkoAutoPlay(
  state: PlinkoGameState,
  dispatch: React.Dispatch<PlinkoAction>,
  onDrop: () => PlinkoBetResult | null
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAutoPlayingRef = useRef(false);
  const stateRef = useRef(state);
  const stopAutoPlayRef = useRef<() => void>(() => {});

  // Refs to avoid stale closures
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  const configRef = useRef<AutoPlayState | null>(null);
  const countRef = useRef(0);

  // Keep stateRef in sync so timer callbacks read fresh state
  stateRef.current = state;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const shouldStop = useCallback(
    (result: PlinkoBetResult): boolean => {
      const config = configRef.current;
      if (!config) return true;

      // Reached target count (countRef already incremented before this call)
      if (config.totalCount !== null && countRef.current >= config.totalCount) {
        return true;
      }

      // Multiplier threshold reached
      if (
        config.stopOnWinMultiplier !== null &&
        result.multiplier >= config.stopOnWinMultiplier
      ) {
        return true;
      }

      // Session-relative profit tracking
      const autoPlayProfit =
        stateRef.current.balance - config.startBalance;

      // Profit threshold reached
      if (
        config.stopOnProfit !== null &&
        autoPlayProfit >= config.stopOnProfit
      ) {
        return true;
      }

      // Loss threshold reached
      if (
        config.stopOnLoss !== null &&
        autoPlayProfit <= -config.stopOnLoss
      ) {
        return true;
      }

      return false;
    },
    []
  );

  /** Adjust bet for next round based on on-win/on-loss strategy */
  const handleAutoPlayPostRound = useCallback(
    (result: PlinkoBetResult) => {
      const config = configRef.current;
      if (!config) return;

      const isWin = result.profit > 0;

      let newBet: number;

      if (isWin) {
        if (config.onWin === "increase" && config.increaseOnWinPercent > 0) {
          newBet =
            stateRef.current.config.betAmount *
            (1 + config.increaseOnWinPercent / 100);
        } else {
          // reset
          newBet = config.baseBet;
        }
      } else {
        if (config.onLoss === "increase" && config.increaseOnLossPercent > 0) {
          newBet =
            stateRef.current.config.betAmount *
            (1 + config.increaseOnLossPercent / 100);
        } else {
          // reset
          newBet = config.baseBet;
        }
      }

      // Clamp to $0.10-$1000, round to 2 decimals
      newBet = Math.max(0.1, Math.min(1000, Math.round(newBet * 100) / 100));

      if (newBet !== stateRef.current.config.betAmount) {
        dispatch({ type: "AUTO_PLAY_ADJUST_BET", amount: newBet });
      }
    },
    [dispatch]
  );

  const scheduleNextDrop = useCallback(() => {
    // Only check the local ref — not React state (which may be stale)
    if (!isAutoPlayingRef.current) return;

    const config = configRef.current;
    if (!config) return;

    const delay = SPEED_DELAYS[config.speed];
    const isNormalSpeed = config.speed === "normal";

    clearTimer();

    timerRef.current = setTimeout(() => {
      if (!isAutoPlayingRef.current) return;

      const s = stateRef.current;

      // For normal speed, wait until no active balls
      if (isNormalSpeed && s.activeBalls > 0) {
        scheduleNextDrop();
        return;
      }

      // For fast/turbo, respect max concurrent balls
      if (!isNormalSpeed && s.activeBalls >= MAX_CONCURRENT_BALLS) {
        scheduleNextDrop();
        return;
      }

      // Check balance
      if (s.balance < s.config.betAmount) {
        stopAutoPlayRef.current();
        return;
      }

      const result = onDropRef.current();
      if (!result) {
        stopAutoPlayRef.current();
        return;
      }

      countRef.current += 1;
      dispatch({ type: "AUTO_PLAY_TICK" });

      if (shouldStop(result)) {
        stopAutoPlayRef.current();
        return;
      }

      // Adjust bet for next round based on win/loss strategy
      handleAutoPlayPostRound(result);

      scheduleNextDrop();
    }, delay);
  }, [clearTimer, dispatch, shouldStop, handleAutoPlayPostRound]);

  const stopAutoPlay = useCallback(() => {
    isAutoPlayingRef.current = false;
    configRef.current = null;
    countRef.current = 0;
    clearTimer();
    dispatch({ type: "AUTO_PLAY_STOP" });
  }, [clearTimer, dispatch]);

  // Keep ref in sync to break circular dependency
  stopAutoPlayRef.current = stopAutoPlay;

  const startAutoPlay = useCallback(
    (config: Omit<AutoPlayState, "active" | "currentCount">) => {
      if (isAutoPlayingRef.current) return;

      // Store config in ref synchronously — available immediately
      const fullConfig: AutoPlayState = {
        ...config,
        active: true,
        currentCount: 0,
      };
      configRef.current = fullConfig;
      countRef.current = 0;
      isAutoPlayingRef.current = true;

      // Dispatch to React state (async, but we don't depend on it for logic)
      dispatch({ type: "AUTO_PLAY_START", config });

      // Drop the first ball immediately
      const result = onDropRef.current();
      if (!result) {
        stopAutoPlayRef.current();
        return;
      }

      countRef.current += 1;
      dispatch({ type: "AUTO_PLAY_TICK" });

      if (shouldStop(result)) {
        stopAutoPlayRef.current();
        return;
      }

      // Adjust bet for next round based on win/loss strategy
      handleAutoPlayPostRound(result);

      scheduleNextDrop();
    },
    [dispatch, shouldStop, scheduleNextDrop, handleAutoPlayPostRound]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      isAutoPlayingRef.current = false;
    };
  }, [clearTimer]);

  const isAutoPlaying = state.autoPlay.active;

  return { startAutoPlay, stopAutoPlay, isAutoPlaying };
}
