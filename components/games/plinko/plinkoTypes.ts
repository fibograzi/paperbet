import type { RiskLevel, PlinkoRows, BetResult } from "@/lib/types";

export interface PlinkoConfig {
  rows: PlinkoRows;
  risk: RiskLevel;
  betAmount: number;
}

export interface PlinkoBallPath {
  directions: number[]; // 0 = left, 1 = right for each row
  slotIndex: number;
  multiplier: number;
}

export interface PlinkoBetResult extends BetResult {
  risk: RiskLevel;
  rows: PlinkoRows;
  slotIndex: number;
  path: number[];
}

export interface PlinkoGameState {
  balance: number;
  config: PlinkoConfig;
  stats: PlinkoSessionStats;
  history: PlinkoBetResult[];
  isDropping: boolean;
  activeBalls: number;
  autoPlay: AutoPlayState;
  sessionBetCount: number;
  showSessionReminder: boolean;
  showPostSessionNudge: boolean;
  postSessionNudgeDismissed: boolean;
}

export interface PlinkoSessionStats {
  totalBets: number;
  totalWagered: number;
  totalReturns: number;
  netProfit: number;
  biggestWin: number;
  biggestLoss: number;
  currentStreak: number;
  bestStreak: number;
  averageMultiplier: number;
  winRate: number;
  totalWins: number;
}

export interface AutoPlayState {
  active: boolean;
  speed: AutoPlaySpeed;
  totalCount: number | null; // null = infinite
  currentCount: number;
  stopOnWinMultiplier: number | null;
  stopOnProfit: number | null;
  stopOnLoss: number | null;
  onWin: "reset" | "increase";
  onLoss: "reset" | "increase";
  increaseOnWinPercent: number;
  increaseOnLossPercent: number;
  baseBet: number;
  startBalance: number;
}

export type AutoPlaySpeed = "normal" | "fast" | "turbo";

export type PlinkoAction =
  | { type: "SET_BET_AMOUNT"; amount: number }
  | { type: "SET_RISK"; risk: RiskLevel }
  | { type: "SET_ROWS"; rows: PlinkoRows }
  | { type: "DROP_START" }
  | { type: "DROP_COMPLETE"; result: PlinkoBetResult }
  | { type: "BALL_ADDED" }
  | { type: "BALL_REMOVED" }
  | { type: "AUTO_PLAY_START"; config: Omit<AutoPlayState, "active" | "currentCount"> }
  | { type: "AUTO_PLAY_TICK" }
  | { type: "AUTO_PLAY_STOP" }
  | { type: "AUTO_PLAY_ADJUST_BET"; amount: number }
  | { type: "DISMISS_SESSION_REMINDER" }
  | { type: "SHOW_POST_SESSION_NUDGE" }
  | { type: "DISMISS_POST_SESSION_NUDGE" }
  | { type: "RESET_BALANCE" };

export interface PegPosition {
  x: number;
  y: number;
  row: number;
  col: number;
}

export interface BallAnimationState {
  id: string;
  path: PlinkoBallPath;
  currentRow: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number; // 0-1 for current segment
  scaleX: number;
  scaleY: number;
  trail: { x: number; y: number }[];
  done: boolean;
  slotBounce: number; // 0-1 for final bounce
  result: PlinkoBetResult;
}
