import type { BetType, WheelType } from "./rouletteTypes";
import { BET_REGISTRY, getBetProbability, getBetHouseEdge, getBetEV } from "./rouletteBets";

// ---------------------------------------------------------------------------
// Odds table row — computed stats for a single bet type
// ---------------------------------------------------------------------------

export interface OddsRow {
  betType: BetType;
  name: string;
  category: "inside" | "outside";
  payout: string;          // e.g. "35:1"
  coverage: number;
  probabilityEuro: number;
  probabilityAmerican: number;
  houseEdgeEuro: number;
  houseEdgeAmerican: number;
  evPerDollarEuro: number;
  evPerDollarAmerican: number;
}

// ---------------------------------------------------------------------------
// Build complete odds table
// ---------------------------------------------------------------------------

export function buildOddsTable(): OddsRow[] {
  return Object.values(BET_REGISTRY).map((def) => ({
    betType: def.type,
    name: def.name,
    category: def.category,
    payout: `${def.payout}:1`,
    coverage: def.coverage,
    probabilityEuro: getBetProbability(def.type, "european"),
    probabilityAmerican: getBetProbability(def.type, "american"),
    houseEdgeEuro: getBetHouseEdge(def.type, "european"),
    houseEdgeAmerican: getBetHouseEdge(def.type, "american"),
    evPerDollarEuro: getBetEV(def.type, "european", 1),
    evPerDollarAmerican: getBetEV(def.type, "american", 1),
  }));
}

// ---------------------------------------------------------------------------
// Streak probability — chance of N consecutive outcomes
// ---------------------------------------------------------------------------

export function streakProbability(
  betType: BetType,
  wheelType: WheelType,
  streakLength: number,
  streakType: "win" | "loss",
): number {
  const p = getBetProbability(betType, wheelType);
  const prob = streakType === "win" ? p : 1 - p;
  return Math.pow(prob, streakLength);
}

// ---------------------------------------------------------------------------
// Expected spins to see a win
// ---------------------------------------------------------------------------

export function expectedSpinsToWin(betType: BetType, wheelType: WheelType): number {
  const p = getBetProbability(betType, wheelType);
  return 1 / p;
}

// ---------------------------------------------------------------------------
// Cumulative loss after N consecutive losses (for progression systems)
// ---------------------------------------------------------------------------

export function cumulativeMartingaleLoss(baseBet: number, consecutiveLosses: number): number {
  // Sum of geometric series: baseBet * (2^n - 1)
  return baseBet * (Math.pow(2, consecutiveLosses) - 1);
}

export function martingaleBetAtStep(baseBet: number, step: number): number {
  return baseBet * Math.pow(2, step);
}

// ---------------------------------------------------------------------------
// Long-run expected loss
// ---------------------------------------------------------------------------

export function expectedLoss(
  betType: BetType,
  wheelType: WheelType,
  betAmount: number,
  numberOfSpins: number,
): number {
  const ev = getBetEV(betType, wheelType, betAmount);
  return ev * numberOfSpins; // EV is negative, so this gives expected loss
}

// ---------------------------------------------------------------------------
// Probability of being ahead after N spins (normal approximation)
// ---------------------------------------------------------------------------

export function probabilityOfProfit(
  betType: BetType,
  wheelType: WheelType,
  numberOfSpins: number,
): number {
  const p = getBetProbability(betType, wheelType);
  const payout = BET_REGISTRY[betType].payout;

  // Mean and variance per spin (betting 1 unit)
  const meanPerSpin = p * payout - (1 - p);
  const variancePerSpin = p * payout * payout + (1 - p) - meanPerSpin * meanPerSpin;

  const totalMean = meanPerSpin * numberOfSpins;
  const totalStdDev = Math.sqrt(variancePerSpin * numberOfSpins);

  if (totalStdDev === 0) return totalMean > 0 ? 1 : 0;

  // P(profit > 0) = P(Z > -totalMean/totalStdDev)
  const z = -totalMean / totalStdDev;
  return 1 - normalCdf(z);
}

// ---------------------------------------------------------------------------
// Standard normal CDF approximation (Abramowitz & Stegun)
// ---------------------------------------------------------------------------

function normalCdf(z: number): number {
  if (z < -8) return 0;
  if (z > 8) return 1;

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}
