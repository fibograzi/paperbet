"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook for bet amount inputs that allows free typing without
 * reformatting on every keystroke. Commits the value on blur or Enter.
 */
export function useBetInput(
  betAmount: number,
  setBetAmount: (amount: number) => void,
  min = 0.1,
  max = 1000
) {
  const [value, setValue] = useState(betAmount.toFixed(2));
  const [focused, setFocused] = useState(false);

  // Sync from external changes (e.g. +/- buttons, half/double)
  useEffect(() => {
    if (!focused) {
      setValue(betAmount.toFixed(2));
    }
  }, [betAmount, focused]);

  const commit = useCallback(() => {
    setFocused(false);
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed > 0) {
      const clamped = Math.max(min, Math.min(max, Math.round(parsed * 100) / 100));
      setBetAmount(clamped);
      setValue(clamped.toFixed(2));
    } else {
      setValue(betAmount.toFixed(2));
    }
  }, [value, betAmount, setBetAmount, min, max]);

  return {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") e.currentTarget.blur();
    },
  };
}
