// ---------------------------------------------------------------------------
// Direction & State
// ---------------------------------------------------------------------------

export type DiceDirection = "over" | "under";
export type DicePhase = "idle" | "rolling" | "result";
export type DiceAnimationSpeed = "normal" | "fast";
export type DiceAutoBetSpeed = "normal" | "fast" | "turbo";

// ---------------------------------------------------------------------------
// Auto-play adjustment types
// ---------------------------------------------------------------------------

export type DiceBetAdjustment =
  | "same"
  | "increase_percent"
  | "increase_flat"
  | "decrease_flat"
  | "reset";

export type DiceTargetAdjustment = "same" | "increase" | "decrease";

export type DiceStrategy =
  | "safe_grinder"
  | "coin_flip"
  | "sniper"
  | "moon_shot"
  | "martingale"
  | "anti_martingale"
  | "dalembert"
  | "zigzag"
  | "custom";

// ---------------------------------------------------------------------------
// Game parameters (4-way linked)
// ---------------------------------------------------------------------------

export interface DiceParameters {
  target: number;           // 0.01–99.98
  direction: DiceDirection;
  winChance: number;        // 0.01–98.00 (percentage)
  multiplier: number;       // 1.0102–9900.00
  profitOnWin: number;      // betAmount × (multiplier - 1)
}

// ---------------------------------------------------------------------------
// Round result
// ---------------------------------------------------------------------------

export interface DiceRound {
  id: string;
  betAmount: number;
  target: number;
  direction: DiceDirection;
  result: number;           // 0.00–99.99
  multiplier: number;
  winChance: number;
  isWin: boolean;
  profit: number;           // positive for win, negative (= -betAmount) for loss
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Auto-play config
// ---------------------------------------------------------------------------

export interface DiceAutoPlayConfig {
  numberOfRolls: number;    // 10, 25, 50, 100, 500, Infinity
  speed: DiceAutoBetSpeed;
  onWinBetAction: DiceBetAdjustment;
  onWinBetValue: number;
  onLossBetAction: DiceBetAdjustment;
  onLossBetValue: number;
  onWinTargetAction: DiceTargetAdjustment;
  onWinTargetValue: number;
  onLossTargetAction: DiceTargetAdjustment;
  onLossTargetValue: number;
  switchDirectionOnWin: boolean;
  switchDirectionOnLoss: boolean;
  stopOnProfit: number | null;
  stopOnLoss: number | null;
  stopOnWinStreak: number | null;
  stopOnLossStreak: number | null;
  strategy: DiceStrategy;
}

// ---------------------------------------------------------------------------
// Auto-play progress
// ---------------------------------------------------------------------------

export interface DiceAutoPlayProgress {
  currentRoll: number;
  totalRolls: number;       // Infinity for unlimited
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

export interface DiceSessionStats {
  totalRolls: number;
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
  highestRoll: number;
  lowestRoll: number;
  rollSum: number;          // for average calculation
  multiplierSum: number;    // for average multiplier
}

// ---------------------------------------------------------------------------
// Full game state
// ---------------------------------------------------------------------------

export interface DiceGameState {
  phase: DicePhase;
  params: DiceParameters;
  betAmount: number;
  animationSpeed: DiceAnimationSpeed;
  currentResult: number | null;
  currentIsWin: boolean | null;
  currentProfit: number | null;
  balance: number;
  history: DiceRound[];           // max 500, FIFO
  previousResults: DiceRound[];   // last 20 for badge row
  stats: DiceSessionStats;
  sessionRollCount: number;
  showSessionReminder: boolean;
  showPostSessionNudge: boolean;
  postSessionNudgeDismissed: boolean;
  autoPlay: {
    active: boolean;
    config: DiceAutoPlayConfig | null;
    progress: DiceAutoPlayProgress | null;
    startingNetProfit: number;
  };
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type DiceAction =
  | { type: "SET_BET_AMOUNT"; amount: number }
  | { type: "SET_ANIMATION_SPEED"; speed: DiceAnimationSpeed }
  | { type: "SET_PARAMS"; params: DiceParameters }
  | { type: "SYNC_PARAM"; field: "target" | "winChance" | "multiplier"; value: number }
  | { type: "SET_DIRECTION"; direction: DiceDirection }
  | { type: "SWAP_DIRECTION" }
  | { type: "ROLL" }
  | { type: "ROLL_COMPLETE"; result: number; isWin: boolean; profit: number; payout: number }
  | { type: "RESULT_SETTLE" }
  | { type: "AUTO_PLAY_START"; config: DiceAutoPlayConfig }
  | { type: "AUTO_PLAY_TICK" }
  | { type: "AUTO_PLAY_STOP" }
  | { type: "AUTO_PLAY_ADJUST"; betAmount: number; params: DiceParameters }
  | { type: "DISMISS_SESSION_REMINDER" }
  | { type: "SHOW_POST_SESSION_NUDGE" }
  | { type: "DISMISS_POST_SESSION_NUDGE" };
