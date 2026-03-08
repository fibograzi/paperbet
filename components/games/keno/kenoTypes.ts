// ---------------------------------------------------------------------------
// Keno Game Types
// ---------------------------------------------------------------------------

// Phase & Speed
// ---------------------------------------------------------------------------

export type KenoPhase = "idle" | "drawing" | "result";
export type KenoDifficulty = "classic" | "low" | "medium" | "high";

// ---------------------------------------------------------------------------
// Auto-play
// ---------------------------------------------------------------------------

export type KenoAutoPlaySpeed = "normal" | "fast" | "turbo";

export interface KenoAutoPlayConfig {
  numberOfBets: number;       // 10, 25, 50, 100, Infinity
  speed: KenoAutoPlaySpeed;
  onWinAction: "reset" | "increase_percent";
  onWinValue: number;
  onLossAction: "reset" | "increase_percent";
  onLossValue: number;
  stopOnProfit: number | null;
  stopOnLoss: number | null;
}

export interface KenoAutoPlayProgress {
  currentBet: number;
  totalBets: number;
  wins: number;
  losses: number;
  sessionProfit: number;
  baseBetAmount: number;
}

// ---------------------------------------------------------------------------
// Round result
// ---------------------------------------------------------------------------

export interface KenoRound {
  id: string;
  betAmount: number;
  difficulty: KenoDifficulty;
  selectedNumbers: number[];
  drawnNumbers: number[];
  matches: number[];
  matchCount: number;
  picks: number;
  multiplier: number;
  payout: number;
  profit: number;
  isWin: boolean;             // multiplier > 0
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Session stats
// ---------------------------------------------------------------------------

export interface KenoSessionStats {
  totalBets: number;
  totalWagered: number;
  totalReturns: number;
  netProfit: number;
  bestWin: { multiplier: number; profit: number } | null;
  biggestLoss: number;
  winCount: number;
  lossCount: number;
  currentStreak: number;      // positive = win streak, negative = loss streak
  bestWinStreak: number;
  bestLossStreak: number;
  totalHits: number;          // total gems collected
  mostHitsInOneDraw: number;
  hitSum: number;             // for average hits per draw
  multiplierSum: number;      // for average multiplier
}

// ---------------------------------------------------------------------------
// Previous result (for result strip)
// ---------------------------------------------------------------------------

export interface KenoPreviousResult {
  id: string;
  matchCount: number;
  picks: number;
  multiplier: number;
  profit: number;
  isWin: boolean;
}

// ---------------------------------------------------------------------------
// Full game state
// ---------------------------------------------------------------------------

export interface KenoGameState {
  phase: KenoPhase;
  betAmount: number;
  difficulty: KenoDifficulty;
  instantBet: boolean;
  selectedNumbers: number[];
  // Draw state
  currentDraw: KenoRound | null;
  revealIndex: number;          // 0–9 during drawing, which drawn number is being revealed
  revealedNumbers: number[];    // numbers revealed so far (for animation sequencing)
  currentMatchCount: number;    // matches revealed so far
  // Result
  currentMultiplier: number | null;
  currentProfit: number | null;
  currentIsWin: boolean | null;
  // Balance
  balance: number;
  // History
  history: KenoRound[];
  previousResults: KenoPreviousResult[];
  // Stats
  stats: KenoSessionStats;
  sessionBetCount: number;
  // UI
  showSessionReminder: boolean;
  showPostSessionNudge: boolean;
  postSessionNudgeDismissed: boolean;
  maxPicksShake: boolean;       // brief shake when trying to select 11th number
  // Auto-play
  autoPlay: {
    active: boolean;
    config: KenoAutoPlayConfig | null;
    progress: KenoAutoPlayProgress | null;
    startingNetProfit: number;
  };
  autoPlayPausedForWarning: boolean;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type KenoAction =
  | { type: "SET_BET_AMOUNT"; amount: number }
  | { type: "SET_DIFFICULTY"; difficulty: KenoDifficulty }
  | { type: "SET_INSTANT_BET"; enabled: boolean }
  | { type: "TOGGLE_NUMBER"; number: number }
  | { type: "RANDOM_PICK" }
  | { type: "CLEAR_TABLE" }
  | { type: "BET" }
  | { type: "REVEAL_NUMBER"; index: number }
  | { type: "DRAW_COMPLETE" }
  | { type: "RESULT_SETTLE" }
  | { type: "MAX_PICKS_SHAKE" }
  | { type: "CLEAR_MAX_PICKS_SHAKE" }
  | { type: "AUTO_PLAY_START"; config: KenoAutoPlayConfig }
  | { type: "AUTO_PLAY_STOP" }
  | { type: "AUTO_PLAY_ADJUST"; betAmount: number }
  | { type: "DISMISS_SESSION_REMINDER" }
  | { type: "SHOW_POST_SESSION_NUDGE" }
  | { type: "DISMISS_POST_SESSION_NUDGE" }
  | { type: "SHOW_AUTO_PLAY_WARNING" }
  | { type: "DISMISS_AUTO_PLAY_WARNING" };
