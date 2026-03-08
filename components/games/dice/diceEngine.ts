import type { DiceDirection, DiceParameters, DiceAutoPlayConfig, DiceAnimationSpeed } from "./diceTypes";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const RTP = 0.99;
export const HOUSE_EDGE = 0.01;
export const MIN_WIN_CHANCE = 0.01;  // percentage
export const MAX_WIN_CHANCE = 98.00; // percentage
export const TOTAL_OUTCOMES = 10000; // 0.00 to 99.99
export const MIN_BET = 0.10;
export const MAX_BET = 1000.00;
export const DEFAULT_BET = 1.00;
export const INITIAL_BALANCE = 1000;
export const MAX_HISTORY = 500;
export const MAX_PREVIOUS_RESULTS = 20;
export const SESSION_REMINDER_THRESHOLD = 300;
export const POST_SESSION_NUDGE_THRESHOLD = 25;
export const AUTO_PLAY_MAX_CONSECUTIVE = 1000;

// Animation durations (ms)
export const ROLL_DURATION_NORMAL = 600;
export const ROLL_DURATION_FAST = 100;
export const RESULT_SETTLE_DURATION = 200;
export const AUTO_SPEED_NORMAL = 1500;
export const AUTO_SPEED_FAST = 800;
export const AUTO_SPEED_TURBO = 300;

// ---------------------------------------------------------------------------
// Random number generation
// ---------------------------------------------------------------------------

/** Generate a random dice result between 0.00 and 99.99 */
export function generateDiceResult(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  const raw = buffer[0] % TOTAL_OUTCOMES; // 0 to 9999
  return raw / 100; // 0.00 to 99.99
}

// ---------------------------------------------------------------------------
// Core math functions
// ---------------------------------------------------------------------------

/** Clamp win chance to valid range */
export function clampWinChance(wc: number): number {
  return Math.max(MIN_WIN_CHANCE, Math.min(MAX_WIN_CHANCE, wc));
}

/** Calculate multiplier from win chance (percentage) */
export function calculateMultiplier(winChance: number): number {
  const clamped = clampWinChance(winChance);
  const raw = (RTP * 100) / clamped;
  return Math.round(raw * 10000) / 10000; // 4 decimal places
}

/** Calculate win chance from multiplier */
export function calculateWinChance(multiplier: number): number {
  const raw = (RTP * 100) / multiplier;
  return clampWinChance(Math.round(raw * 100) / 100); // 2 decimal places
}

/** Clamp multiplier to valid range */
export function clampMultiplier(multiplier: number): number {
  const minMul = calculateMultiplier(MAX_WIN_CHANCE); // ~1.0102
  const maxMul = calculateMultiplier(MIN_WIN_CHANCE); // 9900
  return Math.max(minMul, Math.min(maxMul, multiplier));
}

/** Calculate target from win chance and direction */
export function calculateTarget(winChance: number, direction: DiceDirection): number {
  if (direction === "over") {
    return Math.round((99.99 - winChance) * 100) / 100;
  }
  return Math.round(winChance * 100) / 100;
}

/** Calculate win chance from target and direction */
export function calculateWinChanceFromTarget(target: number, direction: DiceDirection): number {
  if (direction === "over") {
    return clampWinChance(Math.round((99.99 - target) * 100) / 100);
  }
  return clampWinChance(Math.round(target * 100) / 100);
}

/** Determine if a roll is a win */
export function isWin(result: number, target: number, direction: DiceDirection): boolean {
  if (direction === "over") {
    return result > target; // strictly greater
  }
  return result < target; // strictly less
}

/** Is the result exactly on the target? */
export function isOnTheLine(result: number, target: number): boolean {
  return Math.abs(result - target) < 0.005;
}

/** Calculate profit on win (net, not total payout) */
export function calculateProfitOnWin(betAmount: number, multiplier: number): number {
  return Math.floor(betAmount * (multiplier - 1) * 100) / 100;
}

/** Calculate total payout on win */
export function calculatePayout(betAmount: number, multiplier: number): number {
  return Math.floor(betAmount * multiplier * 100) / 100;
}

/** Get the swap target (mirrors target to preserve win chance) */
export function getSwapTarget(currentTarget: number): number {
  return Math.round((99.99 - currentTarget) * 100) / 100;
}

/** Clamp bet amount to valid range */
export function clampBet(amount: number): number {
  return Math.max(MIN_BET, Math.min(MAX_BET, Math.round(amount * 100) / 100));
}

// ---------------------------------------------------------------------------
// Parameter sync (4-way linked)
// ---------------------------------------------------------------------------

