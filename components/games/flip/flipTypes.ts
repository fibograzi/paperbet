// ---------------------------------------------------------------------------
// Coin types
// ---------------------------------------------------------------------------

export type CoinSide = "heads" | "tails";
export type SidePick = CoinSide | "random";

// ---------------------------------------------------------------------------
// Game states
// ---------------------------------------------------------------------------

export type FlipPhase =
  | "idle"
  | "flipping"
  | "won"
  | "cashing_out"
  | "lost"
  | "auto_running";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface FlipConfig {
  betAmount: number;
  sidePick: SidePick;
  instantBet: boolean;
}

// ---------------------------------------------------------------------------
// Active streak tracking
// ---------------------------------------------------------------------------

export interface FlipStreak {
  flips: number; // current number of consecutive wins
  currentMultiplier: number;
  results: CoinSide[]; // sequence of coin results in this streak
  picks: CoinSide[]; // sequence of player picks in this streak
}

// ---------------------------------------------------------------------------
// Bet history entry
// ---------------------------------------------------------------------------

export interface FlipBetResult {
  id: string;
  amount: number;
  flipsInChain: number;
  multiplier: number;
  profit: number;
  pick: CoinSide;
  result: CoinSide;
  cashedOut: boolean; // true if player cashed out, false if lost
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Session stats
// ---------------------------------------------------------------------------

export interface FlipSessionStats {
  totalBets: number;
  totalWagered: number;
  totalReturns: number;
  netProfit: number;
  biggestWin: number;
  biggestLoss: number;
  bestMultiplier: number;
  averageCashout: number;
  winRate: number;
  totalWins: number;
  cashoutCount: number;
  currentWinStreak: number;
  bestWinStreak: number;
  longestFlipChain: number; // most consecutive flips won in one bet
  headsPicks: number;
  tailsPicks: number;
}

// ---------------------------------------------------------------------------
// Auto-play config
// ---------------------------------------------------------------------------

export interface FlipAutoPlayConfig {
  flipsPerRound: number; // 1-20
  totalCount: number | null; // null = infinite
  onWin: "reset" | "increase" | "decrease";
  onLoss: "reset" | "increase" | "decrease";
  increaseOnWinPercent: number;
  increaseOnLossPercent: number;
  baseBet: number;
  stopOnProfit: number | null;
  stopOnLoss: number | null;
}

// ---------------------------------------------------------------------------
// Auto-play progress
// ---------------------------------------------------------------------------

export interface FlipAutoPlayProgress {
  currentRound: number;
  totalRounds: number | null;
  wins: number;
  losses: number;
}

// ---------------------------------------------------------------------------
// Full game state
// ---------------------------------------------------------------------------

export interface FlipGameState {
  phase: FlipPhase;
  config: FlipConfig;
  balance: number;
  speedMode: "normal" | "quick" | "instant";
  streak: FlipStreak | null; // null when idle
  pendingResult: CoinSide | null; // predetermined result during "flipping" animation
  pendingPick: CoinSide | null; // resolved pick during "flipping" animation
  lastResult: CoinSide | null; // last coin result for display
  lastPick: CoinSide | null; // last pick for display
  history: FlipBetResult[];
  stats: FlipSessionStats;
  sessionBetCount: number;
  showSessionReminder: boolean;
  showPostSessionNudge: boolean;
  postSessionNudgeDismissed: boolean;
  showStreakNudge: boolean;
  lastStreakNudgeBet: number; // bet count at which streak nudge was last shown
  autoPlay: {
    active: boolean;
    config: FlipAutoPlayConfig | null;
    progress: FlipAutoPlayProgress | null;
    startingNetProfit: number;
  };
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type FlipAction =
  | { type: "SET_BET_AMOUNT"; amount: number }
  | { type: "SET_SIDE_PICK"; pick: SidePick }
  | { type: "SET_INSTANT_BET"; enabled: boolean }
  | { type: "FLIP_START"; coinResult: CoinSide; resolvedPick: CoinSide }
  | { type: "FLIP_RESULT" }
  | { type: "FLIP_AGAIN" }
  | { type: "CASH_OUT" }
  | { type: "CASHOUT_COMPLETE" }
  | { type: "LOSS_COMPLETE" }
  | { type: "AUTO_PLAY_START"; config: FlipAutoPlayConfig }
  | { type: "AUTO_PLAY_TICK" }
  | { type: "AUTO_PLAY_STOP" }
  | { type: "AUTO_PLAY_ADJUST_BET"; amount: number }
  | { type: "SET_SPEED_MODE"; mode: "normal" | "quick" | "instant" }
  | { type: "DISMISS_SESSION_REMINDER" }
  | { type: "SHOW_POST_SESSION_NUDGE" }
  | { type: "DISMISS_POST_SESSION_NUDGE" }
  | { type: "DISMISS_STREAK_NUDGE" }
  | { type: "RESET_BALANCE" };
