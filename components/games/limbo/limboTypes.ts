// ---------------------------------------------------------------------------
// Phase & Speed
// ---------------------------------------------------------------------------

export type LimboPhase = "idle" | "animating" | "result";
export type LimboAnimationSpeed = "normal" | "fast" | "skip";
export type LimboAutoBetSpeed = "normal" | "fast" | "turbo";

// ---------------------------------------------------------------------------
// Auto-play adjustment types
// ---------------------------------------------------------------------------

export type LimboBetAdjustment =
  | "same"
  | "increase_percent"
  | "increase_flat"
  | "decrease_flat"
  | "reset";

export type LimboTargetAdjustment = "same" | "increase" | "decrease";

export type LimboStrategy =
  | "safe_grinder"
  | "coin_flip"
  | "sniper"
  | "moon_shot"
  | "martingale"
  | "anti_martingale"
  | "dalembert"
  | "custom";

// ---------------------------------------------------------------------------
// Round result
// ---------------------------------------------------------------------------

export interface LimboRound {
  id: string;
  betAmount: number;
  targetMultiplier: number;
  resultMultiplier: number;
  winChance: number;
  isWin: boolean;
  profit: number;           // positive for win, negative (= -betAmount) for loss
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Auto-play config
// ---------------------------------------------------------------------------

export interface LimboAutoPlayConfig {
  numberOfBets: number;     // 10, 25, 50, 100, 500, Infinity
  speed: LimboAutoBetSpeed;
  onWinBetAction: LimboBetAdjustment;
  onWinBetValue: number;
  onLossBetAction: LimboBetAdjustment;
  onLossBetValue: number;
  onWinTargetAction: LimboTargetAdjustment;
  onWinTargetValue: number;
  onLossTargetAction: LimboTargetAdjustment;
  onLossTargetValue: number;
  stopOnProfit: number | null;
  stopOnLoss: number | null;
  stopOnWinMultiplier: number | null;
  strategy: LimboStrategy;
}

// ---------------------------------------------------------------------------
// Auto-play progress
// ---------------------------------------------------------------------------

export interface LimboAutoPlayProgress {
  currentBet: number;
  totalBets: number;        // Infinity for unlimited
  wins: number;
  losses: number;
  currentWinStreak: number;
  currentLossStreak: number;
  sessionProfit: number;
  baseBetAmount: number;
}

// ---------------------------------------------------------------------------
// Session stats
// ---------------------------------------------------------------------------

export interface LimboSessionStats {
  totalBets: number;
  totalWagered: number;
  totalReturns: number;
  netProfit: number;
  bestWin: { multiplier: number; profit: number } | null;
  biggestLoss: number;
  winCount: number;
  lossCount: number;
  currentStreak: number;    // positive = win streak, negative = loss streak
  bestWinStreak: number;
  bestLossStreak: number;
  highestResult: number;
  lowestResult: number;
  resultSum: number;        // for average calculation
  targetSum: number;        // for average target
}

// ---------------------------------------------------------------------------
// Full game state
// ---------------------------------------------------------------------------

export interface LimboGameState {
  phase: LimboPhase;
  betAmount: number;
  targetMultiplier: number;
  winChance: number;
  animationSpeed: LimboAnimationSpeed;
  currentResult: number | null;
  currentIsWin: boolean | null;
  currentProfit: number | null;
  balance: number;
  history: LimboRound[];           // max 500, FIFO
  previousResults: LimboRound[];   // last 20 for badge row
  stats: LimboSessionStats;
  sessionBetCount: number;
  showSessionReminder: boolean;
  showPostSessionNudge: boolean;
  postSessionNudgeDismissed: boolean;
  autoPlay: {
    active: boolean;
    config: LimboAutoPlayConfig | null;
    progress: LimboAutoPlayProgress | null;
    startingNetProfit: number;
  };
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type LimboAction =
  | { type: "SET_BET_AMOUNT"; amount: number }
  | { type: "SET_ANIMATION_SPEED"; speed: LimboAnimationSpeed }
  | { type: "SET_TARGET"; target: number }
  | { type: "SET_WIN_CHANCE"; winChance: number }
  | { type: "BET" }
  | { type: "BET_COMPLETE"; result: number; isWin: boolean; profit: number; payout: number }
  | { type: "RESULT_SETTLE" }
  | { type: "AUTO_PLAY_START"; config: LimboAutoPlayConfig }
  | { type: "AUTO_PLAY_STOP" }
  | { type: "AUTO_PLAY_ADJUST"; betAmount: number; targetMultiplier: number; winChance: number }
  | { type: "DISMISS_SESSION_REMINDER" }
  | { type: "SHOW_POST_SESSION_NUDGE" }
  | { type: "DISMISS_POST_SESSION_NUDGE" };
