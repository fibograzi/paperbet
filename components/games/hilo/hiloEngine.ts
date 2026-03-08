/**
 * HiLo game engine — pure math functions.
 *
 * Card system: 52 cards, 13 ranks (A=1 to K=13), 4 suits.
 * Infinite deck: each draw is independent with equal probability.
 * House edge: 1% (RTP = 99%).
 *
 * Multiplier formula: (1 / probability) × 0.99
 * Cumulative multiplier: product of all individual round multipliers.
 */

import type {
  Suit,
  Rank,
  PlayingCard,
  Prediction,
  HiLoPredictionInfo,
  AutoStrategy,
} from "./hiloTypes";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RTP = 0.99;

export const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

export const SUITS: Suit[] = ["diamonds", "hearts", "spades", "clubs"];

export const RANK_VALUES: Record<Rank, number> = {
  A: 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  diamonds: "♦",
  hearts: "♥",
  spades: "♠",
  clubs: "♣",
};

/** Index mapping: 0-3=2, 4-7=3, ... 44-47=K, 48-51=A */
const INDEX_RANK_ORDER: Rank[] = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

export const MAX_SKIPS_PER_ROUND = 52;
export const CARD_REVEAL_DURATION = 500; // ms
export const SKIP_ANIMATION_DURATION = 400; // ms
export const DEAL_ANIMATION_DURATION = 600; // ms
export const CASHOUT_ANIMATION_DURATION = 800; // ms
export const LOSS_ANIMATION_DURATION = 1500; // ms

// ---------------------------------------------------------------------------
// Card generation
// ---------------------------------------------------------------------------

/**
 * Draw a random card using crypto.getRandomValues().
 */
export function drawCard(): PlayingCard {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const float = array[0] / (0xffffffff + 1); // [0, 1)
  const index = Math.floor(float * 52);
  return cardFromIndex(index);
}

/**
 * Convert a card index (0-51) to a PlayingCard.
 */
export function cardFromIndex(index: number): PlayingCard {
  const rankIdx = Math.floor(index / 4);
  const suitIdx = index % 4;
  const rank = INDEX_RANK_ORDER[rankIdx];
  const suit = SUITS[suitIdx];

  return {
    rank,
    suit,
    index,
    rankValue: RANK_VALUES[rank],
    suitColor: suit === "diamonds" || suit === "hearts" ? "red" : "black",
  };
}

// ---------------------------------------------------------------------------
// Probability & multiplier calculations
// ---------------------------------------------------------------------------

/**
 * Calculate prediction info for a given card.
 */
export function getPredictionInfo(card: PlayingCard): HiLoPredictionInfo {
  const rankValue = card.rankValue; // 1 (A) to 13 (K)

  // Higher or Same: count of ranks >= current rank (includes current)
  const higherCount = 13 - rankValue + 1;
  // Lower or Same: count of ranks <= current rank (includes current)
  const lowerCount = rankValue;

  const higherProbability = higherCount / 13;
  const lowerProbability = lowerCount / 13;

  const higherMultiplier =
    Math.round(((1 / higherProbability) * RTP) * 100) / 100;
  const lowerMultiplier =
    Math.round(((1 / lowerProbability) * RTP) * 100) / 100;

  return {
    higherProbability,
    lowerProbability,
    higherMultiplier,
    lowerMultiplier,
    higherAvailable: rankValue < 13, // not available on King
    lowerAvailable: rankValue > 1, // not available on Ace
  };
}

/**
 * Resolve a prediction: is the new card higher/lower/same than current?
 */
export function resolvePrediction(
  currentCard: PlayingCard,
  newCard: PlayingCard,
  prediction: Prediction
): boolean {
  if (prediction === "higher") {
    return newCard.rankValue >= currentCard.rankValue;
  }
  return newCard.rankValue <= currentCard.rankValue;
}

/**
 * Get the multiplier for a specific prediction on a given card.
 */
export function getMultiplierForPrediction(
  card: PlayingCard,
  prediction: Prediction
): number {
  const info = getPredictionInfo(card);
  return prediction === "higher"
    ? info.higherMultiplier
    : info.lowerMultiplier;
}

// ---------------------------------------------------------------------------
// Auto-play prediction
// ---------------------------------------------------------------------------

/**
 * Auto-play: determine the prediction based on strategy.
 */
export function autoPredict(
  card: PlayingCard,
  strategy: AutoStrategy
): Prediction | "skip" {
  const info = getPredictionInfo(card);

  switch (strategy) {
    case "always_higher":
      return info.higherAvailable ? "higher" : "skip";
    case "always_lower":
      return info.lowerAvailable ? "lower" : "skip";
    case "smart":
      // Pick option with higher probability; on 7 (50/50), default to higher
      if (!info.higherAvailable) return "lower";
      if (!info.lowerAvailable) return "higher";
      return info.higherProbability >= info.lowerProbability
        ? "higher"
        : "lower";
  }
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/**
 * Format card for display: "K♠", "7♥", "10♦"
 */
export function formatCard(card: PlayingCard): string {
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
}

/**
 * Color for cumulative multiplier display by tier.
 */
export function getMultiplierColor(multiplier: number): string {
  if (multiplier >= 500) return "#F59E0B"; // gold
  if (multiplier >= 50) return "#EF4444"; // red
  if (multiplier >= 10) return "#F97316"; // orange
  if (multiplier >= 1.5) return "#00E5A0"; // green
  return "#9CA3AF"; // muted
}

/**
 * Whether the multiplier should pulse/glow.
 */
export function getMultiplierEffect(multiplier: number): {
  pulse: boolean;
  glow: boolean;
  glowColor: string;
} {
  if (multiplier >= 500)
    return { pulse: true, glow: true, glowColor: "rgba(245, 158, 11, 0.3)" };
  if (multiplier >= 50)
    return { pulse: true, glow: true, glowColor: "rgba(239, 68, 68, 0.25)" };
  if (multiplier >= 10)
    return { pulse: true, glow: true, glowColor: "rgba(249, 115, 22, 0.2)" };
  if (multiplier >= 3)
    return { pulse: true, glow: false, glowColor: "" };
  return { pulse: false, glow: false, glowColor: "" };
}

/**
 * Format multiplier for display. 2 decimal places up to 999.99x,
 * then 0 decimals for 1000x+, abbreviate at 1M+.
 */
export function formatHiLoMultiplier(multiplier: number): string {
  if (multiplier >= 1_000_000) {
    return `${(multiplier / 1_000_000).toFixed(1)}Mx`;
  }
  if (multiplier >= 1000) {
    return `${Math.round(multiplier).toLocaleString("en-US")}x`;
  }
  return `${multiplier.toFixed(2)}x`;
}

/**
 * Calculate profit from a bet and cumulative multiplier.
 */
export function calculateProfit(
  betAmount: number,
  cumulativeMultiplier: number
): number {
  return Math.floor((betAmount * cumulativeMultiplier - betAmount) * 100) / 100;
}

/**
 * Calculate payout from a bet and cumulative multiplier.
 */
export function calculatePayout(
  betAmount: number,
  cumulativeMultiplier: number
): number {
  return Math.floor(betAmount * cumulativeMultiplier * 100) / 100;
}
