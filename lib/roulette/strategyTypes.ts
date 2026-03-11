// ---------------------------------------------------------------------------
// Strategy state — mutable object tracked across spins
// ---------------------------------------------------------------------------

export interface StrategyState {
  /** Current step in progression (e.g., Fibonacci index, D'Alembert level) */
  step: number;
  /** Running sequence for strategies that need one (Labouchere, Fibonacci) */
  sequence: number[];
  /** Net units won/lost in current cycle */
  cycleProfit: number;
  /** Consecutive wins in current run */
  consecutiveWins: number;
  /** Consecutive losses in current run */
  consecutiveLosses: number;
}

// ---------------------------------------------------------------------------
// Strategy interface
// ---------------------------------------------------------------------------

export interface Strategy {
  id: string;
  name: string;
  description: string;
  /** Initialize fresh state for a new session */
  init(baseBet: number): StrategyState;
  /** Calculate the next bet size (in currency, not units) */
  getNextBet(state: StrategyState, baseBet: number): number;
  /** Update state after a spin outcome */
  applyOutcome(state: StrategyState, won: boolean, baseBet: number): StrategyState;
  /** Reset to initial state (for new cycle or session) */
  reset(baseBet: number): StrategyState;
}

// ---------------------------------------------------------------------------
// Custom strategy configuration (user-defined via dropdowns)
// ---------------------------------------------------------------------------

export type ProgressionAction = "same" | "double" | "add_unit" | "subtract_unit" | "reset";

export interface CustomStrategyConfig {
  onWin: ProgressionAction;
  onLoss: ProgressionAction;
  maxBetUnits: number;
  resetAfterWins: number | null;   // null = never
  resetAfterLosses: number | null; // null = never
}

// ---------------------------------------------------------------------------
// Stop conditions for simulation
// ---------------------------------------------------------------------------

export interface StopConditions {
  maxSpins: number;
  stopOnBankrupt: boolean;
  stopOnProfit: number | null;    // Stop if profit >= this amount
  stopOnLoss: number | null;      // Stop if loss >= this amount (positive number)
  maxBetLimit: number | null;     // Table limit — stop if next bet exceeds
}

// ---------------------------------------------------------------------------
// Simulation configuration
// ---------------------------------------------------------------------------

export interface SimulationConfig {
  strategyId: string;
  wheelType: "european" | "american";
  betType: "redBlack" | "evenOdd" | "highLow" | "dozen" | "column" | "straight";
  baseBet: number;
  startingBankroll: number;
  stopConditions: StopConditions;
  numberOfSessions: number; // How many independent sessions to simulate
  customConfig?: CustomStrategyConfig;
}

// ---------------------------------------------------------------------------
// Single session result
// ---------------------------------------------------------------------------

export interface SessionResult {
  finalBankroll: number;
  peakBankroll: number;
  minBankroll: number;
  totalSpins: number;
  totalWagered: number;
  netProfit: number;
  wentBankrupt: boolean;
  hitProfitTarget: boolean;
  hitLossLimit: boolean;
  hitTableLimit: boolean;
  /** Bankroll snapshot at each spin for charting */
  bankrollHistory: number[];
  maxBet: number;
  longestWinStreak: number;
  longestLossStreak: number;
}
