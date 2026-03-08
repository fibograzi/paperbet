import type { KenoDifficulty, KenoAutoPlayConfig } from "./kenoTypes";
import { KENO_MULTIPLIERS } from "./kenoMultipliers";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const POOL_SIZE = 40;
export const DRAW_COUNT = 10;
export const MAX_PICKS = 10;
export const MIN_BET = 0.10;
export const MAX_BET = 1000.00;
export const DEFAULT_BET = 1.00;
export const INITIAL_BALANCE = 1000;
export const MAX_HISTORY = 500;
export const MAX_PREVIOUS_RESULTS = 15;
export const SESSION_REMINDER_THRESHOLD = 100;
export const POST_SESSION_NUDGE_THRESHOLD = 10;
export const AUTO_PLAY_MAX_CONSECUTIVE = 500;

// Animation timing (ms)
export const TILE_REVEAL_STAGGER = 100;    // delay between each tile reveal
export const TILE_FLIP_DURATION = 300;      // individual tile flip
export const RESULT_DISPLAY_DELAY = 200;    // after last reveal before showing result
export const RESULT_DISPLAY_DURATION = 1500; // how long result stays
export const AUTO_SPEED_NORMAL = 2000;
export const AUTO_SPEED_FAST = 1000;
export const AUTO_SPEED_TURBO = 500;
export const BOARD_RESET_DURATION = 200;    // fade-reset between rounds

// ---------------------------------------------------------------------------
// Fisher-Yates Draw — 10 unique numbers from 1–40
// ---------------------------------------------------------------------------

export function drawNumbers(): number[] {
  const pool = Array.from({ length: POOL_SIZE }, (_, i) => i + 1);
  const drawn: number[] = [];

  for (let i = 0; i < DRAW_COUNT; i++) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const remainingSize = POOL_SIZE - i;
    const index = array[0] % remainingSize;
    drawn.push(pool[index]);
    pool[index] = pool[remainingSize - 1];
  }

  return drawn;
}

// ---------------------------------------------------------------------------
// Match detection
// ---------------------------------------------------------------------------

export function getMatches(selected: number[], drawn: number[]): number[] {
  const drawnSet = new Set(drawn);
  return selected.filter((n) => drawnSet.has(n));
}

// ---------------------------------------------------------------------------
// Multiplier lookup
// ---------------------------------------------------------------------------

export function getMultiplier(
  difficulty: KenoDifficulty,
  picks: number,
  matchCount: number,
): number {
  return KENO_MULTIPLIERS[difficulty]?.[picks]?.[matchCount] ?? 0;
}

// ---------------------------------------------------------------------------
// Payout / profit
// ---------------------------------------------------------------------------

export function calculatePayout(betAmount: number, multiplier: number): number {
  return Math.floor(betAmount * multiplier * 100) / 100;
}

// ---------------------------------------------------------------------------
// Bet clamping
// ---------------------------------------------------------------------------

export function clampBet(amount: number): number {
  return Math.max(MIN_BET, Math.min(MAX_BET, Math.round(amount * 100) / 100));
}

// ---------------------------------------------------------------------------
// Random pick — select N random numbers from 1–40
// ---------------------------------------------------------------------------

export function randomPick(count: number = MAX_PICKS): number[] {
  const pool = Array.from({ length: POOL_SIZE }, (_, i) => i + 1);
  const picked: number[] = [];

  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * (POOL_SIZE - i));
    picked.push(pool[idx]);
    pool[idx] = pool[POOL_SIZE - 1 - i];
  }

  return picked.sort((a, b) => a - b);
}

// ---------------------------------------------------------------------------
// Win tier classification
// ---------------------------------------------------------------------------

export type KenoWinTier =
  | "loss"
  | "micro"
  | "breakeven"
  | "small"
  | "good"
  | "big"
  | "epic"
  | "jackpot";

export function getWinTier(multiplier: number): KenoWinTier {
  if (multiplier >= 800) return "jackpot";
  if (multiplier >= 300) return "epic";
  if (multiplier >= 50) return "big";
  if (multiplier >= 5) return "good";
  if (multiplier >= 1.5) return "small";
  if (multiplier >= 1) return "breakeven";
  if (multiplier > 0) return "micro";
  return "loss";
}

// ---------------------------------------------------------------------------
// Multiplier badge color (by multiplier value)
// ---------------------------------------------------------------------------

export function getBadgeColor(multiplier: number): { bg: string; text: string; glow?: string } {
  if (multiplier >= 800) return { bg: "#F59E0B", text: "#FFFFFF", glow: "0 0 12px rgba(245,158,11,0.5)" };
  if (multiplier >= 300) return { bg: "#EF4444", text: "#FFFFFF", glow: "0 0 8px rgba(239,68,68,0.4)" };
  if (multiplier >= 50) return { bg: "#EF4444", text: "#FFFFFF" };
  if (multiplier >= 5) return { bg: "#F97316", text: "#FFFFFF" };
  if (multiplier >= 1) return { bg: "#00E5A0", text: "#FFFFFF" };
  if (multiplier > 0) return { bg: "#6B7280", text: "#FFFFFF" };
  return { bg: "#374151", text: "#4B5563" };
}

// ---------------------------------------------------------------------------
// Difficulty colors
// ---------------------------------------------------------------------------

export const DIFFICULTY_COLORS: Record<KenoDifficulty, string> = {
  classic: "#00E5A0",
  low: "#00B4D8",
  medium: "#F59E0B",
  high: "#EF4444",
};

export const DIFFICULTY_LABELS: Record<KenoDifficulty, string> = {
  classic: "Classic",
  low: "Low",
  medium: "Medium",
  high: "High",
};

// ---------------------------------------------------------------------------
// Result badge for history strip
// ---------------------------------------------------------------------------

export function getResultStripColor(multiplier: number, isWin: boolean): string {
  if (multiplier >= 800) return "#F59E0B";  // gold
  if (multiplier >= 50) return "#EF4444";   // red
  if (multiplier >= 5) return "#F97316";    // orange
  if (isWin) return "#00E5A0";             // green
  return "#374151";                         // gray (loss)
}

// ---------------------------------------------------------------------------
// Format multiplier for display
// ---------------------------------------------------------------------------

export function formatKenoMultiplier(multiplier: number): string {
  if (multiplier >= 1000) {
    return multiplier.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "x";
  }
  return multiplier.toFixed(2) + "x";
}

// ---------------------------------------------------------------------------
// Auto-play speed helper
// ---------------------------------------------------------------------------

export function getAutoPlayDelay(speed: KenoAutoPlayConfig["speed"]): number {
  switch (speed) {
    case "normal": return AUTO_SPEED_NORMAL;
    case "fast": return AUTO_SPEED_FAST;
    case "turbo": return AUTO_SPEED_TURBO;
    default: return AUTO_SPEED_NORMAL;
  }
}

// ---------------------------------------------------------------------------
// Auto-bet adjustments
// ---------------------------------------------------------------------------

export function applyAutoBetAdjustment(
  isWin: boolean,
  betAmount: number,
  baseBetAmount: number,
  config: KenoAutoPlayConfig,
): number {
  const action = isWin ? config.onWinAction : config.onLossAction;
  const value = isWin ? config.onWinValue : config.onLossValue;

  if (action === "increase_percent") {
    return clampBet(betAmount * (1 + value / 100));
  }
  // "reset"
  return baseBetAmount;
}
