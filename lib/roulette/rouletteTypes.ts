// ---------------------------------------------------------------------------
// Wheel Types
// ---------------------------------------------------------------------------

export type WheelType = "european" | "american";

export type RouletteColor = "red" | "black" | "green";

// ---------------------------------------------------------------------------
// Pocket — single number slot on the wheel
// ---------------------------------------------------------------------------

export interface Pocket {
  number: number; // 0–36 for European; 0–36 + -1 (for 00) for American
  label: string;  // "0", "00", "1"–"36"
  color: RouletteColor;
}

// ---------------------------------------------------------------------------
// Bet types
// ---------------------------------------------------------------------------

export type BetType =
  | "straight"
  | "split"
  | "street"
  | "corner"
  | "sixLine"
  | "dozen"
  | "column"
  | "redBlack"
  | "evenOdd"
  | "highLow";

export type BetCategory = "inside" | "outside";

// ---------------------------------------------------------------------------
// Placed bet
// ---------------------------------------------------------------------------

export interface PlacedBet {
  id: string;
  type: BetType;
  amount: number;
  numbers: number[];  // Covered pocket numbers
  label: string;      // Human-readable description, e.g. "Red", "1st Dozen", "17 Straight"
}

// ---------------------------------------------------------------------------
// Spin result
// ---------------------------------------------------------------------------

export interface SpinResult {
  pocket: Pocket;
  winningNumber: number;
}

// ---------------------------------------------------------------------------
// Bet outcome (per placed bet)
// ---------------------------------------------------------------------------

export interface BetOutcome {
  bet: PlacedBet;
  won: boolean;
  payout: number;  // Total return (includes original bet if won), 0 if lost
  profit: number;  // Net profit (payout - amount)
}

// ---------------------------------------------------------------------------
// Round result (full round)
// ---------------------------------------------------------------------------

export interface RoundResult {
  id: string;
  timestamp: number;
  spinResult: SpinResult;
  bets: BetOutcome[];
  totalWagered: number;
  totalPayout: number;
  totalProfit: number;
}

// ---------------------------------------------------------------------------
// Session stats
// ---------------------------------------------------------------------------

export interface RouletteSessionStats {
  totalSpins: number;
  totalWagered: number;
  totalReturns: number;
  netProfit: number;
  biggestWin: number;
  biggestLoss: number;
  winCount: number;
  lossCount: number;
  currentStreak: number; // positive = wins, negative = losses
  bestWinStreak: number;
  bestLossStreak: number;
}

// ---------------------------------------------------------------------------
// Game phases
// ---------------------------------------------------------------------------

export type RoulettePhase = "idle" | "betting" | "spinning" | "result";

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------

export interface RouletteGameState {
  phase: RoulettePhase;
  wheelType: WheelType;
  balance: number;
  selectedChipValue: number;
  currentBets: PlacedBet[];
  previousBets: PlacedBet[];
  spinResult: SpinResult | null;
  betOutcomes: BetOutcome[];
  history: RoundResult[];
  stats: RouletteSessionStats;
  sessionSpinCount: number;
  showPostSessionNudge: boolean;
  postSessionNudgeDismissed: boolean;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type RouletteAction =
  | { type: "SET_WHEEL_TYPE"; wheelType: WheelType }
  | { type: "SET_CHIP_VALUE"; value: number }
  | { type: "PLACE_BET"; bet: Omit<PlacedBet, "id"> }
  | { type: "REMOVE_BET"; betId: string }
  | { type: "UNDO_LAST_BET" }
  | { type: "CLEAR_BETS" }
  | { type: "REPEAT_BETS" }
  | { type: "DOUBLE_BETS" }
  | { type: "SPIN" }
  | { type: "SPIN_COMPLETE"; spinResult: SpinResult; outcomes: BetOutcome[] }
  | { type: "RESULT_DISMISS" }
  | { type: "SHOW_POST_SESSION_NUDGE" }
  | { type: "DISMISS_POST_SESSION_NUDGE" }
  | { type: "RESET_BALANCE" };
