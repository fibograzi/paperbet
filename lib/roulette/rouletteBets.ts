import type { BetType, BetCategory, WheelType } from "./rouletteTypes";
import { getPocketColor } from "./rouletteEngine";

// ---------------------------------------------------------------------------
// Bet definition
// ---------------------------------------------------------------------------

export interface BetDefinition {
  type: BetType;
  category: BetCategory;
  name: string;
  payout: number;        // e.g. 35 means 35:1 (35 + original = 36x return)
  coverage: number;       // Number of pockets covered
  description: string;
}

// ---------------------------------------------------------------------------
// Registry of all 10 bet types
// ---------------------------------------------------------------------------

export const BET_REGISTRY: Record<BetType, BetDefinition> = {
  straight: {
    type: "straight",
    category: "inside",
    name: "Straight Up",
    payout: 35,
    coverage: 1,
    description: "Bet on a single number",
  },
  split: {
    type: "split",
    category: "inside",
    name: "Split",
    payout: 17,
    coverage: 2,
    description: "Bet on two adjacent numbers",
  },
  street: {
    type: "street",
    category: "inside",
    name: "Street",
    payout: 11,
    coverage: 3,
    description: "Bet on a row of three numbers",
  },
  corner: {
    type: "corner",
    category: "inside",
    name: "Corner",
    payout: 8,
    coverage: 4,
    description: "Bet on four numbers that share a corner",
  },
  sixLine: {
    type: "sixLine",
    category: "inside",
    name: "Six Line",
    payout: 5,
    coverage: 6,
    description: "Bet on two adjacent rows (6 numbers)",
  },
  dozen: {
    type: "dozen",
    category: "outside",
    name: "Dozen",
    payout: 2,
    coverage: 12,
    description: "Bet on 1-12, 13-24, or 25-36",
  },
  column: {
    type: "column",
    category: "outside",
    name: "Column",
    payout: 2,
    coverage: 12,
    description: "Bet on a column of 12 numbers",
  },
  redBlack: {
    type: "redBlack",
    category: "outside",
    name: "Red/Black",
    payout: 1,
    coverage: 18,
    description: "Bet on all red or all black numbers",
  },
  evenOdd: {
    type: "evenOdd",
    category: "outside",
    name: "Even/Odd",
    payout: 1,
    coverage: 18,
    description: "Bet on all even or all odd numbers",
  },
  highLow: {
    type: "highLow",
    category: "outside",
    name: "High/Low",
    payout: 1,
    coverage: 18,
    description: "Bet on 1-18 (Low) or 19-36 (High)",
  },
};

// ---------------------------------------------------------------------------
// Probability calculations
// ---------------------------------------------------------------------------

export function getBetProbability(betType: BetType, wheelType: WheelType): number {
  const totalPockets = wheelType === "european" ? 37 : 38;
  return BET_REGISTRY[betType].coverage / totalPockets;
}

export function getBetHouseEdge(betType: BetType, wheelType: WheelType): number {
  const prob = getBetProbability(betType, wheelType);
  const payout = BET_REGISTRY[betType].payout;
  // EV = prob * payout - (1 - prob) * 1
  // House edge = -EV as percentage
  const ev = prob * payout - (1 - prob);
  return -ev * 100;
}

export function getBetEV(betType: BetType, wheelType: WheelType, betAmount: number = 1): number {
  const prob = getBetProbability(betType, wheelType);
  const payout = BET_REGISTRY[betType].payout;
  return (prob * payout - (1 - prob)) * betAmount;
}

// ---------------------------------------------------------------------------
// Number set helpers for outside bets
// ---------------------------------------------------------------------------

export function getRedNumbers(): number[] {
  return Array.from({ length: 36 }, (_, i) => i + 1).filter(
    (n) => getPocketColor(n) === "red"
  );
}

export function getBlackNumbers(): number[] {
  return Array.from({ length: 36 }, (_, i) => i + 1).filter(
    (n) => getPocketColor(n) === "black"
  );
}

export function getEvenNumbers(): number[] {
  return Array.from({ length: 36 }, (_, i) => i + 1).filter((n) => n % 2 === 0);
}

export function getOddNumbers(): number[] {
  return Array.from({ length: 36 }, (_, i) => i + 1).filter((n) => n % 2 !== 0);
}

export function getLowNumbers(): number[] {
  return Array.from({ length: 18 }, (_, i) => i + 1);
}

export function getHighNumbers(): number[] {
  return Array.from({ length: 18 }, (_, i) => i + 19);
}

export function getDozenNumbers(dozen: 1 | 2 | 3): number[] {
  const start = (dozen - 1) * 12 + 1;
  return Array.from({ length: 12 }, (_, i) => start + i);
}

export function getColumnNumbers(column: 1 | 2 | 3): number[] {
  return Array.from({ length: 12 }, (_, i) => column + i * 3);
}

export function getStreetNumbers(row: number): number[] {
  const start = (row - 1) * 3 + 1;
  return [start, start + 1, start + 2];
}

// ---------------------------------------------------------------------------
// All bet types as array for iteration
// ---------------------------------------------------------------------------

export function getAllBetTypes(): BetDefinition[] {
  return Object.values(BET_REGISTRY);
}

export function getInsideBets(): BetDefinition[] {
  return getAllBetTypes().filter((b) => b.category === "inside");
}

export function getOutsideBets(): BetDefinition[] {
  return getAllBetTypes().filter((b) => b.category === "outside");
}
