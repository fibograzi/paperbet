import type { BetResult } from "@/lib/types";

// ---------------------------------------------------------------------------
// Game phases
// ---------------------------------------------------------------------------

export type CrashPhase = "betting" | "running" | "crashed";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface CrashConfig {
  betAmount: number;
  autoCashout: number | null; // null = manual only
}

// ---------------------------------------------------------------------------
// Round result (bet history entry)
// ---------------------------------------------------------------------------

export interface CrashBetResult extends BetResult {
  crashPoint: number;
  cashedOut: boolean;
  cashoutMultiplier: number | null;
}

// ---------------------------------------------------------------------------
// Session stats (crash-specific)
// ---------------------------------------------------------------------------

export interface CrashSessionStats {
  totalBets: number;
  totalWagered: number;
  totalReturns: number;
  netProfit: number;
  biggestWin: number;
  biggestLoss: number;
  bestCashout: number;
  averageCashout: number;
  winRate: number;
  totalWins: number;
  cashoutCount: number;
}

// ---------------------------------------------------------------------------
// Auto-play state
// ---------------------------------------------------------------------------

export interface CrashAutoPlayState {
  active: boolean;
  totalCount: number | null; // null = infinite
  currentCount: number;
  cashoutAt: number; // required for auto-play
  onWin: "same" | "increase" | "reset";
  onLoss: "same" | "increase" | "reset";
  increaseOnWinPercent: number;
  increaseOnLossPercent: number;
  baseBet: number;
  stopOnProfit: number | null;
  stopOnLoss: number | null;
  startingNetProfit: number;
}

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------

export interface CrashGameState {
  balance: number;
  config: CrashConfig;
  phase: CrashPhase;
  currentMultiplier: number;
  crashPoint: number | null;
  countdown: number; // seconds remaining in betting phase
  hasBet: boolean;
  betQueued: boolean; // bet queued for next round (during running/crashed)
  cashedOut: boolean;
  cashoutMultiplier: number | null;
  previousCrashPoints: number[]; // last 20 for badge display
  history: CrashBetResult[];
  stats: CrashSessionStats;
  sessionRoundCount: number;
  showSessionReminder: boolean;
  showPostSessionNudge: boolean;
  postSessionNudgeDismissed: boolean;
  autoPlay: CrashAutoPlayState;
  instantMode: boolean; // skip countdown/animation for fast autobet testing
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type CrashAction =
  | { type: "SET_BET_AMOUNT"; amount: number }
  | { type: "SET_AUTO_CASHOUT"; value: number | null }
  | { type: "PLACE_BET" }
  | { type: "CANCEL_BET" }
  | { type: "QUEUE_BET" }
  | { type: "CANCEL_QUEUE" }
  | { type: "TOGGLE_INSTANT_MODE" }
  | { type: "START_COUNTDOWN"; crashPoint: number }
  | { type: "COUNTDOWN_TICK" }
  | { type: "START_ROUND" }
  | { type: "UPDATE_MULTIPLIER"; multiplier: number }
  | { type: "CASH_OUT" }
  | { type: "CRASH" }
  | { type: "ROUND_COMPLETE"; result: CrashBetResult }
  | { type: "AUTO_PLAY_START"; config: Omit<CrashAutoPlayState, "active" | "currentCount" | "startingNetProfit"> }
  | { type: "AUTO_PLAY_TICK" }
  | { type: "AUTO_PLAY_STOP" }
  | { type: "AUTO_PLAY_ADJUST_BET"; amount: number }
  | { type: "ADD_CRASH_POINT"; crashPoint: number }
  | { type: "DISMISS_SESSION_REMINDER" }
  | { type: "DISMISS_POST_SESSION_NUDGE" }
  | { type: "RESET_BALANCE" };

// ---------------------------------------------------------------------------
// Chart data point (for canvas drawing)
// ---------------------------------------------------------------------------

export interface ChartPoint {
  time: number; // seconds elapsed
  multiplier: number;
}
