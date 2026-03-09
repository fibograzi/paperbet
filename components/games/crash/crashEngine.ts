/**
 * Crash game engine — pure math functions.
 *
 * Crash point formula: max(1, floor(99 / u) / 100)
 * where u is uniform in [0, 1).
 * Equivalent to Stake's: max(1, floor(0.99 / u × 100) / 100)
 *
 * Multiplier growth: multiplier(t) = e^(GROWTH_RATE * t)
 * where t is elapsed time in seconds.
 *
 * We use the "fast" growth rate (0.15) for an engaging simulator experience.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Exponential growth rate (fast simulator version) */
export const GROWTH_RATE = 0.15;

/** Cap multiplier at this value */
export const MAX_MULTIPLIER = 10_000;

/** Multiplier update interval in ms (smooth counting) */
export const MULTIPLIER_UPDATE_INTERVAL = 50;

/** Countdown duration in seconds */
export const COUNTDOWN_SECONDS = 3;

/** Pause after crash before next round (ms) */
export const POST_CRASH_DELAY = 2000;

// ---------------------------------------------------------------------------
// Crash point generation
// ---------------------------------------------------------------------------

/**
 * Generate a provably-fair crash point.
 *
 * Formula: max(1, floor(99 / u) / 100) where u ~ Uniform[0, 1)
 * This matches Stake.com's crash formula exactly.
 *
 * Distribution:
 * - ~2% crash at 1.00x (house edge mechanism)
 * - P(crash >= m) = 0.99/m for any target m
 * - EV = 0.99 for any cashout target (1% house edge)
 */
export function generateCrashPoint(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);

  // u in [0, 1) — uniform with full 32-bit precision
  const u = array[0] / (0xffffffff + 1);

  // Handle u = 0 edge case (division by zero)
  if (u === 0) return MAX_MULTIPLIER;

  // Formula: max(1, floor(99 / u) / 100)
  const raw = Math.floor(99 / u) / 100;
  const capped = Math.min(raw, MAX_MULTIPLIER);

  return Math.max(1, capped);
}

// ---------------------------------------------------------------------------
// Multiplier ↔ time conversion
// ---------------------------------------------------------------------------

/**
 * Get the multiplier at a given elapsed time (seconds).
 * multiplier(t) = e^(GROWTH_RATE * t)
 */
export function getMultiplierAtTime(elapsedSeconds: number): number {
  return Math.min(Math.exp(GROWTH_RATE * elapsedSeconds), MAX_MULTIPLIER);
}

/**
 * Get the time (seconds) to reach a given multiplier.
 * t = ln(multiplier) / GROWTH_RATE
 */
export function getTimeForMultiplier(multiplier: number): number {
  if (multiplier <= 1) return 0;
  return Math.log(multiplier) / GROWTH_RATE;
}

// ---------------------------------------------------------------------------
// Multiplier display colors (per spec §3.2)
// ---------------------------------------------------------------------------

export function getMultiplierColor(multiplier: number): string {
  if (multiplier >= 100) return "#F59E0B"; // Gold with pulsing glow
  if (multiplier >= 50) return "#EF4444"; // Red
  if (multiplier >= 10) return "#F97316"; // Orange
  if (multiplier >= 5) return "#00B4D8"; // Cyan
  if (multiplier >= 2) return "#00E5A0"; // Green
  return "#F9FAFB"; // White
}

/**
 * Color for crash point badges in the previous rounds display.
 */
export function getCrashPointBadgeStyle(crashPoint: number): {
  bg: string;
  text: string;
} {
  if (crashPoint <= 1) {
    return { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444" };
  }
  if (crashPoint < 2) {
    return { bg: "#374151", text: "#9CA3AF" };
  }
  if (crashPoint < 10) {
    return { bg: "rgba(0, 229, 160, 0.1)", text: "#00E5A0" };
  }
  return { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B" };
}

// ---------------------------------------------------------------------------
// Profit calculation
// ---------------------------------------------------------------------------

export function calculateCrashProfit(
  betAmount: number,
  cashedOut: boolean,
  cashoutMultiplier: number | null
): number {
  if (!cashedOut || cashoutMultiplier === null) {
    return -betAmount;
  }
  return betAmount * cashoutMultiplier - betAmount;
}

// ---------------------------------------------------------------------------
// Multiplier formatting
// ---------------------------------------------------------------------------

export function formatCrashMultiplier(multiplier: number): string {
  if (multiplier >= 1000) {
    return multiplier.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "x";
  }
  return multiplier.toFixed(2) + "x";
}
