/**
 * Flip game engine — pure math functions.
 *
 * Fair coin: 50% heads, 50% tails.
 * House edge: 2% (RTP = 98%).
 * Base multiplier (1 flip): 1.96x (2 * 0.98).
 * Each subsequent flip: multiplier doubles.
 * Formula: multiplier(n) = 1.96 * 2^(n-1)
 */

import type { CoinSide, SidePick } from "./flipTypes";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HOUSE_EDGE = 0.02;
export const BASE_MULTIPLIER = 1.96; // 2 * (1 - HOUSE_EDGE)
export const MAX_FLIPS = 20;

export const FLIP_ANIMATION_DURATION = 1200; // ms
export const CASHOUT_ANIMATION_DURATION = 800; // ms
export const LOSS_ANIMATION_DURATION = 1200; // ms

// ---------------------------------------------------------------------------
// Multiplier & probability calculations
// ---------------------------------------------------------------------------

/**
 * Get multiplier for N consecutive winning flips.
 */
export function getMultiplier(flips: number): number {
  return BASE_MULTIPLIER * Math.pow(2, flips - 1);
}

/**
 * Get win probability for N consecutive flips.
 */
export function getWinChance(flips: number): number {
  return Math.pow(0.5, flips);
}

/**
 * Calculate payout from bet and flip count.
 */
export function calculatePayout(betAmount: number, flips: number): number {
  return Math.floor(betAmount * getMultiplier(flips) * 100) / 100;
}

/**
 * Calculate profit from bet and flip count.
 */
export function calculateProfit(betAmount: number, flips: number): number {
  return Math.floor((betAmount * getMultiplier(flips) - betAmount) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Random number generation
// ---------------------------------------------------------------------------

/**
 * Flip a coin using crypto.getRandomValues().
 */
export function flipCoin(): CoinSide {
  const array = new Uint8Array(1);
  crypto.getRandomValues(array);
  return array[0] < 128 ? "heads" : "tails";
}

/**
 * Resolve a side pick: if "random", generate a random pick.
 */
export function resolvePick(pick: SidePick): CoinSide {
  if (pick === "random") return flipCoin();
  return pick;
}

// ---------------------------------------------------------------------------
// Win tier classification
// ---------------------------------------------------------------------------

export type FlipWinTier = "normal" | "good" | "big" | "epic" | "jackpot";

/**
 * Classify win tier based on flip count.
 */
export function getFlipWinTier(flips: number): FlipWinTier {
  if (flips >= 11) return "jackpot";
  if (flips >= 8) return "epic";
  if (flips >= 4) return "big";
  if (flips >= 2) return "good";
  return "normal";
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/**
 * Color for multiplier display by tier (based on spec §4.4).
 */
export function getFlipMultiplierColor(flips: number): string {
  if (flips >= 11) return "#F59E0B"; // gold — jackpot
  if (flips >= 8) return "#EF4444"; // red — epic
  if (flips >= 4) return "#F97316"; // orange — big
  return "#00E5A0"; // green — normal/good
}

/**
 * Format multiplier for display.
 * Uses commas for large numbers, 2 decimal places.
 */
export function formatFlipMultiplier(multiplier: number): string {
  if (multiplier >= 1_000_000) {
    return `${(multiplier / 1_000_000).toFixed(2)}Mx`;
  }
  if (multiplier >= 1000) {
    return `${multiplier.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`;
  }
  return `${multiplier.toFixed(2)}x`;
}

/**
 * Format large currency values with abbreviations if space constrained.
 */
export function formatFlipCurrency(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Milestone multiplier labels for chain tracker
// ---------------------------------------------------------------------------

export const CHAIN_MILESTONES: { flip: number; label: string }[] = [
  { flip: 1, label: "1.96x" },
  { flip: 5, label: "31.36x" },
  { flip: 10, label: "1,003x" },
  { flip: 15, label: "32,112x" },
  { flip: 20, label: "1,027,604x" },
];
