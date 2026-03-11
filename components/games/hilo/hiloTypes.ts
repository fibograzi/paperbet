// ---------------------------------------------------------------------------
// Card types
// ---------------------------------------------------------------------------

export type Suit = "diamonds" | "hearts" | "spades" | "clubs";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";
export type Prediction = "higher" | "lower";
export type SuitColor = "red" | "black";

export interface PlayingCard {
  rank: Rank;
  suit: Suit;
  index: number; // 0-51 card index
  rankValue: number; // 1 (A) through 13 (K)
  suitColor: SuitColor; // "red" for ♦♥, "black" for ♠♣
}

// ---------------------------------------------------------------------------
// Game states
// ---------------------------------------------------------------------------

export type HiLoPhase =
  | "idle"
  | "dealing"
  | "predicting"
  | "revealing"
  | "skipping"
  | "cashing_out"
  | "lost";

export type AutoStrategy = "always_higher" | "always_lower" | "smart";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface HiLoConfig {
  betAmount: number;
  instantBet: boolean;
}

// ---------------------------------------------------------------------------
// Round prediction step
// ---------------------------------------------------------------------------

export interface RoundPrediction {
  card: PlayingCard; // the card that was shown
  prediction: Prediction | "skip"; // what the player chose
  nextCard: PlayingCard; // the card that was revealed (or skipped-to)
  correct: boolean | null; // null for skips
  multiplier: number; // individual round multiplier (0 for skips)
}

// ---------------------------------------------------------------------------
// Active round tracking
// ---------------------------------------------------------------------------

export interface HiLoRound {
  startCard: PlayingCard;
  predictions: RoundPrediction[];
  currentCard: PlayingCard;
  cumulativeMultiplier: number;
  skipsUsed: number;
  correctPredictions: number;
}

// ---------------------------------------------------------------------------
// Prediction info for current card
// ---------------------------------------------------------------------------

export interface HiLoPredictionInfo {
  higherProbability: number; // e.g. 0.6154 (61.54%)
  lowerProbability: number; // e.g. 0.4615 (46.15%)
  higherMultiplier: number; // e.g. 1.61
  lowerMultiplier: number; // e.g. 2.15
  higherAvailable: boolean; // false on King
  lowerAvailable: boolean; // false on Ace
}

// ---------------------------------------------------------------------------
// Bet history entry
// ---------------------------------------------------------------------------

export interface HiLoBetResult {
  id: string;
  amount: number;
  roundCount: number; // number of correct predictions
  cumulativeMultiplier: number;
  profit: number;
  startCard: PlayingCard;
  endCard: PlayingCard;
  cashedOut: boolean;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Session stats
// ---------------------------------------------------------------------------

export interface HiLoSessionStats {
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
  longestChain: number; // longest prediction chain in single round
  totalPredictions: number;
  totalSkips: number;
  higherPicks: number;
  lowerPicks: number;
}

// ---------------------------------------------------------------------------
// Auto-play config
// ---------------------------------------------------------------------------

export interface HiLoAutoPlayConfig {
  strategy: AutoStrategy;
  cashOutAt: number; // cash out at cumulative multiplier
  totalCount: number | null; // null = infinite
  onWin: "reset" | "increase";
  onLoss: "reset" | "increase";
  increaseOnWinPercent: number;
  increaseOnLossPercent: number;
  baseBet: number;
  stopOnProfit: number | null;
  stopOnLoss: number | null;
}

// ---------------------------------------------------------------------------
// Auto-play progress
// ---------------------------------------------------------------------------

export interface HiLoAutoPlayProgress {
  currentRound: number;
  totalRounds: number | null;
  wins: number;
  losses: number;
}

// ---------------------------------------------------------------------------
// Full game state
// ---------------------------------------------------------------------------

export interface HiLoGameState {
  phase: HiLoPhase;
  config: HiLoConfig;
  balance: number;
  round: HiLoRound | null;
  history: HiLoBetResult[];
  stats: HiLoSessionStats;
  sessionBetCount: number;
  showSessionReminder: boolean;
  showPostSessionNudge: boolean;
  postSessionNudgeDismissed: boolean;
  autoPlay: {
    active: boolean;
    config: HiLoAutoPlayConfig | null;
    progress: HiLoAutoPlayProgress | null;
    startingNetProfit: number;
  };
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type HiLoAction =
  | { type: "SET_BET_AMOUNT"; amount: number }
  | { type: "SET_INSTANT_BET"; enabled: boolean }
  | { type: "PLACE_BET" }
  | { type: "DEAL_COMPLETE"; card: PlayingCard }
  | { type: "PREDICT"; prediction: Prediction }
  | { type: "REVEAL_COMPLETE"; newCard: PlayingCard; correct: boolean; multiplier: number; prediction: Prediction }
  | { type: "SKIP" }
  | { type: "SKIP_COMPLETE"; newCard: PlayingCard }
  | { type: "CASH_OUT" }
  | { type: "CASHOUT_COMPLETE" }
  | { type: "LOSS_COMPLETE" }
  | { type: "AUTO_PLAY_START"; config: HiLoAutoPlayConfig }
  | { type: "AUTO_PLAY_TICK" }
  | { type: "AUTO_PLAY_STOP" }
  | { type: "AUTO_PLAY_ADJUST_BET"; amount: number }
  | { type: "DISMISS_SESSION_REMINDER" }
  | { type: "SHOW_POST_SESSION_NUDGE" }
  | { type: "DISMISS_POST_SESSION_NUDGE" }
  | { type: "RESET_BALANCE" };
