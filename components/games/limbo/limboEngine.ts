import type { LimboAutoPlayConfig } from "./limboTypes";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const RTP = 0.99;
export const MIN_BET = 0.10;
export const MAX_BET = 1000.00;
export const DEFAULT_BET = 1.00;
export const MIN_TARGET = 1.01;
export const MAX_TARGET = 10000;
export const DEFAULT_TARGET = 2.00;
export const MAX_RESULT_CAP = 10000;
export const INITIAL_BALANCE = 1000;
export const MAX_HISTORY = 500;
export const MAX_PREVIOUS_RESULTS = 20;
export const SESSION_REMINDER_THRESHOLD = 200;
export const POST_SESSION_NUDGE_THRESHOLD = 20;
export const AUTO_PLAY_MAX_CONSECUTIVE = 500;

// Animation durations (ms)
export const ANIM_DURATION_NORMAL = 800;
export const ANIM_DURATION_FAST = 300;
export const ANIM_DURATION_SKIP = 0;
export const RESULT_SETTLE_DURATION = 200;
export const AUTO_SPEED_NORMAL = 2000;
export const AUTO_SPEED_FAST = 1000;
export const AUTO_SPEED_TURBO = 500;

// ---------------------------------------------------------------------------
// Random number generation — Crash point formula
// ---------------------------------------------------------------------------

/**
 * Generate a result multiplier using Stake's Limbo formula.
 * Formula: max(1, floor(99 / u) / 100) where u ~ Uniform[0, 1)
 * P(result >= m) = 0.99/m — exactly 1% house edge.
 */
export function generateCrashPoint(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  // u in [0, 1) — uniform with full 32-bit precision
  const u = buffer[0] / 4294967296;
  // Handle u = 0 edge case (division by zero)
  if (u === 0) return MAX_RESULT_CAP;
  const raw = Math.floor(99 / u) / 100;
  return Math.min(MAX_RESULT_CAP, Math.max(1.00, raw));
}

// ---------------------------------------------------------------------------
// Core math
// ---------------------------------------------------------------------------

/** Calculate win chance from target multiplier */
export function calculateWinChance(target: number): number {
  return Math.max(0.0099, Math.min(98.02, 99 / target));
}

/** Calculate target multiplier from win chance */
export function calculateTargetFromWinChance(winChance: number): number {
  const clamped = Math.max(0.0099, Math.min(98.02, winChance));
  return Math.max(MIN_TARGET, Math.min(MAX_TARGET, Math.round((99 / clamped) * 100) / 100));
}

/** Determine if a result is a win */
export function isWin(result: number, target: number): boolean {
  return result >= target;
}

/** Check if result is a near miss (within 10% of target but loss) */
export function isNearMiss(result: number, target: number): boolean {
  if (result >= target) return false; // not a loss
  const threshold = target * 0.9;
  return result >= threshold;
}

/** Check if result is an exact hit */
export function isExactHit(result: number, target: number): boolean {
  return Math.abs(result - target) < 0.005;
}

/** Calculate payout on win */
export function calculatePayout(betAmount: number, target: number): number {
  return Math.floor(betAmount * target * 100) / 100;
}

/** Calculate profit on win (net) */
export function calculateProfitOnWin(betAmount: number, target: number): number {
  return Math.floor(betAmount * (target - 1) * 100) / 100;
}

/** Clamp bet amount */
export function clampBet(amount: number): number {
  return Math.max(MIN_BET, Math.min(MAX_BET, Math.round(amount * 100) / 100));
}

/** Clamp target multiplier */
export function clampTarget(target: number): number {
  return Math.max(MIN_TARGET, Math.min(MAX_TARGET, Math.round(target * 100) / 100));
}

// ---------------------------------------------------------------------------
// Auto-bet adjustments
// ---------------------------------------------------------------------------

export function applyAutoBetAdjustments(
  isWinResult: boolean,
  betAmount: number,
  baseBetAmount: number,
  targetMultiplier: number,
  config: LimboAutoPlayConfig,
): { newBetAmount: number; newTarget: number } {
  let newBet = betAmount;
  let newTarget = targetMultiplier;

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
    newTarget = clampTarget(targetMultiplier + targetValue);
  } else if (targetAction === "decrease") {
    newTarget = clampTarget(targetMultiplier - targetValue);
  }

  newBet = clampBet(newBet);

  return { newBetAmount: newBet, newTarget };
}

// ---------------------------------------------------------------------------
// Win tier classification
// ---------------------------------------------------------------------------

export type LimboWinTier = "normal" | "good" | "big" | "jackpot" | "moonshot";

export function getWinTier(target: number, result: number): LimboWinTier {
  if (result >= 1000) return "moonshot";
  if (target >= 100) return "jackpot";
  if (target >= 10) return "big";
  if (target >= 2) return "good";
  return "normal";
}

// ---------------------------------------------------------------------------
// Result badge color
// ---------------------------------------------------------------------------

export function getResultBadgeColor(result: number): { bg: string; text: string } {
  if (result >= 100) return { bg: "rgba(245,158,11,0.15)", text: "#F59E0B" };
  if (result >= 10) return { bg: "rgba(249,115,22,0.10)", text: "#F97316" };
  if (result >= 2) return { bg: "rgba(0,229,160,0.10)", text: "#00E5A0" };
  if (result > 1.005) return { bg: "#374151", text: "#9CA3AF" };
  return { bg: "rgba(239,68,68,0.15)", text: "#EF4444" }; // 1.00x floor
}

// ---------------------------------------------------------------------------
// Win chance color
// ---------------------------------------------------------------------------

export function getWinChanceColor(winChance: number): string {
  if (winChance >= 75) return "#00E5A0";
  if (winChance >= 50) return "#F9FAFB";
  if (winChance >= 25) return "#F59E0B";
  if (winChance >= 10) return "#F97316";
  return "#EF4444";
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** Format result multiplier with proper display (always 2 decimals) */
export function formatLimboResult(result: number): string {
  if (result >= 1000) {
    return result.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "x";
  }
  return result.toFixed(2) + "x";
}

/** Format result without the "x" suffix (for the big counter display) */
export function formatResultNumber(result: number): string {
  if (result >= 1000) {
    return result.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return result.toFixed(2);
}

// ---------------------------------------------------------------------------
// Auto-play speed helpers
// ---------------------------------------------------------------------------

export function getAutoPlayDelay(speed: LimboAutoPlayConfig["speed"]): number {
  switch (speed) {
    case "normal": return AUTO_SPEED_NORMAL;
    case "fast": return AUTO_SPEED_FAST;
    case "turbo": return AUTO_SPEED_TURBO;
    default: return AUTO_SPEED_NORMAL;
  }
}

/** Get animation duration based on speed settings */
export function getAnimDuration(
  animSpeed: "normal" | "fast" | "skip",
  autoSpeed?: LimboAutoPlayConfig["speed"],
): number {
  if (animSpeed === "skip") return ANIM_DURATION_SKIP;
  if (animSpeed === "fast") return ANIM_DURATION_FAST;
  if (autoSpeed === "turbo" || autoSpeed === "fast") return ANIM_DURATION_FAST;
  return ANIM_DURATION_NORMAL;
}