/** Recalculate all linked parameters from a single changed field */
export function syncParameters(
  changed: "target" | "winChance" | "multiplier" | "direction",
  value: number | DiceDirection,
  current: DiceParameters,
  betAmount: number,
): DiceParameters {
  let { target, direction, winChance, multiplier } = current;

  switch (changed) {
    case "target":
      target = value as number;
      winChance = calculateWinChanceFromTarget(target, direction);
      multiplier = calculateMultiplier(winChance);
      break;
    case "winChance":
      winChance = clampWinChance(value as number);
      multiplier = calculateMultiplier(winChance);
      target = calculateTarget(winChance, direction);
      break;
    case "multiplier":
      multiplier = clampMultiplier(value as number);
      winChance = calculateWinChance(multiplier);
      target = calculateTarget(winChance, direction);
      break;
    case "direction":
      direction = value as DiceDirection;
      // Preserve win chance, recalculate target
      target = calculateTarget(winChance, direction);
      break;
  }

  return {
    target,
    direction,
    winChance,
    multiplier,
    profitOnWin: calculateProfitOnWin(betAmount, multiplier),
  };
}

// ---------------------------------------------------------------------------
// Auto-bet adjustments
// ---------------------------------------------------------------------------

/** Apply auto-bet adjustments after a roll */
export function applyAutoBetAdjustments(
  isWinResult: boolean,
  betAmount: number,
  baseBetAmount: number,
  params: DiceParameters,
  config: DiceAutoPlayConfig,
): { newBetAmount: number; newParams: DiceParameters } {
  let newBet = betAmount;
  let newParams = { ...params };

  // Bet adjustment
  const betAction = isWinResult ? config.onWinBetAction : config.onLossBetAction;
  const betValue = isWinResult ? config.onWinBetValue : config.onLossBetValue;

  switch (betAction) {
    case "increase_percent":
      newBet = Math.min(MAX_BET, betAmount * (1 + betValue / 100));
      break;
    case "increase_flat":
      newBet = Math.min(MAX_BET, betAmount + betValue);
      break;
    case "decrease_flat":
      newBet = Math.max(MIN_BET, betAmount - betValue);
      break;
    case "reset":
      newBet = baseBetAmount;
      break;
    case "same":
    default:
      break;
  }

  // Target adjustment
  const targetAction = isWinResult ? config.onWinTargetAction : config.onLossTargetAction;
  const targetValue = isWinResult ? config.onWinTargetValue : config.onLossTargetValue;

  if (targetAction === "increase") {
    newParams = syncParameters("target", params.target + targetValue, params, newBet);
  } else if (targetAction === "decrease") {
    newParams = syncParameters("target", params.target - targetValue, params, newBet);
  }

  // Direction switch
  const shouldSwitch = isWinResult
    ? config.switchDirectionOnWin
    : config.switchDirectionOnLoss;

  if (shouldSwitch) {
    const newDirection = newParams.direction === "over" ? "under" : "over";
    newParams = syncParameters("direction", newDirection, newParams, newBet);
  }

  // Round bet to 2 decimal places, clamp to range
  newBet = clampBet(newBet);

  // Update profitOnWin with new bet
  newParams.profitOnWin = calculateProfitOnWin(newBet, newParams.multiplier);

  return { newBetAmount: newBet, newParams };
}

// ---------------------------------------------------------------------------
// Win tier classification
// ---------------------------------------------------------------------------

export type DiceWinTier = "penny" | "small" | "good" | "big" | "huge" | "jackpot";

export function getWinTier(multiplier: number): DiceWinTier {
  if (multiplier >= 100) return "jackpot";
  if (multiplier >= 50) return "huge";
  if (multiplier >= 10) return "big";
  if (multiplier >= 3) return "good";
  if (multiplier >= 1.5) return "small";
  return "penny";
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** Format result as XX.XX (always 2 decimal places, zero-padded) */
export function formatDiceResult(result: number): string {
  return result.toFixed(2).padStart(5, "0");
}

/** Format multiplier as X.XXXXx */
export function formatDiceMultiplier(multiplier: number): string {
  if (multiplier >= 1000) return `${multiplier.toFixed(2)}x`;
  if (multiplier >= 100) return `${multiplier.toFixed(2)}x`;
  return `${multiplier.toFixed(4)}x`;
}

/** Format win chance as XX.XX% */
export function formatWinChance(wc: number): string {
  return `${wc.toFixed(2)}%`;
}

// ---------------------------------------------------------------------------
// Auto-play speed helper
// ---------------------------------------------------------------------------

export function getAutoPlayDelay(speed: DiceAutoPlayConfig["speed"]): number {
  switch (speed) {
    case "normal": return AUTO_SPEED_NORMAL;
    case "fast": return AUTO_SPEED_FAST;
    case "turbo": return AUTO_SPEED_TURBO;
    default: return AUTO_SPEED_NORMAL;
  }
}

/** Get roll animation duration based on speed */
export function getRollDuration(speed: DiceAutoPlayConfig["speed"] | DiceAnimationSpeed): number {
  if (speed === "turbo" || speed === "fast") return ROLL_DURATION_FAST;
  return ROLL_DURATION_NORMAL;
}

// ---------------------------------------------------------------------------
// Default parameters
// ---------------------------------------------------------------------------

export function getDefaultParameters(betAmount: number = DEFAULT_BET): DiceParameters {
  const winChance = 49.99; // Classic coin-flip
  const multiplier = calculateMultiplier(winChance);
  const target = calculateTarget(winChance, "over");
  return {
    target,
    direction: "over",
    winChance,
    multiplier,
    profitOnWin: calculateProfitOnWin(betAmount, multiplier),
  };
}
