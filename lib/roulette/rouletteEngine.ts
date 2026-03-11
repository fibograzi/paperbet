import type { WheelType, Pocket, RouletteColor, SpinResult, PlacedBet, BetOutcome } from "./rouletteTypes";
import { BET_REGISTRY } from "./rouletteBets";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const INITIAL_BALANCE = 1000;
export const MIN_BET = 0.10;
export const MAX_BET = 500;
export const MAX_HISTORY = 200;
export const MAX_PREVIOUS_RESULTS = 20;
export const CHIP_VALUES = [0.10, 0.50, 1, 5, 10, 25, 50, 100];
export const POST_SESSION_NUDGE_THRESHOLD = 25;

// Spin animation durations (ms)
export const SPIN_DURATION = 4000;
export const RESULT_DISPLAY_DURATION = 3000;

// ---------------------------------------------------------------------------
// Red numbers (same for European and American)
// ---------------------------------------------------------------------------

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

// ---------------------------------------------------------------------------
// Pocket color
// ---------------------------------------------------------------------------

export function getPocketColor(num: number): RouletteColor {
  if (num === 0 || num === -1) return "green"; // 0 and 00
  return RED_NUMBERS.has(num) ? "red" : "black";
}

// ---------------------------------------------------------------------------
// Wheel configurations
// ---------------------------------------------------------------------------

function buildPockets(type: WheelType): Pocket[] {
  const pockets: Pocket[] = [];

  // 0 always present
  pockets.push({ number: 0, label: "0", color: "green" });

  // 00 for American
  if (type === "american") {
    pockets.push({ number: -1, label: "00", color: "green" });
  }

  // 1–36
  for (let i = 1; i <= 36; i++) {
    pockets.push({
      number: i,
      label: String(i),
      color: getPocketColor(i),
    });
  }

  return pockets;
}

// European wheel order (physical layout)
const EUROPEAN_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36,
  11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9,
  22, 18, 29, 7, 28, 12, 35, 3, 26,
];

// American wheel order (physical layout)
const AMERICAN_ORDER = [
  0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15,
  3, 24, 36, 13, 1, -1, 27, 10, 25, 29, 12, 8, 19, 31,
  18, 6, 21, 33, 16, 4, 23, 35, 14, 2,
];

export function getWheelOrder(type: WheelType): number[] {
  return type === "european" ? EUROPEAN_ORDER : AMERICAN_ORDER;
}

export function getWheelPockets(type: WheelType): Pocket[] {
  return buildPockets(type);
}

export function getPocketCount(type: WheelType): number {
  return type === "european" ? 37 : 38;
}

export function getHouseEdge(type: WheelType): number {
  return type === "european" ? 2.7027 : 5.2632;
}

// ---------------------------------------------------------------------------
// RNG — cryptographically secure spin
// ---------------------------------------------------------------------------

export function generateSpin(type: WheelType): SpinResult {
  const pocketCount = getPocketCount(type);
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  const index = buffer[0] % pocketCount;

  // Map index to actual pocket number
  const pockets = buildPockets(type);
  const pocket = pockets[index];

  return {
    pocket,
    winningNumber: pocket.number,
  };
}

// ---------------------------------------------------------------------------
// Bet evaluation
// ---------------------------------------------------------------------------

export function evaluateBet(bet: PlacedBet, spinResult: SpinResult): BetOutcome {
  const won = bet.numbers.includes(spinResult.winningNumber);
  const betDef = BET_REGISTRY[bet.type];
  const payout = won ? bet.amount * (betDef.payout + 1) : 0;
  const profit = payout - bet.amount;

  return { bet, won, payout, profit };
}

export function evaluateAllBets(bets: PlacedBet[], spinResult: SpinResult): BetOutcome[] {
  return bets.map((bet) => evaluateBet(bet, spinResult));
}

// ---------------------------------------------------------------------------
// Payout info
// ---------------------------------------------------------------------------

export function getPayoutMultiplier(betType: PlacedBet["type"]): number {
  return BET_REGISTRY[betType].payout;
}
