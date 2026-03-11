import type { SimulationConfig, SessionResult } from "./strategyTypes";

// ---------------------------------------------------------------------------
// Monte Carlo simulation I/O
// ---------------------------------------------------------------------------

export interface SimulationInput {
  config: SimulationConfig;
}

// ---------------------------------------------------------------------------
// Histogram bucket for final bankroll distribution
// ---------------------------------------------------------------------------

export interface HistogramBucket {
  rangeStart: number;
  rangeEnd: number;
  count: number;
  percentage: number;
}

// ---------------------------------------------------------------------------
// Aggregate statistics across all sessions
// ---------------------------------------------------------------------------

export interface SimulationSummary {
  totalSessions: number;
  avgFinalBankroll: number;
  medianFinalBankroll: number;
  avgNetProfit: number;
  medianNetProfit: number;
  avgSpins: number;
  bankruptcyRate: number;      // Percentage of sessions that went bankrupt
  profitRate: number;          // Percentage of sessions that ended in profit
  avgPeakBankroll: number;
  avgMinBankroll: number;
  maxBetSeen: number;
  avgMaxBet: number;
  avgLongestWinStreak: number;
  avgLongestLossStreak: number;
  percentile5: number;
  percentile25: number;
  percentile75: number;
  percentile95: number;
}

// ---------------------------------------------------------------------------
// Full simulation output
// ---------------------------------------------------------------------------

export interface SimulationOutput {
  config: SimulationConfig;
  sessions: SessionResult[];
  summary: SimulationSummary;
  histogram: HistogramBucket[];
  /** Sample paths (max 20) for charting — indices into sessions array */
  samplePathIndices: number[];
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Worker messages
// ---------------------------------------------------------------------------

export interface WorkerProgressMessage {
  type: "progress";
  percentage: number;
  sessionsCompleted: number;
}

export interface WorkerResultMessage {
  type: "result";
  output: SimulationOutput;
}

export interface WorkerErrorMessage {
  type: "error";
  message: string;
}

export type WorkerOutMessage = WorkerProgressMessage | WorkerResultMessage | WorkerErrorMessage;

export interface WorkerStartMessage {
  type: "start";
  input: SimulationInput;
}

export type WorkerInMessage = WorkerStartMessage;
