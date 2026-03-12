import type { BetResult } from "@/lib/types";

// ---------------------------------------------------------------------------
// Game phases & tile states
// ---------------------------------------------------------------------------

export type MinesPhase = "IDLE" | "PLAYING" | "GAME_OVER";
export type GameOverReason = "mine_hit" | "cashout" | "full_clear";
export type TileState =
  | "hidden"
  | "revealing"
  | "gem"
  | "mine_hit"
  | "mine_revealed"
  | "gem_faded";

// ---------------------------------------------------------------------------
// Round result (bet history entry)
// ---------------------------------------------------------------------------

export interface MinesRound extends BetResult {
  mineCount: number;
  gemsRevealed: number;
  isWin: boolean;
  minePositions: number[];
  revealOrder: number[];
}

// ---------------------------------------------------------------------------
// Session stats
// ---------------------------------------------------------------------------

export interface MinesSessionStats {
  gamesPlayed: number;
  totalWagered: number;
  totalReturns: number;
  netProfit: number;
  bestWin: { multiplier: number; profit: number } | null;
  biggestLoss: number;
  longestGemStreak: number;
  avgGemsPerGame: number;
  winRate: number;
  totalWins: number;
  currentWinStreak: number;
  bestWinStreak: number;
}

// ---------------------------------------------------------------------------
// Auto-play strategy
// ---------------------------------------------------------------------------

export type MinesStrategy =
  | "martingale"
  | "anti_martingale"
  | "dalembert"
  | "fibonacci"
  | "paroli"
  | "custom";

// ---------------------------------------------------------------------------
// Auto-play state
// ---------------------------------------------------------------------------

export interface MinesAutoPlayState {
  active: boolean;
  totalCount: number | null; // null = infinite
  currentCount: number;
  autoRevealTarget: number; // gems to reveal before auto-cashout
  strategy: MinesStrategy;
  onWin: "same" | "increase" | "decrease" | "reset";
  onLoss: "same" | "increase" | "decrease" | "reset";
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

export interface MinesGameState {
  phase: MinesPhase;
  gameOverReason: GameOverReason | null;

  // Speed mode
  speedMode: "normal" | "quick" | "instant";

  // Balance
  balance: number;

  // Configuration (locked when PLAYING)
  betAmount: number;
  mineCount: number;

  // Board state
  minePositions: number[]; // indices 0-24
  revealedTiles: number[]; // indices of revealed gems (in order)
  tileStates: TileState[]; // array of 25 tile states

  // Multiplier state
  currentMultiplier: number;
  nextMultiplier: number;
  gemsRevealed: number;
  dangerPercent: number;

  // Result
  profit: number;
  isWin: boolean | null;

  // Animation tracking
  revealingTile: number | null; // tile currently animating
  postRevealPhase: boolean; // post-game reveal in progress

  // Auto-play
  autoPlay: MinesAutoPlayState;

  // Session
  stats: MinesSessionStats;
  history: MinesRound[];
  sessionGameCount: number;
  showSessionReminder: boolean;
  showPostSessionNudge: boolean;
  postSessionNudgeDismissed: boolean;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type MinesAction =
  | { type: "SET_BET_AMOUNT"; amount: number }
  | { type: "SET_MINE_COUNT"; count: number }
  | { type: "START_GAME" }
  | { type: "REVEAL_TILE"; index: number }
  | { type: "TILE_REVEAL_COMPLETE"; index: number }
  | { type: "CASH_OUT" }
  | { type: "POST_REVEAL_START" }
  | { type: "POST_REVEAL_TILE"; index: number; state: TileState }
  | { type: "POST_REVEAL_COMPLETE" }
  | { type: "NEW_GAME" }
  | { type: "AUTO_PLAY_START"; config: Omit<MinesAutoPlayState, "active" | "currentCount" | "startingNetProfit"> }
  | { type: "AUTO_PLAY_TICK" }
  | { type: "AUTO_PLAY_STOP" }
  | { type: "AUTO_PLAY_ADJUST_BET"; amount: number }
  | { type: "SET_SPEED_MODE"; mode: "normal" | "quick" | "instant" }
  | { type: "DISMISS_SESSION_REMINDER" }
  | { type: "SHOW_POST_SESSION_NUDGE" }
  | { type: "DISMISS_POST_SESSION_NUDGE" }
  | { type: "RESET_BALANCE" };
